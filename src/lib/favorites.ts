import { supabase } from "./supabase"
import { getGuestId } from "./guest"

export async function getFavorites() {
  const guestId = getGuestId()
  if (!guestId) return []

  const { data } = await supabase
    .from("favorites")
    .select("beat_id, beats(*)")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function addFavorite(beatId: string) {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("favorites").upsert({
    guest_id: guestId,
    beat_id: beatId,
  }, { onConflict: "guest_id,beat_id" })
}

export async function removeFavorite(beatId: string) {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("favorites")
    .delete()
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
}

export async function isFavorited(beatId: string): Promise<boolean> {
  const guestId = getGuestId()
  if (!guestId) return false

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
    .single()

  return !!data
}

export async function mergeFavoritesToEmail(email: string) {
  const guestId = getGuestId()
  if (!guestId) return

  // Update all favorites for this guest to also store email
  await supabase
    .from("favorites")
    .update({ guest_id: email })
    .eq("guest_id", guestId)
}