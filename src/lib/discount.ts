import type { LicenseType } from "./cart"

type CartItem = { beat_id: string; license_type: LicenseType; price?: number; beats?: Record<string, unknown> }
const DEFAULT_PRICES: Record<LicenseType, number> = { basic: 30000, premium: 70000, unlimited: 120000, exclusive: 180000 }
export const LICENSES: LicenseType[] = ["basic", "premium", "unlimited", "exclusive"]
export function itemPrice(item: CartItem): number {
  const price = Number(item.price ?? item.beats?.[item.license_type + "_price"] ?? DEFAULT_PRICES[item.license_type])
  if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(Math.round(price * 100))) throw new Error("Invalid price")
  return Math.round(price * 100) / 100
}
export function calculateDiscount(items: CartItem[]) {
  const freeItems: string[] = []
  for (const license of LICENSES) {
    const group = items.filter(i => i.license_type === license).sort((a, b) => itemPrice(a) - itemPrice(b) || a.beat_id.localeCompare(b.beat_id))
    freeItems.push(...group.slice(0, Math.floor(group.length / 3)).map(i => i.beat_id))
  }
  const subtotal = items.reduce((sum, i) => sum + Math.round(itemPrice(i) * 100), 0)
  const discount = items.filter(i => freeItems.includes(i.beat_id)).reduce((sum, i) => sum + Math.round(itemPrice(i) * 100), 0)
  return { items, subtotal: subtotal / 100, discount: discount / 100, total: (subtotal - discount) / 100, freeItems }
}
