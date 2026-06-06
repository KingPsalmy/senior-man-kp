import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const TEST_EMAIL = "kingpsalmyofficial@gmail.com"

const LICENSE_PRICES: Record<string, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

const LICENSE_LABELS: Record<string, string> = {
  basic: "Basic License",
  premium: "Premium License",
  unlimited: "Unlimited License",
  exclusive: "Exclusive License",
}

type CartItem = {
  beat_id: string
  title: string
  license_type: string
}

export async function POST(req: NextRequest) {
  try {
    const { email, guest_id, items, subtotal, discount, total, name } = await req.json()

    if (email.toLowerCase() !== TEST_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const reference = "TEST_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8).toUpperCase()

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        guest_id,
        email,
        paystack_reference: reference,
        status: "paid",
        subtotal,
        discount,
        total,
        items,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Test order creation failed:", orderError)
      return NextResponse.json({ error: "Failed to create test order" }, { status: 500 })
    }

    const downloadTokens: Record<string, string> = {}

    for (const item of items as CartItem[]) {
      const downloadToken = crypto.randomUUID()
      downloadTokens[item.beat_id] = downloadToken

      await supabase.from("purchases").upsert({
        beat_id: item.beat_id,
        customer_email: email,
        license_type: item.license_type,
        amount_paid: LICENSE_PRICES[item.license_type] ?? 0,
        paystack_reference: reference,
        payment_status: "success",
        download_token: downloadToken,
        download_expires_at: null,
      }, { onConflict: "paystack_reference,beat_id" })

      if (item.license_type === "exclusive") {
        await supabase
          .from("beats")
          .update({ is_exclusive_sold: true, is_published: false, status: "sold_exclusive", locked_at: null })
          .eq("id", item.beat_id)
      }
    }

    await supabase
      .from("orders")
      .update({ download_tokens: downloadTokens })
      .eq("id", order.id)

    if (guest_id) {
      await supabase.from("cart_items").delete().eq("guest_id", guest_id)
    }

    const myDownloadsUrl = process.env.NEXT_PUBLIC_SITE_URL + "/my-downloads"

    await resend.emails.send({
      from: "Senior Man KP <onboarding@resend.dev>",
      to: email,
      subject: "[TEST ORDER] Your beats are ready",
      html: "<p>Test order confirmed. <a href='" + myDownloadsUrl + "'>Access your downloads</a></p>",
    })

    return NextResponse.json({ success: true, reference })

  } catch (err) {
    console.error("[test-order error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
