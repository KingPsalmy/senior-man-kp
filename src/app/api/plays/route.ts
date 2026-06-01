import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { beat_id } = await req.json()

  if (!beat_id) {
    return NextResponse.json({ error: "Missing beat_id" }, { status: 400 })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(beat_id)) {
    return NextResponse.json({ error: "Invalid beat_id" }, { status: 400 })
  }

  // Verify beat exists before incrementing
  const { data: beat } = await supabase
    .from("beats")
    .select("id")
    .eq("id", beat_id)
    .single()

  if (!beat) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 })
  }

  await supabase.rpc("increment_play_count", { beat_id })

  return NextResponse.json({ success: true })
}