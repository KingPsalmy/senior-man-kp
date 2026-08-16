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

    // Look up the purchase — this gives us beat_id, customer_email, and license_type
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*, beats(title, is_exclusive_sold)")
      .eq("id", purchase_id)
      .eq("payment_status", "success")
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    const { beat_id, customer_email, license_type: current_license_type, beats: beat } = purchase

    if (current_license_type === "exclusive") {
      return NextResponse.json({ error: "This is already an exclusive license" }, { status: 400 })
    }

    if (beat?.is_exclusive_sold) {
      return NextResponse.json({ error: "This beat has already been sold exclusively" }, { status: 400 })
    }

    // Check for an existing pending request to avoid duplicates
    const { data: existingRequest } = await supabase
      .from("upgrade_requests")
      .select("id")
      .eq("beat_id", beat_id)
      .eq("customer_email", customer_email)
      .eq("status", "pending")
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request for this beat" }, { status: 400 })
    }

    const priceDifference = LICENSE_PRICES.exclusive - LICENSE_PRICES[current_license_type]

    const { error: insertError } = await supabase.from("upgrade_requests").insert({
      beat_id,
      customer_email,
      current_license_type,
      price_difference: priceDifference,
      status: "pending",
    })

    if (insertError) {
      console.error("[upgrade request insert error]", insertError)
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 })
    }

    try {
      const { subject, html } = upgradeRequestNotificationEmail({
        beatTitle: beat?.title ?? "your beat",
        customerEmail: customer_email,
        currentLicenseType: current_license_type,
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

    return NextResponse.json({ success: true, priceDifference })
  } catch (err) {
    console.error("[request-upgrade error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}