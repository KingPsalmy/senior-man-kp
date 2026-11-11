import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // Redirect the auto-generated Vercel domain to the real domain
  if (process.env.VERCEL_ENV === "production" && hostname.endsWith(".vercel.app")) {
    const url = req.nextUrl.clone()
    url.hostname = "www.seniormankp.com"
    url.protocol = "https"
    url.port = ""
    return NextResponse.redirect(url, 308)
  }

  if (pathname === "/admin/login" || pathname === "/admin/auth/callback") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    const { data: admin, error: adminError } = await supabase.from("admin_users").select("id").eq("email", user.email!).maybeSingle()
    if (adminError || !admin) return NextResponse.redirect(new URL("/admin/login", req.url))
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
