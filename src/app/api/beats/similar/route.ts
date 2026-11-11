import { PUBLIC_BEAT_FIELDS } from "@/lib/catalog"
import { NextRequest, NextResponse } from "next/server"
import { serviceClient } from "@/lib/admin"
import { isUuid } from "@/lib/security"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const beatId = searchParams.get("beat_id")

  if (!isUuid(beatId)) {
    return NextResponse.json({ error: "Missing beat_id" }, { status: 400 })
  }

  const supabase = serviceClient()
  // Get the original beat's attributes
  const { data: beat } = await supabase
    .from("beats")
    .select("genre, bpm, key, mood")
    .eq("is_published", true)
    .eq("is_exclusive_sold", false)
    .eq("id", beatId)
    .single()

  if (!beat) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 })
  }

  // Find similar available beats
  const { data: similar } = await supabase
    .from("beats")
    .select(PUBLIC_BEAT_FIELDS)
    .eq("is_published", true)
    .eq("is_exclusive_sold", false)
    .neq("id", beatId)
    .eq("genre", beat.genre)
    .gte("bpm", beat.bpm - 10)
    .lte("bpm", beat.bpm + 10)
    .limit(4)

  // If not enough similar, fill with same genre
  let results = similar ?? []
  if (results.length < 4) {
    const { data: fallback } = await supabase
      .from("beats")
      .select(PUBLIC_BEAT_FIELDS)
      .eq("is_published", true)
      .eq("is_exclusive_sold", false)
      .eq("genre", beat.genre)
      .neq("id", beatId)
      .not("id", "in", `(${results.map((r) => r.id).join(",") || "00000000-0000-0000-0000-000000000000"})`)
      .limit(4 - results.length)

    results = [...results, ...(fallback ?? [])]
  }

  return NextResponse.json({ similar: results })
}