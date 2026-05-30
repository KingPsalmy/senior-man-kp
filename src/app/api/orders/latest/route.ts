import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const guestId = searchParams.get("guest_id")

  if (!guestId) {
    return NextResponse.json({ error: "Missing guest_id" }, { status: 400 })
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
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