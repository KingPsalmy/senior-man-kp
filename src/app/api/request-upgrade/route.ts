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
    const { beat_id, customer_email, current_license_type } = await req.json()

    if (!beat_id || !customer_email || !current_license_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (current_license_type === "exclusive") {
      return NextResponse.json({ error: "This is already an exclusive license" }, { status: 400 })
    }

    // Confirm this customer actually owns this beat at this license type
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("beat_id", beat_id)
      .eq("customer_email", customer_email)
      .eq("license_type", current_license_type)
      .eq("payment_status", "success")
      .maybeSingle()

    if (!existingPurchase) {
      return NextResponse.json({ error: "No matching purchase found" }, { status: 403 })
    }

    // Confirm the beat hasn't already been sold exclusively to someone else
    const { data: beat } = await supabase
      .from("beats")
      .select("title, is_exclusive_sold")
      .eq("id", beat_id)
      .single()

    if (!beat) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 })
    }

    if (beat.is_exclusive_sold) {
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
        beatTitle: beat.title,
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
