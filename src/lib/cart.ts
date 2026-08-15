import { supabase } from "./supabase"
import { getGuestId } from "./guest"
import { useCartStore } from "@/store/cartStore"

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

export async function getCartCount(): Promise<number> {
  const guestId = getGuestId()
  if (!guestId) return 0

  const { count } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("guest_id", guestId)

  return count ?? 0
}

export async function refreshCartCount() {
  const count = await getCartCount()
  useCartStore.getState().setCount(count)
  return count
}

export async function addToCart(beatId: string, licenseType: LicenseType = "basic") {
  const guestId = getGuestId()
  if (!guestId) return { error: "No guest ID" }

  const { error } = await supabase.from("cart_items").upsert({
    guest_id: guestId,
    beat_id: beatId,
    license_type: licenseType,
  }, { onConflict: "guest_id,beat_id" })

  if (error) {
    console.error("[addToCart error]", error)
    return { error: error.message }
  }

  await refreshCartCount()
  return { error: null }
}

export async function updateCartLicense(beatId: string, licenseType: LicenseType) {
  const guestId = getGuestId()
  if (!guestId) return { error: "No guest ID" }

  const { data, error } = await supabase.from("cart_items")
    .update({ license_type: licenseType })
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
    .select()

  if (error) {
    console.error("[updateCartLicense error]", error)
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    console.warn("[updateCartLicense] No rows updated")
    return { error: "This item couldn't be updated" }
  }

  await refreshCartCount()
  return { error: null }
}

export async function removeFromCart(beatId: string) {
  const guestId = getGuestId()
  if (!guestId) return { error: "No guest ID" }

  const { data, error } = await supabase.from("cart_items")
    .delete()
    .eq("guest_id", guestId)
    .eq("beat_id", beatId)
    .select()

  if (error) {
    console.error("[removeFromCart error]", error)
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    console.warn("[removeFromCart] No rows deleted")
    return { error: "This item couldn't be removed" }
  }

  await refreshCartCount()
  return { error: null }
}

export async function clearCart() {
  const guestId = getGuestId()
  if (!guestId) return { error: "No guest ID" }

  const { error } = await supabase.from("cart_items")
    .delete()
    .eq("guest_id", guestId)

  if (error) {
    console.error("[clearCart error]", error)
    return { error: error.message }
  }

  await refreshCartCount()
  return { error: null }
}