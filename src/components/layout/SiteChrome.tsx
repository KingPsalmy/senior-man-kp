"use client"
import { usePathname } from "next/navigation"
import Footer from "./Footer"
import PlayerWrapper from "@/components/player/PlayerWrapper"
export default function SiteChrome() {
  const path = usePathname()
  if (path.startsWith("/admin")) return null
  return (
    <>
      <div hidden={path === "/"}><PlayerWrapper /></div>
      {path !== "/" && <Footer />}
    </>
  )
}
