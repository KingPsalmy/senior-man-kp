"use client"

import { useState, useEffect } from "react"
import { isFavorited, addFavorite, removeFavorite } from "@/lib/favorites"

export function useFavorite(beatId: string) {
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isFavorited(beatId).then((val) => {
      setFavorited(val)
      setLoading(false)
    })
  }, [beatId])

  async function toggle() {
    if (favorited) {
      await removeFavorite(beatId)
      setFavorited(false)
    } else {
      await addFavorite(beatId)
      setFavorited(true)
    }
  }

  return { favorited, toggle, loading }
}