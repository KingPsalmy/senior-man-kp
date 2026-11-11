"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import "./entrance.css"

export default function StageEntrance() {
  const router = useRouter()
  const [opening, setOpening] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    router.prefetch("/beatstore")
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [router])

  return (
    <main className={"stage-entrance" + (opening ? " stage-opening" : "")}>
      <div className="stage-reveal" aria-hidden="true" />
      <div className="stage-curtain stage-curtain-left" aria-hidden="true" />
      <div className="stage-curtain stage-curtain-right" aria-hidden="true" />
      <div className="stage-light" aria-hidden="true" />
      <div className="stage-invitation">
        <h1><img src="/logo-white.png" alt="Senior Man KP" width="104" height="80" /></h1>
        <Link
          href="/beatstore"
          className="stage-enter"
          aria-label="Click here to continue to the Beat Store"
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
            event.preventDefault()
            if (opening) return
            setOpening(true)
            timer.current = setTimeout(() => router.push("/beatstore"), 1250)
          }}
        >
          <span>Click here to continue</span><ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <span className="sr-only" role="status">{opening ? "Opening the Beat Store" : ""}</span>
    </main>
  )
}
