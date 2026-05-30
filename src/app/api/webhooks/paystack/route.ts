import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { supabase } from "@/lib/supabase"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Only handle successful charges
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true })
    }

    const { reference, amount, customer, metadata } = event.data
    const email = customer.email
    const guestId = metadata?.guest_id
    const items = metadata?.items ?? []
    const total = amount / 100

    // Check if order already exists (prevent duplicate processing)
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

        // Get emails for guests who have them
        if (favUsers?.length) {
          const guestIds = favUsers.map((f) => f.guest_id)
          const { data: guests } = await supabase
            .from("guests")
            .select("email")
            .in("guest_id", guestIds)
            .not("email", "is", null)

          for (const guest of guests ?? []) {
            if (guest.email && guest.email !== email) {
              await resend.emails.send({
                from: "Senior Man KP <noreply@seniormanKP.com>",
                to: guest.email,
                subject: `"${item.title}" has been purchased exclusively`,
                html: `
                  <p>Hi there,</p>
                  <p>A beat you favorited — <strong>${item.title}</strong> — has been purchased exclusively and is no longer available.</p>
                  <p>Your existing license (if any) remains valid. We recommend checking out similar beats in our store.</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/store">Browse Similar Beats</a>
                  <p>— Senior Man KP</p>
                `,
              })
            }
          }
        }
      }
    }

    // Generate signed download URLs
    const downloadLinks: Record<string, string> = {}
    for (const item of items) {
      const paths: string[] = []

      if (["basic", "premium", "exclusive"].includes(item.license_type)) {
        paths.push(`beats/${item.beat_id}/wav`)
      }
      if (["premium", "exclusive"].includes(item.license_type)) {
        paths.push(`beats/${item.beat_id}/stems`)
      }

      for (const path of paths) {
        const { data: signedUrl } = await supabase.storage
          .from("beat-files")
          .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days

        if (signedUrl) {
          downloadLinks[`${item.beat_id}_${item.license_type}`] = signedUrl.signedUrl
        }
      }
    }

    // Send receipt + download email
    await resend.emails.send({
      from: "Senior Man KP <noreply@seniormanKP.com>",
      to: email,
      subject: "Your beats are ready — Senior Man KP",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C9A84C;">Payment Confirmed ✓</h2>
          <p>Hi ${metadata?.name ?? "there"},</p>
          <p>Thank you for your purchase. Here's your order summary:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            ${items.map((item: any) => `
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 12px 0; color: #F5F0E8;">${item.title}</td>
                <td style="padding: 12px 0; color: #888; text-transform: uppercase; font-size: 12px;">${item.license_type}</td>
                <td style="padding: 12px 0; color: #C9A84C; text-align: right;">
                  ₦${({ basic: 30000, premium: 70000, exclusive: 150000 }[item.license_type as string] ?? 0).toLocaleString()}
                </td>
              </tr>
            `).join("")}
          </table>

          <p style="color: #C9A84C; font-size: 18px; font-weight: bold;">
            Total: ₦${total.toLocaleString()}
          </p>

          <h3 style="color: #C9A84C; margin-top: 32px;">Download Your Files</h3>
          ${Object.entries(downloadLinks).map(([key, url]) => `
            <p>
              <a href="${url}" style="color: #C9A84C;">
                Download ${key.replace("_", " — ")}
              </a>
              <span style="color: #888; font-size: 12px;"> (expires in 7 days)</span>
            </p>
          `).join("")}

          <p style="color: #888; margin-top: 32px; font-size: 13px;">
            Credit: Prod. by Senior Man KP<br/>
            Questions? Reply to this email or contact kingpsalmyofficial@gmail.com
          </p>
        </div>
      `,
    })

    // Clear cart
    await supabase
      .from("cart_items")
      .delete()
      .eq("guest_id", guestId)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}