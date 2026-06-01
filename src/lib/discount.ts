import { LicenseType } from "./cart"

type CartItem = {
  beat_id: string
  license_type: LicenseType
  beats: any
}

export type DiscountResult = {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  freeItems: { beat_id: string; free_license: LicenseType }[]
}

const PRICES: Record<LicenseType, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export function calculateDiscount(items: CartItem[]): DiscountResult {
  const byLicense = {
    basic: items.filter((i) => i.license_type === "basic"),
    premium: items.filter((i) => i.license_type === "premium"),
    unlimited: items.filter((i) => i.license_type === "unlimited"),
    exclusive: items.filter((i) => i.license_type === "exclusive"),
  }

  const freeItems: { beat_id: string; free_license: LicenseType }[] = []

  // Basic: Buy 2 get 1 Basic free
  const basicFreeCount = Math.floor(byLicense.basic.length / 2)
  for (let i = 0; i < basicFreeCount; i++) {
    freeItems.push({
      beat_id: byLicense.basic[byLicense.basic.length - 1 - i].beat_id,
      free_license: "basic",
    })
  }

  // Premium: Buy 2 get 1 Basic free
  const premiumFreeCount = Math.floor(byLicense.premium.length / 2)
  for (let i = 0; i < premiumFreeCount; i++) {
    freeItems.push({
      beat_id: byLicense.premium[byLicense.premium.length - 1 - i].beat_id,
      free_license: "basic",
    })
  }

  // Unlimited: Buy 2 get 1 Premium free
  const unlimitedFreeCount = Math.floor(byLicense.unlimited.length / 2)
  for (let i = 0; i < unlimitedFreeCount; i++) {
    freeItems.push({
      beat_id: byLicense.unlimited[byLicense.unlimited.length - 1 - i].beat_id,
      free_license: "premium",
    })
  }

  // Exclusive: Buy 1 get 1 Exclusive free
  const exclusiveFreeCount = Math.floor(byLicense.exclusive.length / 2)
  for (let i = 0; i < exclusiveFreeCount; i++) {
    freeItems.push({
      beat_id: byLicense.exclusive[byLicense.exclusive.length - 1 - i].beat_id,
      free_license: "exclusive",
    })
  }

  const subtotal = items.reduce((sum, item) => sum + PRICES[item.license_type], 0)

  const discount = freeItems.reduce((sum, f) => sum + PRICES[f.free_license], 0)

  return {
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    freeItems,
  }
}