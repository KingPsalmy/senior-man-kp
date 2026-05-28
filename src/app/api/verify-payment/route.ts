import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ success: false, error: "No reference" }, { status: 400 })
  }

  try {
    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const paystackData = await paystackRes.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment not successful" }, { status: 400 })
    }

    const { metadata, amount, customer } = paystackData.data
    const { beat_id, beat_title, license_type } = metadata

    // Check if purchase already exists
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("paystack_reference", reference)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, purchase: existing })
    }

    // Create download token
    const downloadToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    // Save purchase
    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert({
        beat_id,
        customer_email: customer.email,
        license_type,
        amount_paid: amount / 100,
        paystack_reference: reference,
        payment_status: "success",
        download_token: downloadToken,
        download_expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      purchase: { ...purchase, beat_title },
    })

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}