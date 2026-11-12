"use client"
import { usePortraitRotation } from "@/hooks/usePortraitRotation"
import { mediaAssets } from "@/lib/media-assets"

import { useEffect, useState } from "react"
import { Pause, Play } from "lucide-react"
import HeroParticles from "@/components/ui/HeroParticles"

const portraits = [mediaAssets["hero-pic-left"], mediaAssets["hero-pic-left-2"], mediaAssets["hero-pic-left-3"]]

export default function LoginBackdrop() {
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const { portrait, requestedPortraits, selectPortrait, onPortraitLoad, onPortraitError } = usePortraitRotation(portraits.length, !paused && !reducedMotion)

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener("change", update)
    return () => preference.removeEventListener("change", update)
  }, [])


  return (
    <>
      <div className="login-portraits" aria-hidden="true">
        {portraits.map((src, index) => requestedPortraits.includes(index) && (
          <img key={src} src={src}
            ref={(image) => { if (image?.complete && image.naturalWidth) onPortraitLoad(index) }}
            onLoad={() => onPortraitLoad(index)} onError={() => onPortraitError(index)} decoding="async"
            alt="" className={index === portrait ? "is-active" : ""} fetchPriority={index === 0 ? "high" : "low"} />
        ))}
        <div className="login-portrait-shade" />
      </div>
      {!paused && !reducedMotion && <HeroParticles />}
      <div className="login-portrait-controls" role="group" aria-label="Login background portraits">
        {portraits.map((_, index) => (
          <button key={index} type="button" aria-label={`Show portrait ${index + 1}`} aria-pressed={index === portrait}
            onClick={() => { selectPortrait(index); setPaused(true) }}>
            <span />
          </button>
        ))}
        {!reducedMotion && (
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume background motion" : "Pause background motion"}>
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </>
  )
}
