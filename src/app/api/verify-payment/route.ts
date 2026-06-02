import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LICENSE_PRICES: Record<string, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export async function POST(req: NextRequest) {
  const { reference, customer_email } = await req.json()

  if (!reference || !customer_email) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    )
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
      return NextResponse.json(
        { success: false, error: "Payment not successful" },
        { status: 400 }
      )
    }

    const { metadata, amount, customer } = paystackData.data
    const { beat_id, beat_title, license_type } = metadata

    // Verify email matches — prevents reference hijacking
    if (customer.email.toLowerCase() !== customer_email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Verify license type is valid
    if (!LICENSE_PRICES[license_type]) {
      return NextResponse.json(
        { success: false, error: "Invalid license type" },
        { status: 400 }
      )
    }

    // Verify beat exists and is still available
    const { data: beat, error: beatError } = await supabase
      .from("beats")
      .select("id, title, is_published, is_exclusive_sold, basic_price, premium_price, unlimited_price, exclusive_price")
      .eq("id", beat_id)
      .single()

    if (beatError || !beat) {
      return NextResponse.json(
        { success: false, error: "Invalid beat" },
        { status: 400 }
      )
    }

    if (!beat.is_published) {
      return NextResponse.json(
        { success: false, error: "Beat is no longer available" },
        { status: 400 }
      )
    }

    if (beat.is_exclusive_sold && license_type !== "exclusive") {
      return NextResponse.json(
        { success: false, error: "Beat has been sold exclusively" },
        { status: 400 }
      )
    }

    // Verify amount matches database price — never trust frontend
    const priceMap: Record<string, number> = {
      basic: Number(beat.basic_price),
      premium: Number(beat.premium_price),
      unlimited: Number(beat.unlimited_price),
      exclusive: Number(beat.exclusive_price),
    }

    const expectedAmount = priceMap[license_type] * 100 // kobo
    if (amount !== expectedAmount) {
      return NextResponse.json(
        { success: false, error: "Amount mismatch" },
        { status: 400 }
      )
    }

    // Idempotency check
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("paystack_reference", reference)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, purchase: existing })
    }

    // Generate download token — no expiry, customer uses /my-downloads
    const downloadToken = crypto.randomUUID()

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
        download_expires_at: null,
      })
      .select()
      .single()

    if (error) throw error

    // If exclusive — mark beat as sold
    if (license_type === "exclusive") {
      await supabase
        .from("beats")
        .update({ is_exclusive_sold: true, is_published: false })
        .eq("id", beat_id)
    }

    return NextResponse.json({
      success: true,
      purchase: { ...purchase, beat_title },
    })

  } catch (err) {
    console.error("[verify-payment error]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please contact support." },
      { status: 500 }
    )
  }
}