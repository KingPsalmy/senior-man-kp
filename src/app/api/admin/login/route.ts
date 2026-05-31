import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// In-memory store for the session token
// Simple but effective for a single-admin setup
let currentSessionToken: string | null = null

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  // Generate a random token — never store the password itself
  const sessionToken = randomBytes(32).toString("hex")
  currentSessionToken = sessionToken

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

// Export so middleware can access it
export { currentSessionToken }