import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data, error: dbError } = await supabase
      .from("purchases")
      .select("*")
      .eq("customer_email", normalizedEmail)
      .eq("payment_status", "success")
      .order("created_at", { ascending: false })

    if (dbError) {
      console.error("my-downloads lookup failed:", dbError)
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No purchases found for this email address." }, { status: 404 })
    }

    const beatIds = [...new Set(data.map((p) => p.beat_id))]
    const { data: beats } = await supabase
      .from("beats")
      .select("id, title, is_exclusive_sold")
      .in("id", beatIds)

    const beatMap: Record<string, { title: string; is_exclusive_sold: boolean }> = {}
    beats?.forEach((b) => { beatMap[b.id] = { title: b.title, is_exclusive_sold: b.is_exclusive_sold } })

    const purchases = data.map((p) => ({
      ...p,
      beat_title: beatMap[p.beat_id]?.title ?? "Unknown Beat",
      beat_is_exclusive_sold: beatMap[p.beat_id]?.is_exclusive_sold ?? false,
    }))

    return NextResponse.json({ success: true, purchases })
  } catch (err) {
    console.error("[my-downloads lookup error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
