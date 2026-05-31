import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const sessionToken = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  })

  return res
}