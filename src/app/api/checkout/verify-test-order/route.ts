import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Looks up a bypass ("TEST_...") order directly from the DB.
// No Paystack call — the purchase was already created in /api/checkout/test-order.
export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json()

    if (!reference || !reference.startsWith("TEST_")) {
      return NextResponse.json({ error: "Not a test order reference" }, { status: 400 })
    }

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("*, beats(title)")
      .eq("paystack_reference", reference)
      .limit(1)

    if (error) {
      console.error("Test order verify lookup failed:", error)
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const p = purchases[0]

    return NextResponse.json({
      success: true,
      purchase: {
        beat_title: p.beats?.title ?? "Beat",
        license_type: p.license_type,
        amount_paid: p.amount_paid,
      },
    })
  } catch (err) {
    console.error("[verify-test-order error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
