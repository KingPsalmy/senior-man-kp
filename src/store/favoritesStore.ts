import { create } from "zustand"
import { getFavorites, addFavorite, removeFavorite } from "@/lib/favorites"
const pending = new Set<string>()

type FavoritesStore = {
  favoritedIds: Set<string>
  loaded: boolean
  error: string | null
  clearError: () => void
  load: () => Promise<void>
  toggle: (beatId: string) => Promise<void>
  check: (beatId: string) => boolean
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoritedIds: new Set(),
  loaded: false,
  error: null,
  clearError: () => set({ error: null }),

  load: async () => {
    if (get().loaded) return
    try {
      const data = await getFavorites()
      const ids = new Set(data.map((f) => String(f.beat_id)))
      set({ favoritedIds: ids, loaded: true })
    } catch {
      set({ error: "Your saved beats could not be loaded Please try again" })
    }
  },

  toggle: async (beatId: string) => {
    const id = String(beatId)
    if (pending.has(id)) return
    pending.add(id)
    try {
      const remove = get().favoritedIds.has(id)
      if (remove) await removeFavorite(id)
      else await addFavorite(id)
      const next = new Set(get().favoritedIds)
      if (remove) next.delete(id)
      else next.add(id)
      set({ favoritedIds: next, error: null })
    } catch {
      set({ error: "We couldn’t update your saved beats Please try again" })
    } finally {
      pending.delete(id)
    }
  },

  check: (beatId: string) => {
    return get().favoritedIds.has(String(beatId))
  },
}))
