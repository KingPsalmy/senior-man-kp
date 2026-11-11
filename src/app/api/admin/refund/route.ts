import { requireAdmin } from "@/lib/admin"
import { errorResponse, readJson, isUuid, validReference } from "@/lib/security"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { refundConfirmationEmail } from "@/lib/emails/refund-confirmation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { paystack_reference, beat_id, refund_confirmed } = await readJson(req)

    if (!validReference(paystack_reference) || !isUuid(beat_id) || refund_confirmed !== true) {
      return NextResponse.json({ error: "Confirm the refund was completed in Paystack and provide valid purchase details." }, { status: 400 })
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

    if (purchase.payment_status !== "success") {
      return NextResponse.json({ error: "Only a successful purchase can be marked refunded" }, { status: 400 })
    }

    const { data: recorded, error: updateError } = await supabase.rpc("record_completed_refund", { p_reference: paystack_reference, p_beat_id: beat_id })
    if (updateError) throw updateError
    if (!recorded) return NextResponse.json({ error: "This refund was already recorded or the purchase is not eligible." }, { status: 409 })

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
    return errorResponse(err)
  }
}