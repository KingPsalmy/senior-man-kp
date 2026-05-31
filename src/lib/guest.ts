import { v4 as uuidv4 } from "uuid"

const GUEST_KEY = "senkp_guest_id"

export function getGuestId(): string {
  if (typeof window === "undefined") return ""

  let guestId = localStorage.getItem(GUEST_KEY)
  if (!guestId) {
    guestId = uuidv4()
    localStorage.setItem(GUEST_KEY, guestId)
    // Also set as cookie for server-side access
    document.cookie = `${GUEST_KEY}=${guestId}; path=/; max-age=${60 * 60 * 24 * 365}`
  }
  return guestId
}

export function clearGuestId(): void {
  localStorage.removeItem(GUEST_KEY)
  document.cookie = `${GUEST_KEY}=; path=/; max-age=0`
}