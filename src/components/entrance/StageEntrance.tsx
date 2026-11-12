"use client"

import { useEffect, useState, type AnimationEventHandler, type MouseEventHandler } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { create } from "zustand"
import { ArrowRight } from "lucide-react"
import { mediaAssets } from "@/lib/media-assets"
import "./entrance.css"

const useEntranceTransition = create<{ opening: boolean; start: () => void; finish: () => void }>((set) => ({
  opening: false,
  start: () => set({ opening: true }),
  finish: () => set({ opening: false }),
}))

function StageScene({ opening = false, onEnter, onPhotoAnimationEnd }: {
  opening?: boolean
  onEnter?: MouseEventHandler<HTMLAnchorElement>
  onPhotoAnimationEnd?: AnimationEventHandler<HTMLDivElement>
}) {
  const invitation = <><span>Click here to continue</span><ArrowRight size={18} aria-hidden="true" /></>
  return (
    <main className={"stage-entrance" + (opening ? " stage-opening" : "")}>
      <div className="stage-reveal" aria-hidden="true" onAnimationEnd={onPhotoAnimationEnd}
        style={{ "--stage-photo": `url("${mediaAssets["hero-pic-left-2"]}")` } as React.CSSProperties} />
      <div className="stage-curtain stage-curtain-left" aria-hidden="true" />
      <div className="stage-curtain stage-curtain-right" aria-hidden="true" />
      <div className="stage-light" aria-hidden="true" />
      <div className="stage-invitation">
        <h1><img src={mediaAssets["logo-white"]} alt="Senior Man KP" width="104" height="80" /></h1>
        {opening ? <span className="stage-enter">{invitation}</span> : (
          <Link href="/beatstore" className="stage-enter" aria-label="Click here to continue to the Beat Store" onClick={onEnter}>
            {invitation}
          </Link>
        )}
      </div>
    </main>
  )
}

export default function StageEntrance() {
  const router = useRouter()
  useEffect(() => { router.prefetch("/beatstore") }, [router])

  return <StageScene onEnter={(event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    event.preventDefault()
    if (useEntranceTransition.getState().opening) return
    useEntranceTransition.getState().start()
    // Render the destination behind the persistent scene while the curtains open.
    router.push("/beatstore")
  }} />
}

function OpeningScene() {
  const path = usePathname()
  const finish = useEntranceTransition((state) => state.finish)
  const [curtainsOpen, setCurtainsOpen] = useState(false)

  useEffect(() => {
    const curtains = window.setTimeout(() => setCurtainsOpen(true), 900)
    // Never leave an inaccessible overlay if navigation or animation fails.
    const fallback = window.setTimeout(finish, 10000)
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => { if (preference.matches) finish() }
    update()
    preference.addEventListener("change", update)
    return () => {
      window.clearTimeout(curtains)
      window.clearTimeout(fallback)
      preference.removeEventListener("change", update)
    }
  }, [finish])

  return (
    <div className={"stage-transition" + (curtainsOpen && path === "/beatstore" ? " stage-store-ready" : "")}
      role="status" aria-label="Opening the Beat Store">
      <div aria-hidden="true">
        <StageScene opening onPhotoAnimationEnd={(event) => {
          if (event.animationName === "stage-photo-exit") finish()
        }} />
      </div>
    </div>
  )
}

// Mounted in the shared layout so changing routes doesn't cut the fade short.
export function StageEntranceTransition() {
  const opening = useEntranceTransition((state) => state.opening)
  return opening ? <OpeningScene /> : null
}
