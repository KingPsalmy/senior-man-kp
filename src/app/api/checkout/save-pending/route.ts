import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { guest_id, email, items, subtotal, discount, total } = await req.json()

    if (!guest_id || !email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("guest_id", guest_id)
      .eq("status", "pending")
      .maybeSingle()

    if (existing) {
      await supabase
        .from("orders")
        .update({ email, items, subtotal, discount, total, reminded_at: null })
        .eq("id", existing.id)
    } else {
      await supabase.from("orders").insert({
        guest_id,
        email,
        items,
        subtotal,
        discount,
        total,
        status: "pending",
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[save-pending error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}