import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { resend } from "@/lib/resend"
import { abandonedCartReminderEmail } from "@/lib/emails/abandoned-cart-reminder"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: pendingOrders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .is("reminded_at", null)
    .lt("created_at", twoHoursAgo)

  if (error) {
    console.error("[abandoned-cart cron error]", error)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  let sent = 0

  for (const order of pendingOrders ?? []) {
    try {
      const { subject, html } = abandonedCartReminderEmail({
        items: order.items,
        total: order.total,
      })

      await resend.emails.send({
        from: `Senior Man KP <${process.env.RESEND_FROM_EMAIL}>`,
        to: order.email,
        subject,
        html,
      })

      await supabase
        .from("orders")
        .update({ reminded_at: new Date().toISOString() })
        .eq("id", order.id)

      sent++
    } catch (emailErr) {
      console.error(`[abandoned-cart email error for order ${order.id}]`, emailErr)
    }
  }

  return NextResponse.json({ success: true, sent })
}