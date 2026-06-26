"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { addToCart } from "@/lib/cart"
import { useFavorite } from "@/hooks/useFavorites"
import SimilarBeats from "@/components/ui/SimilarBeats"
import BeatStatusBadge from "@/components/ui/BeatStatusBadge"
import { getBeatStatus } from "@/lib/beatLifecycle"
import { usePlayerStore } from "@/store/playerStore"
const { setQueue, play, pause, currentBeat, isPlaying } = usePlayerStore()

const LICENSE_OPTIONS = [
  {
    value: "basic",
    label: "Basic License",
    price: 30000,
    features: ["MP3 & WAV files", "Non-exclusive rights", "Up to 10,000 streams", "1 Music Video", "YouTube & Social Media"],
  },
  {
    value: "premium",
    label: "Premium License",
    price: 70000,
    features: ["MP3, WAV & Track Stems", "Non-exclusive rights", "Unlimited streams", "Unlimited Music Videos", "Radio Broadcasting Rights", "Commercial use"],
  },
  {
    value: "unlimited",
    label: "Unlimited License",
    price: 120000,
    features: ["MP3, WAV & Track Stems", "Non-exclusive rights", "Unlimited Streams", "Unlimited Music Videos", "Radio Broadcasting Rights", "Commercial use"],
  },
  {
    value: "exclusive",
    label: "Exclusive License",
    price: 180000,
    features: ["MP3, WAV & Track Stems", "100% Exclusive rights", "Unlimited everything", "Direct producer access", "Beat customization", "Removed from store"],
  },
]

function genreColor(genre: string) {
  const map: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
    "Trap": "#2e0a0a", "R&B": "#0a2e1a",
    "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }
  return map[genre] || "#111111"
}

export default function BeatDetailPage() {
  const { slug } = useParams()
  const [beat, setBeat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState("basic")
  const [addedToCart, setAddedToCart] = useState(false)
  const [status, setStatus] = useState<"AVAILABLE" | "LOCKED" | "SOLD_EXCLUSIVE">("AVAILABLE")
  const { favorited, toggle: toggleFavorite } = useFavorite(beat?.id ?? "")
  const { setQueue, play, currentBeat, isPlaying, pause } = usePlayerStore()

  useEffect(() => {
    async function fetchBeat() {
      const { data } = await supabase
        .from("beats")
        .select("*")
        .eq("slug", slug)
        .single()

      if (data) {
        setBeat(data)
        const s = await getBeatStatus(data.id)
        setStatus(s)
      }
      setLoading(false)
    }
    if (slug) fetchBeat()
  }, [slug])

  async function handleAddToCart() {
    if (!beat) return
    await addToCart(beat.id, selectedLicense as any)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
          Loading...
        </div>
      </main>
    )
  }

  if (!beat) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Beat not found.</p>
          <Link href="/store" style={{ color: "var(--gold)", fontFamily: "var(--font-ui)" }}>← Back to Store</Link>
        </div>
      </main>
    )
  }

  const selectedOption = LICENSE_OPTIONS.find((o) => o.value === selectedLicense)
  const isUnavailable = status === "SOLD_EXCLUSIVE" || status === "LOCKED"

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      <div style={{ padding: "100px 48px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
            <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>Home</Link>
            <span style={{ color: "var(--text-muted)" }}>›</span>
            <Link href="/store" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>Beats</Link>
            <span style={{ color: "var(--text-muted)" }}>›</span>
            <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>{beat.title}</span>
          </div>

          {/* Top section */}
          <div className="beat-detail-top" style={{ display: "flex", gap: "48px", marginBottom: "64px" }}>

            {/* Cover */}
            <div className="beat-detail-cover" style={{ width: "380px", flexShrink: 0 }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: "8px", overflow: "hidden",
                background: beat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat.genre)} 0%, #0a0a0a 100%)`,
                backgroundColor: "#0a0a0a",
                position: "relative",
              }}>
                {beat.cover_url ? (
                  <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.06)", fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 24px" }}>
                      {beat.title.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Status overlay */}
                {isUnavailable && (
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BeatStatusBadge status={status} />
                  </div>
                )}
              </div>

              {/* Play button */}
              {!isUnavailable && (
  <button
    onClick={() => {
      if (currentBeat?.id != null && String(currentBeat.id) === beat.id && isPlaying) {
        pause()
      } else {
        setQueue([beat])
        play(beat)
      }
    }}
    style={{
      width: "100%", marginTop: "16px", padding: "14px",
      background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
      border: "none", borderRadius: "4px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      color: "#000", fontSize: "0.75rem", fontWeight: 700,
      fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
      WebkitAppearance: "none", appearance: "none", outline: "none",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    {currentBeat?.id != null && String(currentBeat.id) === beat.id && isPlaying ? (
      <>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="#000">
          <rect x="1" y="0" width="4" height="12" rx="1" />
          <rect x="7" y="0" width="4" height="12" rx="1" />
        </svg>
        Pause Preview
      </>
    ) : (
      <><span>▶</span> Play Preview</>
    )}
  </button>
)}
            </div>

            {/* Info + Licensing */}
            <div className="beat-detail-info" style={{ flex: 1, minWidth: 0 }}>

              {/* Title + meta */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em" }}>
                    {beat.title}
                  </h1>
                  <BeatStatusBadge status={status} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>{beat.genre}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{beat.key}</span>
                  {beat.mood && <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{beat.mood}</span>}
                  {beat.duration && <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{beat.duration}</span>}
                </div>

                {beat.description && (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", lineHeight: 1.8, marginTop: "16px", maxWidth: "520px" }}>
                    {beat.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              {beat.tags?.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
                  {beat.tags.map((tag: string) => (
                    <span key={tag} style={{
                      padding: "4px 10px",
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border-dim)",
                      borderRadius: "2px", color: "var(--text-muted)",
                      fontSize: "0.62rem", fontFamily: "var(--font-mono)",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* License selector */}
              {!isUnavailable && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
                    Select License
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {LICENSE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setSelectedLicense(option.value)}
                        style={{
                          padding: "16px 20px",
                          backgroundColor: selectedLicense === option.value ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                          border: `1px solid ${selectedLicense === option.value ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                          borderRadius: "6px", cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <div style={{
                              width: "14px", height: "14px", borderRadius: "50%",
                              border: `2px solid ${selectedLicense === option.value ? "var(--gold)" : "var(--border-dim)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {selectedLicense === option.value && (
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--gold)" }} />
                              )}
                            </div>
                            <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                              {option.label}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingLeft: "22px" }}>
                            {option.features.slice(0, 3).map((f) => (
                              <span key={f} style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-ui)" }}>
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ color: selectedLicense === option.value ? "var(--gold)" : "var(--text-primary)", fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-ui)", flexShrink: 0, marginLeft: "16px" }}>
                          ₦{option.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isUnavailable ? (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1, padding: "14px 24px",
                      background: addedToCart ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                      border: "none", borderRadius: "4px", cursor: "pointer",
                      color: addedToCart ? "var(--gold)" : "#000",
                      fontSize: "0.75rem", fontWeight: 700,
                      fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      transition: "all 0.2s",
                    }}
                  >
                    {addedToCart ? "✓ Added to Cart" : `Add to Cart — ₦${selectedOption?.price.toLocaleString()}`}
                  </button>

                  <button
                    onClick={toggleFavorite}
                    style={{
                      width: "48px", height: "48px",
                      backgroundColor: favorited ? "rgba(201,168,76,0.1)" : "var(--bg-card)",
                      border: `1px solid ${favorited ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                      borderRadius: "4px", cursor: "pointer",
                      color: favorited ? "var(--gold)" : "var(--text-muted)",
                      fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {favorited ? "♥" : "♡"}
                  </button>

                  <Link href="/cart" style={{
                    padding: "14px 24px",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: "4px", textDecoration: "none",
                    color: "var(--gold)", fontSize: "0.75rem", fontWeight: 700,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                    textTransform: "uppercase", display: "flex", alignItems: "center",
                  }}>
                    View Cart
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{
                    padding: "16px 20px",
                    backgroundColor: "rgba(255,50,50,0.05)",
                    border: "1px solid rgba(255,50,50,0.2)",
                    borderRadius: "6px",
                    color: "#ff5555", fontSize: "0.82rem", fontFamily: "var(--font-ui)",
                  }}>
                    {status === "SOLD_EXCLUSIVE"
                      ? "This beat has been purchased exclusively and is no longer available."
                      : "This beat is temporarily unavailable."}
                  </div>
                  <Link href="/store" style={{
                    padding: "14px 24px",
                    background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                    borderRadius: "4px", textDecoration: "none",
                    color: "#000", fontSize: "0.75rem", fontWeight: 700,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                    textTransform: "uppercase", textAlign: "center",
                  }}>
                    Browse Other Beats
                  </Link>
                </div>
              )}

              {/* License link */}
              <Link href="/licensing" style={{
                display: "block", marginTop: "16px",
                color: "var(--text-muted)", fontSize: "0.68rem",
                fontFamily: "var(--font-ui)", textDecoration: "none",
              }}>
                View full licensing terms →
              </Link>
            </div>
          </div>

          {/* Similar beats */}
          <SimilarBeats
            beatId={beat.id}
            title={status === "SOLD_EXCLUSIVE" ? "Similar Beats You Might Like" : "You Might Also Like"}
          />

        </div>
      </div>
    </main>
  )
}
