import { NextRequest, NextResponse } from "next/server"
import { currentSessionToken } from "@/app/api/admin/login/route"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Don't protect the login page itself
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value

    if (!token || token !== currentSessionToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}