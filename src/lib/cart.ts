import { supabase } from "./supabase"
import { getGuestId } from "./guest"

export type LicenseType = "basic" | "premium" | "unlimited" | "exclusive"

export const LICENSE_PRICES: Record<LicenseType, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export async function getCart() {
  const guestId = getGuestId()
  if (!guestId) return []

  const { data } = await supabase
    .from("cart_items")
    .select("*, beats(*)")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function addToCart(beatId: string, licenseType: LicenseType = "basic") {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("cart_items").upsert({
    guest_id: guestId,
    beat_id: beatId,
    license_type: licenseType,
  }, { onConflict: "guest_id,beat_id" })
}

export async function updateCartLicense(beatId: string, licenseType: LicenseType) {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("cart_items")
    .update({ license_type: licenseType })
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
}

export async function removeFromCart(beatId: string) {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("cart_items")
    .delete()
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
}

export async function clearCart() {
  const guestId = getGuestId()
  if (!guestId) return

  await supabase.from("cart_items")
    .delete()
    .eq("guest_id", guestId)
}

export async function getCartCount(): Promise<number> {
  const guestId = getGuestId()
  if (!guestId) return 0

  const { count } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guestId)

  return count ?? 0
}