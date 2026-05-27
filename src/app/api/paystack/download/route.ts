import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 })
  }

  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*, beats(*)")
    .eq("download_token", token)
    .eq("payment_status", "success")
    .single()

  if (error || !purchase) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })
  }

  if (new Date(purchase.download_expires_at) < new Date()) {
    return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
  }

  return NextResponse.json({
    beat: purchase.beats,
    license_type: purchase.license_type,
    customer_email: purchase.customer_email,
    download_expires_at: purchase.download_expires_at,
  })
}