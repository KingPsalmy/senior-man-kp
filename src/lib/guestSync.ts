import { supabase } from "./supabase"
import { getGuestId } from "./guest"

export async function syncGuestToEmail(email: string) {
  const guestId = getGuestId()
  if (!guestId) return

  // Upsert guest record linking guest_id to email
  await supabase.from("guests").upsert({
    guest_id: guestId,
    email,
    updated_at: new Date().toISOString(),
  }, { onConflict: "guest_id" })
}

export async function getEmailFromGuest(): Promise<string | null> {
  const guestId = getGuestId()
  if (!guestId) return null

  const { data } = await supabase
    .from("guests")
    .select("email")
    .eq("guest_id", guestId)
    .single()

  return data?.email ?? null
}