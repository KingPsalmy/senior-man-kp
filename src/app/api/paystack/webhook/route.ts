import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import { generateDownloadToken } from "@/lib/utils"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  // Verify webhook signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === "charge.success") {
    const { reference, metadata } = event.data

    const downloadToken = generateDownloadToken()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    await supabase
      .from("purchases")
      .update({
        payment_status: "success",
        download_token: downloadToken,
        download_expires_at: expiresAt,
      })
      .eq("paystack_reference", reference)
  }

  return NextResponse.json({ received: true })
}