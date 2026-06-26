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

const PRICES: Record<LicenseType, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export function calculateDiscount(items: CartItem[]): DiscountResult {
  const subtotal = items.reduce((sum, item) => sum + PRICES[item.license_type], 0)

  const freeItems: string[] = []

  // For each license tier: buy 2 get 1 free (every 3rd item is free)
  const licenses: LicenseType[] = ["basic", "premium", "unlimited", "exclusive"]

  for (const license of licenses) {
    const group = items.filter((i) => i.license_type === license)
    const freeCount = Math.floor(group.length / 3)
    for (let i = 0; i < freeCount; i++) {
      // The cheapest items in the group get marked free (last ones added)
      freeItems.push(group[group.length - 1 - i].beat_id)
    }
  }

  const discount = freeItems.reduce((sum, beatId) => {
    const item = items.find((i) => i.beat_id === beatId)
    return sum + (item ? PRICES[item.license_type] : 0)
  }, 0)

  return {
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    freeItems,
  }
}