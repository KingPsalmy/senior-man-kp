import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { upgradeRequestNotificationEmail } from "@/lib/emails/upgrade-request-notification"

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
  try {
    const { purchase_id } = await req.json()

    if (!purchase_id) {
      return NextResponse.json({ error: "Missing purchase_id" }, { status: 400 })
    }

    // Look up the purchase — never trust price/license data from the client
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, beat_id, customer_email, license_type, payment_status")
      .eq("id", purchase_id)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    if (purchase.payment_status !== "success") {
      return NextResponse.json({ error: "Purchase is not valid" }, { status: 400 })
    }

    if (purchase.license_type === "exclusive") {
      return NextResponse.json({ error: "This beat is already licensed exclusively to you" }, { status: 400 })
    }

    // Confirm the beat hasn't already been sold exclusively to someone else
    const { data: beat, error: beatError } = await supabase
      .from("beats")
      .select("id, title, is_exclusive_sold")
      .eq("id", purchase.beat_id)
      .single()

    if (beatError || !beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 })
    }

    if (beat.is_exclusive_sold) {
      return NextResponse.json({ error: "This beat has already been sold exclusively" }, { status: 400 })
    }

    // Avoid duplicate pending requests for the same purchase
    const { data: existingRequest } = await supabase
      .from("upgrade_requests")
      .select("id, status")
      .eq("purchase_id", purchase_id)
      .eq("status", "pending")
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: "You already have a pending upgrade request for this beat. We'll be in touch.",
      })
    }

    const currentPrice = LICENSE_PRICES[purchase.license_type] ?? 0
    const priceDifference = LICENSE_PRICES.exclusive - currentPrice

    const { error: insertError } = await supabase
      .from("upgrade_requests")
      .insert({
        purchase_id: purchase.id,
        beat_id: purchase.beat_id,
        customer_email: purchase.customer_email,
        current_license: purchase.license_type,
        price_difference: priceDifference,
        status: "pending",
      })

    if (insertError) {
      console.error("[request-upgrade] insert failed:", insertError)
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }

    // Notify admin — fire and forget, don't fail the request if email fails
    try {
      const { subject, html } = upgradeRequestNotificationEmail({
        beatTitle: beat.title,
        customerEmail: purchase.customer_email,
        currentLicense: purchase.license_type,
        priceDifference,
      })

      await resend.emails.send({
        from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL}>`,
        to: process.env.ADMIN_NOTIFICATION_EMAIL!,
        subject,
        html,
      })
    } catch (emailErr) {
      console.error("[upgrade request notification email error]", emailErr)
    }

    return NextResponse.json({
      success: true,
      message: "Upgrade request sent! We'll reach out with payment details shortly.",
    })
  } catch (err) {
    console.error("[request-upgrade error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
