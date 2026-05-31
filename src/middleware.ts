import { NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = process.env.ADMIN_SECRET_KEY!

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}