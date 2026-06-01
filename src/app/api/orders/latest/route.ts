import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const guestId = req.nextUrl.searchParams.get("guest_id")

  if (!guestId) {
    return NextResponse.json({ error: "Missing guest_id" }, { status: 400 })
  }

  // Validate guest_id format — must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(guestId)) {
    return NextResponse.json({ error: "Invalid guest_id" }, { status: 400 })
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total, items, created_at, paystack_reference")
    .eq("guest_id", guestId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!order) {
    return NextResponse.json({ order: null })
  }

  return NextResponse.json({ order })
}