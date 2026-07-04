import { create } from "zustand"
import { getFavorites, addFavorite, removeFavorite, isFavorited } from "@/lib/favorites"

type FavoritesStore = {
  favoritedIds: Set<string>
  loaded: boolean
  load: () => Promise<void>
  toggle: (beatId: string) => Promise<void>
  check: (beatId: string) => boolean
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoritedIds: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const data = await getFavorites()
    const ids = new Set(data.map((f: any) => String(f.beat_id)))
    set({ favoritedIds: ids, loaded: true })
  },

  toggle: async (beatId: string) => {
    const { favoritedIds } = get()
    const id = String(beatId)
    if (favoritedIds.has(id)) {
      await removeFavorite(id)
      const next = new Set(favoritedIds)
      next.delete(id)
      set({ favoritedIds: next })
    } else {
      await addFavorite(id)
      const next = new Set(favoritedIds)
      next.add(id)
      set({ favoritedIds: next })
    }
  },

  check: (beatId: string) => {
    return get().favoritedIds.has(String(beatId))
  },
}))
