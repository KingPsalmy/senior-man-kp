"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { usePlayerStore } from "@/store/playerStore"
import { addToCart } from "@/lib/cart"

const LICENSE_OPTIONS = [
  { value: "basic", label: "Basic License", price: 30000, features: ["MP3 & WAV", "Non-exclusive", "Up to 10k streams"] },
  { value: "premium", label: "Premium License", price: 70000, features: ["MP3, WAV & Stems", "Non-exclusive", "Unlimited streams"] },
  { value: "unlimited", label: "Unlimited License", price: 120000, features: ["MP3, WAV & Stems", "Non-exclusive", "Unlimited + Radio"] },
  { value: "exclusive", label: "Exclusive License", price: 180000, features: ["MP3, WAV & Stems", "100% Exclusive", "Removed from store"] },
]

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

export default function StorePage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [shareBeat, setShareBeat] = useState<Beat | null>(null)
  const [cartBeat, setCartBeat] = useState<Beat | null>(null)
  const [selectedLicense, setSelectedLicense] = useState("basic")
  const [addedToCart, setAddedToCart] = useState(false)
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [sort, setSort] = useState("newest")
  const router = useRouter()
  const { currentBeat, isPlaying, play, pause, setQueue } = usePlayerStore()

  useEffect(() => {
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
    if (currentBeat?.id?.toString() === beat.id && isPlaying) {
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

  async function handleAddToCart() {
    if (!cartBeat) return
    await addToCart(cartBeat.id, selectedLicense as any)
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      setCartBeat(null)
      setSelectedLicense("basic")
    }, 1500)
  }

  function genreColor(genre: string) {
    const map: Record<string, string> = {
      "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
      "Trap": "#2e0a0a", "R&B": "#0a2e1a",
      "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
    }
    return map[genre] || "#111111"
  }

  const selectStyle = {
    padding: "9px 14px",
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-dim)",
    borderRadius: "4px", color: "var(--text-secondary)",
    fontSize: "0.75rem", fontFamily: "var(--font-ui)",
    outline: "none", cursor: "pointer",
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      {/* Header */}
      <div className="store-header" style={{ paddingTop: "80px", padding: "80px 48px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "var(--text-muted)" }}>›</span>
          <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>Beats</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          All Beats
        </h1>
      </div>

      {/* Filters */}
      <div className="store-filter-bar" style={{
        padding: "16px 48px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
      }}>
        <div className="store-filters" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1 }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "300px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.8rem" }}>🔍</span>
            <input
              type="text"
              placeholder="Search beats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 34px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "4px", color: "var(--text-primary)",
                fontSize: "0.78rem", fontFamily: "var(--font-ui)", outline: "none",
              }}
            />
          </div>

          <select value={genre} onChange={(e) => setGenre(e.target.value)} style={selectStyle}>
            {["All Genres", "Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"].map((o) => (
              <option key={o} value={o === "All Genres" ? "" : o}>{o}</option>
            ))}
          </select>

          <select value={mood} onChange={(e) => setMood(e.target.value)} style={selectStyle}>
            {["Any Mood", "Dark", "Euphoric", "Melancholic", "Energetic"].map((o) => (
              <option key={o} value={o === "Any Mood" ? "" : o}>{o}</option>
            ))}
          </select>
        </div>

        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="most_played">Sort: Most Played</option>
          <option value="price_low">Sort: Price Low</option>
          <option value="price_high">Sort: Price High</option>
        </select>
      </div>

      {/* Beat Grid */}
      <div className="store-grid-wrap" style={{ padding: "28px 48px 0" }}>
        {loading ? (
          <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "48px 0", textAlign: "center" }}>Loading beats...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "48px 0", textAlign: "center" }}>No beats found.</div>
        ) : (
          <div className="beat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {filtered.map((beat) => {
              const isThisBeatPlaying = currentBeat?.id != null && String(currentBeat.id) === beat.id && isPlaying
              return (
                <div
                  key={beat.id}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: `1px solid ${isThisBeatPlaying ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                    borderRadius: "6px", overflow: "hidden", transition: "all 0.2s ease",
                  }}
                >
                  {/* Cover Art */}
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
                        <span style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.6rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 12px" }}>
                          {beat.title.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {beat.is_featured && !beat.is_exclusive_sold && (
                      <div style={{
                        position: "absolute", top: "10px", left: "10px",
                        backgroundColor: "var(--gold)", color: "#000",
                        fontSize: "0.55rem", fontWeight: 700,
                        padding: "3px 8px", borderRadius: "2px",
                        fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                        textTransform: "uppercase", zIndex: 2,
                      }}>Featured</div>
                    )}

                    {beat.is_exclusive_sold && (
                      <div style={{
                        position: "absolute", top: "10px", left: "10px",
                        backgroundColor: "rgba(255,50,50,0.9)", color: "#fff",
                        fontSize: "0.55rem", fontWeight: 700,
                        padding: "3px 8px", borderRadius: "2px",
                        fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                        textTransform: "uppercase", zIndex: 2,
                      }}>Sold</div>
                    )}

                    <div onClick={(e) => { e.stopPropagation(); setShareBeat(beat) }} style={{
                      position: "absolute", top: "10px", right: "12px",
                      color: "var(--text-muted)", fontSize: "1rem", zIndex: 2, cursor: "pointer",
                    }}>···</div>

                    {/* Playing waveform indicator */}
                    {isThisBeatPlaying && (
                      <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.4)", zIndex: 3, pointerEvents: "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px" }}>
                          {[14, 20, 10, 18].map((h, i) => (
                            <div key={i} style={{
                              width: "3px", backgroundColor: "var(--gold)", borderRadius: "2px", height: `${h}px`,
                            }} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Play/Pause button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(beat) }}
                      style={{
                        position: "absolute", bottom: "12px", right: "12px",
                        width: "38px", height: "38px", borderRadius: "50%",
                        backgroundColor: "var(--gold)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", zIndex: 4,
                        boxShadow: "0 4px 12px rgba(201,168,76,0.4)",
                        WebkitAppearance: "none", appearance: "none", outline: "none",
                      }}
                    >
                      {isThisBeatPlaying ? (
                        /* Pause icon — two bars */
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="#000">
                          <rect x="1" y="0" width="4" height="12" rx="1" />
                          <rect x="7" y="0" width="4" height="12" rx="1" />
                        </svg>
                      ) : (
                        /* Play icon */
                        <span style={{ color: "#000", fontSize: "0.7rem", marginLeft: "2px", lineHeight: 1 }}>▶</span>
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "4px" }}>
                      <h3
                        onClick={() => router.push(`/beat/${beat.slug}`)}
                        style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: 1.2, cursor: "pointer" }}
                      >
                        {beat.title}
                      </h3>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>♡</span>
                    </div>

                    {/* Genre tag — clickable */}
                    <div
                      onClick={() => setGenre(beat.genre === genre ? "" : beat.genre)}
                      style={{
                        color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)",
                        marginBottom: "8px", fontWeight: 500, cursor: "pointer",
                        display: "inline-block",
                        textDecoration: genre === beat.genre ? "underline" : "none",
                      }}
                    >
                      {beat.genre}
                    </div>

                    {/* BPM / Key / Duration tags — clickable */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span
                        onClick={() => setSearch(String(beat.bpm))}
                        style={{
                          color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)",
                          cursor: "pointer", borderBottom: "1px dotted rgba(245,240,232,0.2)",
                        }}
                      >{beat.bpm} BPM</span>
                      <span style={{ color: "var(--border-dim)" }}>•</span>
                      <span
                        onClick={() => setSearch(beat.key)}
                        style={{
                          color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)",
                          cursor: "pointer", borderBottom: "1px dotted rgba(245,240,232,0.2)",
                        }}
                      >{beat.key}</span>
                      {beat.duration && (
                        <>
                          <span style={{ color: "var(--border-dim)" }}>•</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{beat.duration}</span>
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        onClick={() => router.push(`/beat/${beat.slug}`)}
                        style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer" }}
                      >
                        from ₦{beat.basic_price.toLocaleString()}
                      </span>

                      {/* Cart button — opens license picker */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCartBeat(beat)
                          setSelectedLicense("basic")
                          setAddedToCart(false)
                        }}
                        style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          backgroundColor: "var(--gold)", border: "none",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          WebkitAppearance: "none", appearance: "none", outline: "none", flexShrink: 0,
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

      {/* ── License Picker Modal ── */}
      {cartBeat && (
        <div
          onClick={() => setCartBeat(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "28px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                Choose License
              </h3>
              <button onClick={() => setCartBeat(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>

            {/* Beat info */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "12px 14px", backgroundColor: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
                background: cartBeat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(cartBeat.genre)}, #0a0a0a)`,
                overflow: "hidden",
              }}>
                {cartBeat.cover_url
                  ? <img src={cartBeat.cover_url} alt={cartBeat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", fontFamily: "var(--font-mono)" }}>{cartBeat.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                }
              </div>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{cartBeat.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)" }}>{cartBeat.genre} • {cartBeat.bpm} BPM</div>
              </div>
            </div>

            {/* License options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {LICENSE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setSelectedLicense(option.value)}
                  style={{
                    padding: "14px 16px",
                    backgroundColor: selectedLicense === option.value ? "rgba(201,168,76,0.06)" : "var(--bg-elevated)",
                    border: `1px solid ${selectedLicense === option.value ? "rgba(201,168,76,0.4)" : "var(--border-dim)"}`,
                    borderRadius: "6px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Radio dot */}
                    <div style={{
                      width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${selectedLicense === option.value ? "var(--gold)" : "var(--border-dim)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {selectedLicense === option.value && (
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--gold)" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "2px" }}>
                        {option.label}
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {option.features.map((f) => (
                          <span key={f} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-ui)" }}>✓ {f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    color: selectedLicense === option.value ? "var(--gold)" : "var(--text-primary)",
                    fontSize: "0.9rem", fontWeight: 800, fontFamily: "var(--font-ui)", flexShrink: 0, marginLeft: "12px",
                  }}>
                    ₦{option.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              style={{
                width: "100%", padding: "14px",
                background: addedToCart ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                border: "none", borderRadius: "4px", cursor: "pointer",
                color: addedToCart ? "var(--gold)" : "#000",
                fontSize: "0.75rem", fontWeight: 800,
                fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >
              {addedToCart
                ? "✓ Added to Cart"
                : `Add to Cart — ₦${LICENSE_OPTIONS.find(o => o.value === selectedLicense)?.price.toLocaleString()}`
              }
            </button>

            {addedToCart && (
              <Link href="/cart" style={{
                display: "block", textAlign: "center", marginTop: "12px",
                color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none",
              }}>
                View Cart →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {shareBeat && (
        <div onClick={() => setShareBeat(null)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "12px", width: "100%", maxWidth: "420px", padding: "28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Share Beat</h3>
              <button onClick={() => setShareBeat(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", padding: "14px", backgroundColor: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
                background: shareBeat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(shareBeat.genre)}, #0a0a0a)`,
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {shareBeat.cover_url
                  ? <img src={shareBeat.cover_url} alt={shareBeat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", fontFamily: "var(--font-mono)" }}>{shareBeat.title.slice(0, 2).toUpperCase()}</span>
                }
              </div>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{shareBeat.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)" }}>{shareBeat.genre} • {shareBeat.bpm} BPM</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}`}
                style={{ flex: 1, padding: "10px 12px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", outline: "none" }}
              />
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/beat/${shareBeat.slug}`)}
                style={{ padding: "10px 16px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", border: "none", borderRadius: "4px", color: "#000", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}
              >Copy</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Twitter / X", icon: "✕", url: `https://x.com/intent/tweet?text=Check out "${shareBeat.title}" by Senior Man KP&url=${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "WhatsApp", icon: "💬", url: `https://wa.me/?text=Check out "${shareBeat.title}" by Senior Man KP — ${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "Instagram", icon: "◉", url: `https://instagram.com` },
                { label: "TikTok", icon: "♪", url: `https://tiktok.com` },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px",
                  backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)",
                  borderRadius: "6px", textDecoration: "none", color: "var(--text-secondary)",
                  fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 500,
                }}>
                  <span>{s.icon}</span>{s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
