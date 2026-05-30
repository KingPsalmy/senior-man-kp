import { supabase } from "./supabase"

export type BeatStatus = "AVAILABLE" | "LOCKED" | "SOLD_EXCLUSIVE"

export async function getBeatStatus(beatId: string): Promise<BeatStatus> {
  const { data } = await supabase
    .from("beats")
    .select("is_published, is_exclusive_sold")
    .eq("id", beatId)
    .single()

  if (!data) return "LOCKED"
  if (data.is_exclusive_sold) return "SOLD_EXCLUSIVE"
  if (!data.is_published) return "LOCKED"
  return "AVAILABLE"
}

export async function lockBeat(beatId: string) {
  await supabase
    .from("beats")
    .update({ is_published: false })
    .eq("id", beatId)
}

export async function unlockBeat(beatId: string) {
  await supabase
    .from("beats")
    .update({ is_published: true })
    .eq("id", beatId)
}

export async function markExclusiveSold(beatId: string) {
  await supabase
    .from("beats")
    .update({ is_exclusive_sold: true, is_published: false })
    .eq("id", beatId)
}