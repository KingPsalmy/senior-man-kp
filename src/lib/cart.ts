import { getGuestData, changeGuest } from "./guest-client"
import { useCartStore } from "@/store/cartStore"
export type LicenseType = "basic" | "premium" | "unlimited" | "exclusive"

export const LICENSE_PRICES: Record<LicenseType, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export async function getCart() {
  return (await getGuestData()).cart
}
export async function getCartCount() {
  return (await getCart()).length
}
export async function refreshCartCount() {
  const count = await getCartCount()
  useCartStore.getState().setCount(count)
  return count
}
async function change(
  action: "put" | "remove" | "clear",
  beatId?: string,
  licenseType?: LicenseType,
) {
  try {
    await changeGuest("cart", action, beatId, licenseType)
    await refreshCartCount()
    return { error: null }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not update your cart",
    }
  }
}
export function addToCart(beatId: string, licenseType: LicenseType = "basic") {
  return change("put", beatId, licenseType)
}
export function updateCartLicense(beatId: string, licenseType: LicenseType) {
  return change("put", beatId, licenseType)
}
export function removeFromCart(beatId: string) {
  return change("remove", beatId)
}
export function clearCart() {
  return change("clear")
}
