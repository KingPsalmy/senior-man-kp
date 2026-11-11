"use client"
import dynamic from "next/dynamic"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { fetchCatalog } from "@/lib/catalog-client"
import { usePlayerStore, type PlayerBeat } from "@/store/playerStore"
const FloatingPlayer = dynamic(() => import("./FloatingPlayer"), { ssr: false })
export default function PlayerWrapper() {
  const path = usePathname()
  useEffect(() => {
    if (
      (path !== "/beatstore" && path !== "/beatstore/beats") ||
      usePlayerStore.getState().currentBeat
    )
      return
    let active = true
    usePlayerStore.getState().hydrateHistory()
    fetchCatalog().then(({ data, error }) => {
      if (active && !error && data)
        usePlayerStore.getState().startRadio(data as PlayerBeat[])
    })
    return () => {
      active = false
    }
  }, [path])
  return <FloatingPlayer />
}
