"use client"

import { useEffect } from "react"
import { useFavoritesStore } from "../store/favoritesStore"

export function useFavorite(beatId: string) {
  const { load, toggle, check } = useFavoritesStore()

  useEffect(() => {
    load()
  }, [])

  const favorited = check(beatId)

  return {
    favorited,
    toggle: () => toggle(beatId),
    loading: !useFavoritesStore.getState().loaded,
  }
}
