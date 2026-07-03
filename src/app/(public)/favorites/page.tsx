"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { getFavorites, removeFavorite } from "@/lib/favorites"
import { usePlayerStore } from "@/store/playerStore"
import { addToCart } from "@/lib/cart"

function genreColor(genre: string) {
  const map: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e", "Trap": "#2e0a0a",
    "R&B": "#0a2e1a", "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }
  return map[genre] || "#111111"
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const { currentBeat, isPlaying, play, pause, setQueue } = usePlayerStore()

  useEffect(() => {
    async function load() {
      const data = await getFavorites()
      setFavorites(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleRemove(beatId: string) {
    await removeFavorite(beatId)
    setFavorites((prev) => prev.filter((f) => f.beat_id !== beatId))
  }

  async function handleAddToCart(beatId: string) {
    await addToCart(beatId, "basic")
    setAddedIds((prev) => new Set([...prev, beatId]))
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(beatId); return n }), 2000)
  }

  function handlePlay(beat: any) {
    const beats = favorites.map((f) => f.beats)
    if (currentBeat?.id === beat.id && isPlaying) {
      pause()
    } else {
      setQueue(beats)
      play(beat)
    }
  }

  const beats = favorites.map((f) => f.beats)

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "108px 48px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
            letterSpacing: "0.32em", textTransform: "uppercase",
            marginBottom: "20px", padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
          }}>
            Your Collection
          </span>
          <h1 style={{
            color: "var(--text-primary)", marginTop: "0",
            fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 800,
            fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", lineHeight: 1.08,
          }}>
            Saved Beats
          </h1>
        </div>
      </section>

      <div style={{ padding: "48px 48px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem" }}>
              Loading your favorites...
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>♡</div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>No saved beats yet</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontFamily: "var(--font-ui)", marginBottom: "32px", lineHeight: 1.7 }}>
                Hit the heart icon on any beat to save it here for later.
              </p>
              <Link href="/store" style={{
                padding: "16px 36px",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                color: "#000", textDecoration: "none", borderRadius: "8px",
                fontSize: "0.92rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Browse Beats
              </Link>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", marginBottom: "32px" }}>
                {favorites.length} saved beat{favorites.length !== 1 ? "s" : ""}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }} className="fav-grid">
                {favorites.map((fav) => {
                  const beat = fav.beats
                  if (!beat) return null
                  const isThisPlaying = currentBeat?.id === beat.id && isPlaying

                  return (
                    <div key={fav.beat_id} style={{
                      backgroundColor: "var(--bg-card)",
                      border: `1px solid ${isThisPlaying ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "12px", overflow: "hidden",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                    }}
                      className="beat-card"
                    >
                      {/* Cover */}
                      <div style={{
                        position: "relative", aspectRatio: "1",
                        background: beat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat.genre)} 0%, #0a0a0a 100%)`,
                        backgroundColor: "#0a0a0a", cursor: "pointer",
                      }}
                        onClick={() => handlePlay(beat)}
                      >
                        {beat.cover_url
                          ? <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 12px" }}>{beat.title.toUpperCase()}</span>
                            </div>
                        }

                        {/* Wave bars when playing */}
                        {isThisPlaying && (
                          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "28px" }}>
                              {[1, 2, 3, 4].map((b) => (
                                <div key={b} className={`wave-bar-${b}`} style={{ width: "3px", height: "18px", backgroundColor: "var(--gold)", borderRadius: "2px", transformOrigin: "bottom" }} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Remove from favorites */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(fav.beat_id) }}
                          style={{
                            position: "absolute", top: "10px", right: "10px",
                            width: "32px", height: "32px", borderRadius: "50%",
                            backgroundColor: "rgba(201,168,76,0.9)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: "0.85rem", zIndex: 2,
                            color: "#000",
                          }}
                        >
                          ♥
                        </button>

                        {/* Play/pause button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlay(beat) }}
                          style={{
                            position: "absolute", bottom: "12px", right: "12px",
                            width: "38px", height: "38px", borderRadius: "50%",
                            backgroundColor: "var(--gold)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", zIndex: 2,
                            WebkitAppearance: "none" as any, outline: "none",
                          }}
                        >
                          <span style={{ color: "#000", fontSize: "0.75rem", marginLeft: isThisPlaying ? 0 : "2px" }}>
                            {isThisPlaying ? "■" : "▶"}
                          </span>
                        </button>
                      </div>

                      {/* Info */}
                      <div style={{ padding: "16px" }}>
                        <Link href={`/beat/${beat.slug}`} style={{ textDecoration: "none" }}>
                          <h3 style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "6px", lineHeight: 1.3 }}>
                            {beat.title}
                          </h3>
                        </Link>
                        <div style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", fontWeight: 600, marginBottom: "8px" }}>{beat.genre}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                          <span style={{ color: "var(--border-dim)" }}>•</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>{beat.key}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                            from ₦{beat.basic_price?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleAddToCart(fav.beat_id)}
                            style={{
                              padding: "8px 14px", borderRadius: "6px",
                              backgroundColor: addedIds.has(fav.beat_id) ? "rgba(74,222,128,0.1)" : "var(--gold)",
                              border: addedIds.has(fav.beat_id) ? "1px solid rgba(74,222,128,0.3)" : "none",
                              color: addedIds.has(fav.beat_id) ? "#4ade80" : "#000",
                              fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                              cursor: "pointer", whiteSpace: "nowrap",
                              WebkitAppearance: "none" as any, outline: "none",
                            }}
                          >
                            {addedIds.has(fav.beat_id) ? "✓ Added" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .fav-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .fav-grid { grid-template-columns: repeat(2, 1fr) !important; } section { padding-left: 20px !important; padding-right: 20px !important; } }
      `}</style>
    </main>
  )
}
