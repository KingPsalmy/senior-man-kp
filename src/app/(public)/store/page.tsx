"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"

const mockBeats = [
  { id: 1, title: "Midnight Drive", genre: "Afrobeat", bpm: 98, key: "F# Minor", price: 10000, isNew: true, color: "#1a0a2e" },
  { id: 2, title: "Higher", genre: "Afro Fusion", bpm: 104, key: "G Minor", price: 10000, isNew: false, color: "#0a1a2e" },
  { id: 3, title: "No Limit", genre: "Trap", bpm: 120, key: "C Minor", price: 10000, isNew: false, color: "#2e0a0a" },
  { id: 4, title: "Timeless", genre: "R&B", bpm: 90, key: "A Minor", price: 10000, isNew: false, color: "#0a2e1a" },
  { id: 5, title: "Sauce", genre: "Trap", bpm: 140, key: "D Minor", price: 10000, isNew: false, color: "#2e1a0a" },
  { id: 6, title: "Paradise", genre: "Afro Fusion", bpm: 96, key: "E Minor", price: 10000, isNew: false, color: "#0a2e2e" },
  { id: 7, title: "Cold World", genre: "Drill", bpm: 143, key: "F Minor", price: 10000, isNew: false, color: "#1a1a2e" },
  { id: 8, title: "Breathe", genre: "Afro Fusion", bpm: 88, key: "A Minor", price: 10000, isNew: false, color: "#2e0a1a" },
]

export default function StorePage() {
  const [playing, setPlaying] = useState<number | null>(null)
  const [currentBeat, setCurrentBeat] = useState(mockBeats[0])

  function handlePlay(beat: typeof mockBeats[0]) {
    setPlaying(playing === beat.id ? null : beat.id)
    setCurrentBeat(beat)
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
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "300px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.8rem" }}>🔍</span>
          <input
            type="text"
            placeholder="Search beats..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-dim)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              fontSize: "0.78rem",
              fontFamily: "var(--font-ui)",
              outline: "none",
            }}
          />
        </div>

        {/* Dropdowns */}
        {[
          { label: "Genre", options: ["All Genres", "Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"] },
          { label: "Mood", options: ["Any Mood", "Dark", "Euphoric", "Melancholic", "Energetic"] },
          { label: "BPM", options: ["Any BPM", "60–89", "90–119", "120+"] },
          { label: "Key", options: ["Any Key", "A Minor", "C Minor", "D Minor", "F Minor", "G Minor"] },
        ].map((f) => (
          <select key={f.label} style={{
            padding: "9px 14px",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-dim)",
            borderRadius: "4px",
            color: "var(--text-secondary)",
            fontSize: "0.75rem",
            fontFamily: "var(--font-ui)",
            outline: "none",
            cursor: "pointer",
          }}>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}

        {/* Sort */}
        <select style={{
          padding: "9px 14px",
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          borderRadius: "4px",
          color: "var(--text-secondary)",
          fontSize: "0.75rem",
          fontFamily: "var(--font-ui)",
          outline: "none",
          cursor: "pointer",
          marginLeft: "auto",
        }}>
          <option>Sort: Newest</option>
          <option>Sort: Price Low</option>
          <option>Sort: Price High</option>
        </select>
      </div>

      {/* Beat Grid */}
      <div className="store-grid-wrap" style={{ padding: "28px 48px 0" }}>
        <div className="beat-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
            }}>
          {mockBeats.map((beat) => (
            <div key={beat.id} style={{
              backgroundColor: "var(--bg-card)",
              border: `1px solid ${playing === beat.id ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
              borderRadius: "6px",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}>
              {/* Cover Art */}
              <div style={{
                position: "relative",
                aspectRatio: "1",
                background: `linear-gradient(135deg, ${beat.color} 0%, #0a0a0a 100%)`,
              }}>
                {/* New tag */}
                {beat.isNew && (
                  <div style={{
                    position: "absolute", top: "10px", left: "10px",
                    backgroundColor: "var(--gold)", color: "#000",
                    fontSize: "0.55rem", fontWeight: 700,
                    padding: "3px 8px", borderRadius: "2px",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                    textTransform: "uppercase", zIndex: 2,
                  }}>New</div>
                )}

                {/* Options */}
                <div style={{
                  position: "absolute", top: "10px", right: "12px",
                  color: "var(--text-muted)", fontSize: "1rem",
                  zIndex: 2, cursor: "pointer",
                }}>···</div>

                {/* Title watermark */}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    color: "rgba(255,255,255,0.06)",
                    fontSize: "1.6rem", fontWeight: 900,
                    fontFamily: "var(--font-ui)", textAlign: "center",
                    padding: "0 12px", lineHeight: 1.1,
                  }}>
                    {beat.title.toUpperCase()}
                  </span>
                </div>

                {/* Playing indicator */}
                {playing === beat.id && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    zIndex: 3,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px" }}>
                      {[1, 2, 3, 4].map((b) => (
                        <div key={b} style={{
                          width: "3px",
                          backgroundColor: "var(--gold)",
                          borderRadius: "2px",
                          animation: `barBounce${b} 0.8s ease-in-out infinite`,
                          height: `${Math.random() * 16 + 8}px`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Play button */}
                <button
                  onClick={() => handlePlay(beat)}
                  style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    width: "38px", height: "38px", borderRadius: "50%",
                    backgroundColor: "var(--gold)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 2,
                    boxShadow: "0 4px 12px rgba(201,168,76,0.4)",
                  }}>
                  <span style={{ color: "#000", fontSize: "0.7rem", marginLeft: playing === beat.id ? "0" : "2px" }}>
                    {playing === beat.id ? "■" : "▶"}
                  </span>
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "4px" }}>
                  <Link href={`/beat/${beat.id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{
                      color: "var(--text-primary)", fontSize: "0.95rem",
                      fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: 1.2,
                    }}>{beat.title}</h3>
                  </Link>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", marginLeft: "8px", flexShrink: 0 }}>♡</span>
                </div>

                <div style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", marginBottom: "8px", fontWeight: 500 }}>
                  {beat.genre}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                  <span style={{ color: "var(--border-dim)" }}>•</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{beat.key}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                    from ₦{beat.price.toLocaleString()}
                  </span>
                  <button style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    backgroundColor: "var(--gold)", border: "none",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
                  }}>🛒</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Player */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(201,168,76,0.2)",
        padding: "0 32px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
      }}>
        {/* Cover + Info */}
        <div className="floating-player-info" style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
            background: `linear-gradient(135deg, ${currentBeat.color}, #0a0a0a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
              {currentBeat.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
              {currentBeat.title}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
              {currentBeat.genre} • {currentBeat.bpm} BPM
            </div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "1.1rem", cursor: "pointer", marginLeft: "8px" }}>♡</span>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Shuffle */}
            <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}>⇄</button>
            {/* Prev */}
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem" }}>⏮</button>
            {/* Play */}
            <button
              onClick={() => setPlaying(playing ? null : currentBeat.id)}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: "var(--gold)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "0.85rem",
              }}>
              <span style={{ color: "#000", marginLeft: playing ? "0" : "2px" }}>
                {playing ? "■" : "▶"}
              </span>
            </button>
            {/* Next */}
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem" }}>⏭</button>
            {/* Repeat */}
            <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}>↺</button>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "500px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)" }}>0:00</span>
            <div style={{ flex: 1, height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px", cursor: "pointer" }}>
              <div style={{ width: "30%", height: "100%", backgroundColor: "var(--gold)", borderRadius: "2px" }} />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)" }}>3:24</span>
          </div>
        </div>

        {/* Right — Volume + License */}
        <div className="floating-player-volume" style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "200px", justifyContent: "flex-end" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>🔊</span>
          <div style={{ width: "80px", height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px" }}>
            <div style={{ width: "70%", height: "100%", backgroundColor: "var(--text-muted)", borderRadius: "2px" }} />
          </div>
          <button style={{
            backgroundColor: "var(--gold)", border: "none",
            borderRadius: "3px", padding: "8px 16px",
            color: "#000", fontSize: "0.65rem", fontWeight: 700,
            fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer",
          }}>
            License
          </button>
        </div>
      </div>

    </main>
  )
}