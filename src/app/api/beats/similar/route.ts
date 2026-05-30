import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const beatId = searchParams.get("beat_id")

  if (!beatId) {
    return NextResponse.json({ error: "Missing beat_id" }, { status: 400 })
  }

  // Get the original beat's attributes
  const { data: beat } = await supabase
    .from("beats")
    .select("genre, bpm, key, mood")
    .eq("id", beatId)
    .single()

  if (!beat) {
    return NextResponse.json({ error: "Beat not found" }, { status: 404 })
  }

  // Find similar available beats
  const { data: similar } = await supabase
    .from("beats")
    .select("*")
    .eq("is_published", true)
    .eq("is_exclusive_sold", false)
    .neq("id", beatId)
    .or(`genre.eq.${beat.genre},mood.eq.${beat.mood}`)
    .gte("bpm", beat.bpm - 10)
    .lte("bpm", beat.bpm + 10)
    .limit(4)

  // If not enough similar, fill with same genre
  let results = similar ?? []
  if (results.length < 4) {
    const { data: fallback } = await supabase
      .from("beats")
      .select("*")
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