"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Check,
  Heart,
  Music2,
  Pause,
  Play,
  Plus,
  Share2,
  ShoppingBag,
  X,
} from "lucide-react"
import { usePlayerStore } from "@/store/playerStore"
import { useFavoritesStore } from "@/store/favoritesStore"
import { addToCart, type LicenseType } from "@/lib/cart"

export type CatalogBeat = {
  id: string
  title: string
  slug: string
  genre: string
  mood: string | null
  bpm: number
  key: string
  cover_url: string | null
  preview_url: string | null
  description?: string | null
  basic_price: number
  premium_price: number
  unlimited_price: number
  exclusive_price: number
  is_published: boolean
  is_exclusive_sold: boolean
  is_featured?: boolean
  play_count?: number
  duration?: string
  created_at?: string
}
export const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount))
export const tiers: { value: LicenseType; label: string; detail: string }[] = [
  { value: "basic", label: "Basic", detail: "WAV · Standard releases" },
  {
    value: "premium",
    label: "Premium",
    detail: "WAV + stems · More creative control",
  },
  {
    value: "unlimited",
    label: "Unlimited",
    detail: "WAV + stems · Broader commercial use",
  },
  {
    value: "exclusive",
    label: "Exclusive",
    detail: "WAV + stems · Removed from the store",
  },
]

export function LicenseDialog({
  beat,
  onClose,
}: {
  beat: CatalogBeat
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [license, setLicense] = useState<LicenseType>("basic")
  const [state, setState] = useState<"idle" | "saving" | "added">("idle")
  const [error, setError] = useState("")
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      element?.close()
      document.body.style.overflow = overflow
    }
  }, [])
  async function add() {
    setState("saving")
    setError("")
    try {
      const result = await addToCart(beat.id, license)
      if (result?.error) throw new Error(result.error)
      setState("added")
    } catch {
      setError("We couldn’t add this beat Please try again")
      setState("idle")
    }
  }
  return (
    <dialog
      className="kp-dialog"
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose()
      }}
      aria-labelledby="license-dialog-title"
    >
      <div className="dialog-top">
        <span className="eyebrow">Make it yours</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close license picker"
        >
          <X size={20} />
        </button>
      </div>
      <h2 id="license-dialog-title">{beat.title}</h2>
      <p className="muted">Choose the license that fits your next release</p>
      <div className="license-options">
        {tiers.map((tier) => (
          <label
            key={tier.value}
            className={`license-option ${license === tier.value ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="license"
              value={tier.value}
              checked={license === tier.value}
              onChange={() => {
                setLicense(tier.value)
                setState("idle")
              }}
              disabled={
                state === "saving" ||
                (tier.value === "exclusive" && beat.is_exclusive_sold)
              }
            />
            <span>
              <strong>{tier.label}</strong>
              <small>{tier.detail}</small>
            </span>
            <b>{money(beat[`${tier.value}_price`])}</b>
          </label>
        ))}
      </div>
      <Link className="text-link" href="/licensing">
        Compare license terms <ArrowUpRight size={15} />
      </Link>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {state === "added" ? (
        <div className="dialog-actions">
          <span role="status">
            <Check size={17} /> Added to your cart
          </span>
          <Link href="/cart" className="button primary">
            View cart <ShoppingBag size={17} />
          </Link>
        </div>
      ) : (
        <button
          className="button primary full-width"
          onClick={add}
          disabled={
            state === "saving" || beat.is_exclusive_sold || !beat.is_published
          }
        >
          {state === "saving" ? "Adding…" : "Add to cart"}
          <Plus size={18} />
        </button>
      )}
      <p className="dialog-note">
        No account needed Secure payment at checkout
      </p>
    </dialog>
  )
}

export function BeatCard({
  beat,
  queue,
  compact = false,
}: {
  beat: CatalogBeat
  queue?: CatalogBeat[]
  compact?: boolean
}) {
  const currentBeat = usePlayerStore((s) => s.currentBeat)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const saved = useFavoritesStore((s) => s.favoritedIds.has(beat.id))
  const [licenseOpen, setLicenseOpen] = useState(false)
  const [message, setMessage] = useState("")
  const active = String(currentBeat?.id) === beat.id && isPlaying
  const available = beat.is_published && !beat.is_exclusive_sold
  function preview() {
    const player = usePlayerStore.getState()
    if (active) {
      player.pause()
      return
    }
    player.setQueue(
      (queue ?? [beat]).filter(
        (b) => b.preview_url && b.is_published && !b.is_exclusive_sold,
      ),
    )
    player.play(beat)
    fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beat_id: beat.id }),
    }).catch(() => {})
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/beatstore/${encodeURIComponent(beat.slug)}`,
      )
      setMessage("Link copied")
    } catch {
      setMessage("Open the beat to copy its address")
    }
  }
  return (
    <article
      className={`catalog-card ${compact ? "catalog-row" : ""} ${active ? "is-playing" : ""}`}
    >
      <div className="catalog-art">
        <Link
          href={`/beatstore/${encodeURIComponent(beat.slug)}`}
          aria-label={`View ${beat.title}`}
          tabIndex={-1}
        >
          {beat.cover_url ? (
            <img src={beat.cover_url} alt="" loading="lazy" />
          ) : (
            <div className="cover-placeholder">
              <Music2 size={36} />
              <span>{beat.genre}</span>
            </div>
          )}
        </Link>
        {!compact && (
          <span className="art-label">
            {available ? beat.genre : "Exclusive sold"}
          </span>
        )}
        <button
          className="preview-button"
          onClick={preview}
          disabled={!beat.preview_url || !available}
          aria-label={`${active ? "Pause" : "Preview"} ${beat.title}`}
        >
          {active ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
      </div>
      <div className="catalog-info">
        <div className="catalog-title-line">
          <h3>
            <Link href={`/beatstore/${encodeURIComponent(beat.slug)}`}>
              {beat.title}
            </Link>
          </h3>
          <button
            className={`icon-button favorite ${saved ? "is-saved" : ""}`}
            aria-label={`${saved ? "Unsave" : "Save"} ${beat.title}`}
            aria-pressed={saved}
            onClick={() => useFavoritesStore.getState().toggle(beat.id)}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="beat-byline">
          Senior Man KP <span>·</span> {beat.mood || beat.genre}
        </p>
        <div className="catalog-meta">
          <span>{beat.bpm} BPM</span>
          <span>{beat.key || "Instrumental"}</span>
          {compact && <span>{beat.genre}</span>}
        </div>
      </div>
      <div className="catalog-buy">
        <div>
          <small>{available ? "License from" : "Unavailable"}</small>
          <strong>{money(beat.basic_price)}</strong>
        </div>
        <button
          className="button small"
          onClick={() => setLicenseOpen(true)}
          disabled={!available}
          aria-label={`Choose a license for ${beat.title}`}
        >
          <Plus size={17} />
          <span>License</span>
        </button>
        <button
          className="icon-button share"
          onClick={share}
          aria-label={`Copy link to ${beat.title}`}
        >
          <Share2 size={16} />
        </button>
      </div>
      {message && (
        <p className="card-message" role="status">
          {message}
        </p>
      )}
      {licenseOpen && (
        <LicenseDialog beat={beat} onClose={() => setLicenseOpen(false)} />
      )}
    </article>
  )
}

export function BeatSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="catalog-grid" aria-label="Loading beats" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="catalog-skeleton" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}
