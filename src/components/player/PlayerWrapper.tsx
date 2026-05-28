"use client"

import dynamic from "next/dynamic"

const FloatingPlayer = dynamic(() => import("./FloatingPlayer"), { ssr: false })

export default function PlayerWrapper() {
  return <FloatingPlayer />
}