// Share the initial request so simultaneous cart/favorite loads receive one cookie.
let initial: Promise<void> | undefined
let pending: Promise<GuestData> | undefined
type GuestData = { cart: unknown[]; favorites: { beat_id: string }[] }
async function readGuest(): Promise<GuestData> {
  const response = await fetch("/api/guest", { cache: "no-store" })
  if (!response.ok) throw new Error("Could not load your saved items")
  return response.json()
}
export function getGuestData() {
  if (!pending) {
    pending = readGuest().finally(() => {
      pending = undefined
    })
    initial = pending.then(
      () => {},
      () => {
        initial = undefined
      },
    )
  }
  return pending
}
export async function changeGuest(
  collection: "cart" | "favorites",
  action: "put" | "remove" | "clear",
  beat_id?: string,
  license_type?: string,
) {
  if (!initial) await getGuestData()
  else await initial
  const response = await fetch("/api/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection, action, beat_id, license_type }),
  })
  const result = await response.json()
  if (!response.ok)
    throw new Error(result.error || "Could not save your change")
}
