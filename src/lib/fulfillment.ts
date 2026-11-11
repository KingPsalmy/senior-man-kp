import { deliverReceipt } from "./receipts"
import { serviceClient } from "./admin"
import { verifyQuote } from "./checkout"
import { calculateDiscount } from "./discount"
import { escapeHtml, RequestError } from "./security"
import { resend } from "./resend"

export type Transaction = {
  status: string
  reference: string
  amount: number
  currency: string
  customer: { email: string }
  metadata: unknown
  paid_at: string
  domain: string
}

export async function fulfillPayment(transaction: Transaction) {
  if (transaction.status !== "success")
    throw new RequestError("Payment is not yet confirmed.", 409)
  if (process.env.NODE_ENV === "production" && transaction.domain !== "live")
    throw new RequestError(
      "Test payments cannot release production downloads.",
      422,
    )
  const quote = verifyQuote(transaction.metadata, transaction)
  const { freeItems } = calculateDiscount(quote.items)
  const { data, error } = await serviceClient().rpc("fulfill_verified_order", {
    p_quote: { ...quote, freeItems },
  })
  if (error || !data)
    throw new RequestError(
      "Payment received but fulfillment needs attention. Keep your reference and contact support.",
      503,
    )
  // Retry durable receipts on callbacks/webhooks as well as through the cron worker.
  await deliverReceipt(quote.reference).catch(() =>
    console.error("[receipt queued for retry]", quote.reference),
  )
  // Never let a mail-provider failure roll back or duplicate the paid purchase.
  if (data.created) {
    // Keep sale notifications, using only signed catalog data and verified buyers.
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      await resend.emails
        .send({
          from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL || "noreply@seniormankp.com"}>`,
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: "New beat sale — Senior Man KP",
          html: `<p>${escapeHtml(quote.email)} purchased ${quote.items.length} beat(s) for ₦${quote.total.toLocaleString("en-NG")}.</p><p>Reference: ${escapeHtml(quote.reference)}</p>`,
        })
        .catch(() =>
          console.error("[admin sale notification failed]", quote.reference),
        )
    }
    for (const item of quote.items.filter(
      (i) => i.license_type === "exclusive",
    )) {
      const { data: buyers } = await serviceClient()
        .from("purchases")
        .select("customer_email")
        .eq("beat_id", item.beat_id)
        .eq("payment_status", "success")
        .neq("customer_email", quote.email)
      for (const email of new Set(
        (buyers ?? []).map((b) => b.customer_email as string),
      )) {
        await resend.emails
          .send({
            from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL || "noreply@seniormankp.com"}>`,
            to: email,
            subject: "A beat you licensed has been sold exclusively",
            html: `<p>${escapeHtml(item.title)} is no longer available for new purchases. Your existing license remains valid.</p>`,
          })
          .catch(() =>
            console.error(
              "[exclusive notice delivery failed]",
              quote.reference,
            ),
          )
      }
    }
  }
  return data.purchases as {
    beat_title: string
    license_type: string
    amount_paid: number
  }[]
}
