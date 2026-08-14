import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

// Allowed test/bypass emails — each gets exactly ONE free beat, ever.
const ALLOWED_EMAILS = [
  "kingpsalmyofficial@gmail.com",
  "ghostedtife@gmail.com",
]

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

    const normalizedEmail = (email ?? "").toLowerCase().trim()

    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    // Each allowed email gets exactly one free beat, ever.
    // Enforce two things: (1) they haven't already used their bypass before,
    // and (2) they're not trying to check out more than one beat right now.
    const { data: existingPurchases, error: existingError } = await supabase
      .from("purchases")
      .select("id")
      .eq("customer_email", normalizedEmail)
      .limit(1)

    if (existingError) {
      console.error("Test order lookup failed:", existingError)
      return NextResponse.json({ error: "Failed to verify eligibility" }, { status: 500 })
    }

    if (existingPurchases && existingPurchases.length > 0) {
      return NextResponse.json(
        { error: "This account has already used its free beat." },
        { status: 403 }
      )
    }

    if ((items as CartItem[]).length > 1) {
      return NextResponse.json(
        { error: "Only one free beat is allowed per account. Please remove extra items from your cart." },
        { status: 400 }
      )
    }

    const reference = `TEST_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        guest_id,
        email: normalizedEmail,
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

      await supabase.from("purchases").upsert(
        {
          beat_id: item.beat_id,
          customer_email: normalizedEmail,
          license_type: item.license_type,
          amount_paid: LICENSE_PRICES[item.license_type] ?? 0,
          paystack_reference: reference,
          payment_status: "success",
          download_token: downloadToken,
          download_expires_at: null,
        },
        { onConflict: "paystack_reference,beat_id" }
      )

      if (item.license_type === "exclusive") {
        await supabase
          .from("beats")
          .update({
            is_exclusive_sold: true,
            is_published: false,
            status: "sold_exclusive",
            locked_at: null,
          })
          .eq("id", item.beat_id)
      }
    }

    await supabase.from("orders").update({ download_tokens: downloadTokens }).eq("id", order.id)

    if (guest_id) {
      await supabase.from("cart_items").delete().eq("guest_id", guest_id)
    }

    const myDownloadsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/my-downloads`

    await resend.emails.send({
      from: "Senior Man KP <noreply@seniormankp.com>",
      to: normalizedEmail,
      subject: "[TEST ORDER] Your beats are ready — Senior Man KP",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; padding: 40px; border-radius: 8px;">
          <div style="background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4); border-radius: 4px; padding: 10px 16px; margin-bottom: 24px;">
            <p style="color: #C9A84C; font-size: 12px; margin: 0; font-family: monospace;">TEST ORDER — No real payment was made</p>
          </div>
          <h2 style="color: #C9A84C; margin-bottom: 8px;">Payment Confirmed ✓</h2>
          <p style="color: #aaa; margin-bottom: 32px;">Hi ${name ?? "there"},<br/>Here is your test order summary:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            ${(items as CartItem[])
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 12px 0; color: #F5F0E8; font-size: 14px;">${item.title}</td>
                <td style="padding: 12px 0; color: #888; text-transform: uppercase; font-size: 11px;">${LICENSE_LABELS[item.license_type] ?? item.license_type}</td>
                <td style="padding: 12px 0; color: #C9A84C; text-align: right; font-size: 14px; font-weight: bold;">₦${(LICENSE_PRICES[item.license_type] ?? 0).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          <p style="color: #C9A84C; font-size: 20px; font-weight: bold; margin-bottom: 32px;">Total: ₦${total.toLocaleString()}</p>
          <div style="background: #141414; border: 1px solid #C9A84C33; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="color: #aaa; font-size: 14px; margin-bottom: 16px;">Access your downloads anytime:</p>
            <a href="${myDownloadsUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #F5D98B); color: #000; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Access My Downloads</a>
          </div>
          <p style="color: #555; font-size: 12px;">Questions? Contact us at <a href="mailto:contact@seniormankp.com" style="color: #C9A84C;">contact@seniormankp.com</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, reference })
  } catch (err) {
    console.error("[test-order error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
