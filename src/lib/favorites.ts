import { getGuestData, changeGuest } from "./guest-client"
export async function getFavorites() {
  return (await getGuestData()).favorites
}
export function addFavorite(beatId: string) {
  return changeGuest("favorites", "put", beatId)
}
export function removeFavorite(beatId: string) {
  return changeGuest("favorites", "remove", beatId)
}
export async function isFavorited(beatId: string) {
  return (await getFavorites()).some((f) => f.beat_id === beatId)
}
