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
  freeItems: string[]
}

export function calculateDiscount(items: CartItem[]): DiscountResult {
  const byLicense = {
    basic: items.filter((i) => i.license_type === "basic"),
    premium: items.filter((i) => i.license_type === "premium"),
    exclusive: items.filter((i) => i.license_type === "exclusive"),
  }

  const freeItems: string[] = []

  // Basic: Buy 3 get 1 free
  const basicFreeCount = Math.floor(byLicense.basic.length / 3)
  for (let i = 0; i < basicFreeCount; i++) {
    freeItems.push(byLicense.basic[byLicense.basic.length - 1 - i].beat_id)
  }

  // Premium: Buy 2 get 1 free
  const premiumFreeCount = Math.floor(byLicense.premium.length / 2)
  for (let i = 0; i < premiumFreeCount; i++) {
    freeItems.push(byLicense.premium[byLicense.premium.length - 1 - i].beat_id)
  }

  // Exclusive: Buy 3 get 2 free
  const exclusiveFreeCount = Math.floor(byLicense.exclusive.length / 3) * 2
  for (let i = 0; i < exclusiveFreeCount; i++) {
    freeItems.push(byLicense.exclusive[byLicense.exclusive.length - 1 - i].beat_id)
  }

  const subtotal = items.reduce((sum, item) => {
    const prices = { basic: 30000, premium: 70000, exclusive: 150000 }
    return sum + prices[item.license_type]
  }, 0)

  const discount = items.reduce((sum, item) => {
    if (freeItems.includes(item.beat_id)) {
      const prices = { basic: 30000, premium: 70000, exclusive: 150000 }
      return sum + prices[item.license_type]
    }
    return sum
  }, 0)

  return {
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    freeItems,
  }
}