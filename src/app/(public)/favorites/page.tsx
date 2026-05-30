"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { getFavorites, removeFavorite } from "@/lib/favorites"

const LICENSE_OPTIONS = [
  { value: "basic", label: "Basic", price: 30000 },
  { value: "premium", label: "Premium", price: 70000 },
  { value: "exclusive", label: "Exclusive", price: 150000 },
]

type FavoriteItem = {
  beat_id: string
  beats: any
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLicense, setSelectedLicense] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const data = await getFavorites()
      setFavorites(data as FavoriteItem[])
      setLoading(false)
    }
    load()
  }, [])

  async function handleRemove(beatId: string) {
    await removeFavorite(beatId)
    setFavorites((prev) => prev.filter((f) => f.beat_id !== beatId))
  }

  function toggleSelect(beatId: string) {
    setSelected((prev) => ({ ...prev, [beatId]: !prev[beatId] }))
  }

  function getLicense(beatId: string) {
    return selectedLicense[beatId] ?? "basic"
  }

  const selectedBeats = favorites.filter((f) => selected[f.beat_id])
  const total = selectedBeats.reduce((sum, f) => {
    const license = getLicense(f.beat_id)
    const opt = LICENSE_OPTIONS.find((o) => o.value === license)
    return sum + (opt?.price ?? 0)
  }, 0)

  function genreColor(genre: string) {
    const map: Record<string, string> = {
      "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
      "Trap": "#2e0a0a", "R&B": "#0a2e1a",
      "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
    }
    return map[genre] || "#111111"
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      <div style={{ padding: "100px 48px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Your Collection
              </span>
              <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>
                Favorites
              </h1>
            </div>
            {selectedBeats.length > 0 && (
              <Link
                href="/cart"
                style={{
                  padding: "13px 28px",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  color: "#000", textDecoration: "none", borderRadius: "4px",
                  fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}
              >
                Add {selectedBeats.length} to Cart — ₦{total.toLocaleString()}
              </Link>
            )}
          </div>

          {loading ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "80px 0" }}>
              Loading favorites...
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", marginBottom: "24px" }}>
                No favorites yet. Browse the store and hit ♡ on beats you like.
              </div>
              <Link href="/store" style={{
                padding: "13px 28px",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                color: "#000", textDecoration: "none", borderRadius: "4px",
                fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Browse Store
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {favorites.map((fav) => {
                const beat = fav.beats
                const isSelected = !!selected[fav.beat_id]
                const isUnavailable = beat?.is_exclusive_sold

                return (
                  <div
                    key={fav.beat_id}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 20px",
                      backgroundColor: isSelected ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                      border: `1px solid ${isSelected ? "rgba(201,168,76,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "8px",
                      opacity: isUnavailable ? 0.5 : 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Select checkbox */}
                    {!isUnavailable && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(fav.beat_id)}
                        style={{ width: "16px", height: "16px", accentColor: "var(--gold)", cursor: "pointer", flexShrink: 0 }}
                      />
                    )}

                    {/* Cover */}
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "4px", flexShrink: 0,
                      background: beat?.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat?.genre)}, #0a0a0a)`,
                      overflow: "hidden",
                    }}>
                      {beat?.cover_url && (
                        <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Link href={`/beat/${beat?.slug}`} style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                          {beat?.title}
                        </Link>
                        {isUnavailable && (
                          <span style={{ fontSize: "0.6rem", padding: "2px 8px", backgroundColor: "rgba(255,50,50,0.15)", color: "#ff5555", borderRadius: "2px", fontFamily: "var(--font-mono)" }}>
                            SOLD EXCLUSIVE
                          </span>
                        )}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                        {beat?.genre} • {beat?.bpm} BPM • {beat?.key}
                      </div>
                    </div>

                    {/* License selector */}
                    {!isUnavailable && (
                      <select
                        value={getLicense(fav.beat_id)}
                        onChange={(e) => setSelectedLicense((prev) => ({ ...prev, [fav.beat_id]: e.target.value }))}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--border-dim)",
                          borderRadius: "4px",
                          color: "var(--text-secondary)",
                          fontSize: "0.72rem",
                          fontFamily: "var(--font-ui)",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {LICENSE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} — ₦{o.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Play button */}
                    <button style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: "var(--gold)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                    }}>
                      <span style={{ color: "#000", fontSize: "0.7rem", marginLeft: "2px" }}>▶</span>
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(fav.beat_id)}
                      style={{
                        background: "none", border: "none",
                        color: "var(--text-muted)", cursor: "pointer",
                        fontSize: "1rem", flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}