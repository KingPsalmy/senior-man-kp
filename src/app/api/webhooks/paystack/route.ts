import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true })
    }

    const { reference, amount, customer, metadata } = event.data
    const email = customer.email
    const guestId = metadata?.guest_id
    const items = metadata?.items ?? []
    const total = amount / 100

    // Idempotency check
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("paystack_reference", reference)
      .single()

    if (existingOrder) {
      return NextResponse.json({ received: true })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        guest_id: guestId,
        email,
        paystack_reference: reference,
        status: "paid",
        subtotal: metadata?.subtotal ?? total,
        discount: metadata?.discount ?? 0,
        total,
        items,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation failed:", orderError)
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
    }

    // Handle exclusive beats
    for (const item of items) {
      if (item.license_type === "exclusive") {
        await supabase
          .from("beats")
          .update({ is_exclusive_sold: true, is_published: false })
          .eq("id", item.beat_id)

        // Notify users who favorited this beat
        const { data: favUsers } = await supabase
          .from("favorites")
          .select("guest_id")
          .eq("beat_id", item.beat_id)

        if (favUsers?.length) {
          const guestIds = favUsers.map((f) => f.guest_id)
          const { data: guests } = await supabase
            .from("guests")
            .select("email")
            .in("guest_id", guestIds)
            .not("email", "is", null)

          await Promise.all(
            (guests ?? [])
              .filter((g) => g.email && g.email !== email)
              .map((g) =>
                resend.emails.send({
                  from: "Senior Man KP <noreply@seniormankp.com>",
                  to: g.email,
                  subject: `"${item.title}" has been purchased exclusively`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <p>Hi there,</p>
                      <p>A beat you favorited — <strong>${item.title}</strong> — has been purchased exclusively and is no longer available.</p>
                      <p>Your existing license (if any) remains valid.</p>
                      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/store" style="color: #C9A84C;">Browse Similar Beats</a></p>
                      <p>— Senior Man KP</p>
                    </div>
                  `,
                })
              )
          )
        }
      }
    }

    // Generate download tokens per item and save to purchases table
    const downloadTokens: Record<string, string> = {}

    for (const item of items) {
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
    }

    // Save download tokens to order record
    await supabase
      .from("orders")
      .update({ download_tokens: downloadTokens })
      .eq("id", order.id)

    // Send receipt email — links to /my-downloads portal
    const myDownloadsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/my-downloads`

    await resend.emails.send({
      from: "Senior Man KP <noreply@seniormankp.com>",
      to: email,
      subject: "Your beats are ready — Senior Man KP",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; padding: 40px; border-radius: 8px;">
          <h2 style="color: #C9A84C; margin-bottom: 8px;">Payment Confirmed ✓</h2>
          <p style="color: #aaa; margin-bottom: 32px;">Hi ${metadata?.name ?? "there"},<br/>Thank you for your purchase. Here's your order summary:</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            ${items.map((item: any) => `
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 12px 0; color: #F5F0E8; font-size: 14px;">${item.title}</td>
                <td style="padding: 12px 0; color: #888; text-transform: uppercase; font-size: 11px;">${LICENSE_LABELS[item.license_type] ?? item.license_type}</td>
                <td style="padding: 12px 0; color: #C9A84C; text-align: right; font-size: 14px; font-weight: bold;">
                  ₦${(LICENSE_PRICES[item.license_type] ?? 0).toLocaleString()}
                </td>
              </tr>
            `).join("")}
          </table>

          ${(metadata?.discount ?? 0) > 0 ? `
            <p style="color: #4ade80; font-size: 14px;">Bundle Discount: -₦${Number(metadata.discount).toLocaleString()}</p>
          ` : ""}

          <p style="color: #C9A84C; font-size: 20px; font-weight: bold; margin-bottom: 32px;">
            Total: ₦${total.toLocaleString()}
          </p>

          <div style="background: #141414; border: 1px solid #C9A84C33; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="color: #aaa; font-size: 14px; margin-bottom: 16px;">Access your downloads anytime using your email address:</p>
            <a href="${myDownloadsUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #F5D98B); color: #000; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">
              Access My Downloads
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 12px;">${myDownloadsUrl}</p>
          </div>

          <p style="color: #555; font-size: 12px; line-height: 1.8;">
            Credit: Prod. by Senior Man KP<br/>
            Questions? Contact us at <a href="mailto:contact@seniormankp.com" style="color: #C9A84C;">contact@seniormankp.com</a>
          </p>
        </div>
      `,
    })

    // Clear cart
    if (guestId) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("guest_id", guestId)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}