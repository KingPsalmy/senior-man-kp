import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // Redirect the auto-generated Vercel domain to the real domain
  if (hostname.endsWith(".vercel.app")) {
    const url = req.nextUrl.clone()
    url.hostname = "www.seniormankp.com"
    url.protocol = "https"
    url.port = ""
    return NextResponse.redirect(url, 308)
  }

  if (pathname === "/admin/login") {
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
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}