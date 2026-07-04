"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { usePlayerStore } from "@/store/playerStore"
import { useFavoritesStore } from "@/store/favoritesStore"
import { addToCart } from "@/lib/cart"

type Beat = {
  id: string
  title: string
  slug: string
  genre: string
  mood: string
  bpm: number
  key: string
  basic_price: number
  premium_price: number
  unlimited_price: number
  exclusive_price: number
  cover_url: string | null
  preview_url: string | null
  is_featured: boolean
  is_exclusive_sold: boolean
  play_count: number
  duration: string
  created_at: string
}

function genreColor(genre: string) {
  const map: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
    "Trap": "#2e0a0a", "R&B": "#0a2e1a",
    "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }
  return map[genre] || "#111111"
}

const GENRES = ["Afrobeat","Afro Fusion","Afro-Soul","Afropop","Amapiano","Trap","Drill","R&B","Hip-Hop","Dancehall","Reggae","Highlife","Fuji","Gospel","Alternative","Pop","Soul","Lo-Fi","House","EDM","Jersey Club","UK Afroswing","Afro House","Piano Fusion","Neo Soul"]
const MOODS = ["Dark","Euphoric","Melancholic","Energetic","Romantic","Chill","Soulful","Emotional","Happy","Uplifting","Inspirational","Reflective","Dreamy","Smooth","Groovy","Luxury","Sexy","Confident","Aggressive","Epic","Cinematic","Party","Rave","Spiritual","Hopeful","Nostalgic","Motivational","Passionate","Intimate","Triumphant"]

const filterSelectStyle: React.CSSProperties = {
  padding: "12px 16px",
  backgroundColor: "rgba(16,16,16,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "rgba(245,240,232,0.7)",
  fontSize: "0.92rem",
  fontFamily: "var(--font-ui)",
  outline: "none",
  cursor: "pointer",
}

export default function StorePage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [shareBeat, setShareBeat] = useState<Beat | null>(null)
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [sort, setSort] = useState("newest")
  const router = useRouter()
  const { currentBeat, isPlaying, play, pause, setQueue } = usePlayerStore()
  const { load: loadFavorites, toggle: toggleFavorite, check: isFavorited } = useFavoritesStore()

  useEffect(() => {
    loadFavorites()
    fetchBeats()
  }, [sort])

  async function fetchBeats() {
    setLoading(true)
    let query = supabase.from("beats").select("*").eq("is_published", true)
    if (sort === "newest") query = query.order("created_at", { ascending: false })
    if (sort === "oldest") query = query.order("created_at", { ascending: true })
    if (sort === "most_played") query = query.order("play_count", { ascending: false })
    if (sort === "price_low") query = query.order("basic_price", { ascending: true })
    if (sort === "price_high") query = query.order("basic_price", { ascending: false })
    const { data } = await query
    setBeats(data ?? [])
    setLoading(false)
  }

  const filtered = beats.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genre ? b.genre === genre : true
    const matchMood = mood ? b.mood === mood : true
    return matchSearch && matchGenre && matchMood
  })

  async function handlePlay(beat: Beat) {
    if (String(currentBeat?.id) === String(beat.id) && isPlaying) {
      pause()
      return
    }
    setQueue(filtered as any)
    play(beat as any)
    await fetch(`/api/plays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beat_id: beat.id }),
    })
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "108px 48px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Link href="/" style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.92rem", fontFamily: "var(--font-ui)", textDecoration: "none", transition: "color 0.2s", fontWeight: 500 }}>Home</Link>
            <span style={{ color: "rgba(245,240,232,0.3)", fontSize: "0.92rem" }}>›</span>
            <span style={{ color: "var(--gold)", fontSize: "0.92rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>Beats</span>
          </div>
          <span style={{
            display: "inline-block",
            color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
            letterSpacing: "0.32em", textTransform: "uppercase",
            marginBottom: "20px", padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
          }}>
            Browse
          </span>
          <h1 style={{
            fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontWeight: 800,
            fontFamily: "var(--font-ui)",
            letterSpacing: "-0.03em", lineHeight: 1.08, marginTop: "0",
          }}>
            <span style={{ color: "var(--text-primary)" }}>All </span>
            <span style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Beats</span>
          </h1>
        </div>
      </section>

      {/* Filters */}
      <div style={{ padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(8,8,8,0.6)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text" placeholder="Search beats..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ ...filterSelectStyle, width: "100%", padding: "12px 14px 12px 42px", boxSizing: "border-box" as const, color: "var(--text-primary)" }}
            />
          </div>

          <select value={genre} onChange={(e) => setGenre(e.target.value)} style={filterSelectStyle}>
            <option value="">All Genres</option>
            {GENRES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select value={mood} onChange={(e) => setMood(e.target.value)} style={filterSelectStyle}>
            <option value="">Any Mood</option>
            {MOODS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...filterSelectStyle, marginLeft: "auto" }}>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="most_played">Sort: Most Played</option>
            <option value="price_low">Sort: Price Low</option>
            <option value="price_high">Sort: Price High</option>
          </select>
        </div>
      </div>

      {/* Beat Grid */}
      <div style={{ padding: "40px 48px 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem", padding: "80px 0", textAlign: "center" }}>
              Loading beats...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem", padding: "80px 0", textAlign: "center" }}>
              No beats found.
            </div>
          ) : (
            <div className="beat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
              {filtered.map((beat) => {
                const isThisBeatPlaying = String(currentBeat?.id) === String(beat.id) && isPlaying
                const favorited = isFavorited(String(beat.id))

                return (
                  <div
                    key={beat.id}
                    className="beat-card"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: `1px solid ${isThisBeatPlaying ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "12px", overflow: "hidden",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                    }}
                  >
                    {/* Cover */}
                    <div
                      onClick={() => router.push(`/beat/${beat.slug}`)}
                      style={{
                        position: "relative", aspectRatio: "1",
                        background: beat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat.genre)} 0%, #0a0a0a 100%)`,
                        backgroundColor: "#0a0a0a", cursor: "pointer",
                      }}
                    >
                      {beat.cover_url ? (
                        <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.4rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 12px" }}>
                            {beat.title.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Featured / Sold badge */}
                      {beat.is_featured && !beat.is_exclusive_sold && (
                        <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "var(--gold)", color: "#000", fontSize: "0.6rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", zIndex: 2 }}>
                          Featured
                        </div>
                      )}
                      {beat.is_exclusive_sold && (
                        <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(255,50,50,0.9)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", zIndex: 2 }}>
                          Sold
                        </div>
                      )}

                      {/* Share trigger */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShareBeat(beat) }}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "20px", padding: "4px 10px",
                          color: "var(--text-muted)", fontSize: "0.85rem",
                          cursor: "pointer", zIndex: 2, lineHeight: 1,
                          WebkitAppearance: "none" as any, outline: "none",
                        }}
                      >
                        ···
                      </button>

                      {/* Wave bars when playing */}
                      {isThisBeatPlaying && (
                        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3 }}>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "28px" }}>
                            {[1, 2, 3, 4].map((b) => (
                              <div key={b} className={`wave-bar-${b}`} style={{ width: "3px", height: "18px", backgroundColor: "var(--gold)", borderRadius: "2px", transformOrigin: "bottom" }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Play / Pause */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlay(beat) }}
                        style={{
                          position: "absolute", bottom: "12px", right: "12px",
                          width: "40px", height: "40px", borderRadius: "50%",
                          backgroundColor: "var(--gold)", border: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", zIndex: 4,
                          boxShadow: "0 4px 12px rgba(201,168,76,0.4)",
                          WebkitAppearance: "none" as any, outline: "none",
                        }}
                      >
                        {isThisBeatPlaying
                          ? <svg width="12" height="12" viewBox="0 0 12 12" fill="#000"><rect x="1" y="0" width="4" height="12" rx="1" /><rect x="7" y="0" width="4" height="12" rx="1" /></svg>
                          : <span style={{ color: "#000", fontSize: "0.75rem", marginLeft: "2px" }}>▶</span>
                        }
                      </button>
                    </div>

                    {/* Info */}
                    <div
                      onClick={() => router.push(`/beat/${beat.slug}`)}
                      style={{ padding: "16px", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", gap: "8px" }}>
                        <h3 style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: 1.3, flex: 1, margin: 0 }}>
                          {beat.title}
                        </h3>
                        {/* Heart */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(String(beat.id)) }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: favorited ? "var(--gold)" : "rgba(245,240,232,0.4)",
                            fontSize: "1.1rem", padding: "0", flexShrink: 0,
                            lineHeight: 1, transition: "color 0.2s ease",
                            WebkitAppearance: "none" as any, outline: "none",
                          }}
                        >
                          {favorited ? "♥" : "♡"}
                        </button>
                      </div>

                      <div style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", fontWeight: 600, marginBottom: "8px" }}>
                        {beat.genre}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                        <span style={{ color: "var(--border-dim)" }}>•</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{beat.key}</span>
                        {beat.duration && (
                          <>
                            <span style={{ color: "var(--border-dim)" }}>•</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{beat.duration}</span>
                          </>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                          from ₦{beat.basic_price.toLocaleString()}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(beat.id, "basic") }}
                          style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            backgroundColor: "var(--gold)", border: "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            WebkitAppearance: "none" as any, outline: "none", flexShrink: 0,
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareBeat && (
        <div
          onClick={() => setShareBeat(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "16px", width: "100%", maxWidth: "460px",
              padding: "36px", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                Share Beat
              </h3>
              <button
                onClick={() => setShareBeat(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, WebkitAppearance: "none" as any, outline: "none" }}
              >✕</button>
            </div>

            {/* Beat preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", padding: "18px", backgroundColor: "var(--bg-elevated)", borderRadius: "12px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "8px", flexShrink: 0,
                background: shareBeat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(shareBeat.genre)}, #0a0a0a)`,
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {shareBeat.cover_url
                  ? <img src={shareBeat.cover_url} alt={shareBeat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", fontFamily: "var(--font-mono)" }}>{shareBeat.title.slice(0, 2).toUpperCase()}</span>
                }
              </div>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "4px" }}>{shareBeat.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>{shareBeat.genre} · {shareBeat.bpm} BPM · {shareBeat.key}</div>
              </div>
            </div>

            {/* Copy link */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}`}
                style={{
                  flex: 1, padding: "12px 16px",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", color: "var(--text-secondary)",
                  fontSize: "0.82rem", fontFamily: "var(--font-mono)", outline: "none",
                }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/beat/${shareBeat.slug}`)}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", borderRadius: "8px",
                  color: "#000", fontSize: "0.82rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", cursor: "pointer",
                  letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >Copy</button>
            </div>

            {/* Social links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Twitter / X", icon: "✕", url: `https://x.com/intent/tweet?text=Check out "${shareBeat.title}" by Senior Man KP&url=${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "WhatsApp", icon: "💬", url: `https://wa.me/?text=Check out "${shareBeat.title}" by Senior Man KP — ${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "Instagram", icon: "◉", url: "https://instagram.com" },
                { label: "TikTok", icon: "♪", url: "https://tiktok.com" },
              ].map((s) => (
                <a
                  key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "13px 16px",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", textDecoration: "none",
                    color: "rgba(245,240,232,0.75)", fontSize: "0.88rem",
                    fontFamily: "var(--font-ui)", fontWeight: 500,
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{s.icon}</span>{s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) { .beat-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) {
          .beat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </main>
  )
}
