import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { refundConfirmationEmail } from "@/lib/emails/refund-confirmation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (!token) return false
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return false
  return true
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { paystack_reference, beat_id } = await req.json()

    if (!paystack_reference || !beat_id) {
      return NextResponse.json({ error: "Missing paystack_reference or beat_id" }, { status: 400 })
    }

    const { data: purchase, error: fetchError } = await supabase
      .from("purchases")
      .select("*, beats(title)")
      .eq("paystack_reference", paystack_reference)
      .eq("beat_id", beat_id)
      .single()

    if (fetchError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    if (purchase.payment_status === "refunded") {
      return NextResponse.json({ error: "Already refunded" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("purchases")
      .update({ payment_status: "refunded" })
      .eq("id", purchase.id)

    if (updateError) {
      console.error("Refund update failed:", updateError)
      return NextResponse.json({ error: "Failed to mark refund" }, { status: 500 })
    }

    // If this was an exclusive purchase, restore the beat to the store
    if (purchase.license_type === "exclusive") {
      await supabase
        .from("beats")
        .update({ is_exclusive_sold: false, is_published: true })
        .eq("id", purchase.beat_id)
    }

    try {
      const { subject, html } = refundConfirmationEmail({
        beatTitle: purchase.beats?.title ?? "your beat",
        amountRefunded: Number(purchase.amount_paid),
      })

      await resend.emails.send({
        from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL}>`,
        to: purchase.customer_email,
        subject,
        html,
      })
    } catch (emailErr) {
      console.error("[refund confirmation email error]", emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin refund error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}