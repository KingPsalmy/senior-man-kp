"use client"

import { useState, useEffect } from "react"
import HeroParticles from "@/components/ui/HeroParticles"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

const featuredBeats = [
  { id: 1, title: "Midnight Drive", genre: "Afrobeat", bpm: 98, key: "F# Minor", price: 30000, color: "#1a0a2e" },
  { id: 2, title: "Higher", genre: "Afro Fusion", bpm: 104, key: "G Minor", price: 30000, color: "#0a1a2e" },
  { id: 3, title: "No Limit", genre: "Trap", bpm: 120, key: "C Minor", price: 30000, color: "#2e0a0a" },
  { id: 4, title: "Timeless", genre: "R&B", bpm: 90, key: "A Minor", price: 30000, color: "#0a2e1a" },
]

const learnMoreItems = [
  {
    title: "Licensing Info",
    desc: "Understand what you get with each license tier — Basic, Premium, and Exclusive.",
    link: "/licensing",
    cta: "View Licenses",
    external: false,
  },
  {
    title: "Frequently Asked Questions",
    desc: "All the frequently asked questions for both licenses and how to work with Senior Man KP.",
    link: "/faq",
    cta: "Read FAQ",
    external: false,
  },
  {
    title: "Contact Producer",
    desc: "Have a custom project in mind? Reach out directly to discuss collaboration.",
    link: "mailto:kingpsalmyofficial@gmail.com",
    cta: "Get in Touch",
    external: true,
  },
]

export default function HomePage() {
  const [heroLeft, setHeroLeft] = useState(1)
  const [shareBeat, setShareBeat] = useState<typeof featuredBeats[0] | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroLeft((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero-section" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>

        {/* Right studio image */}
        <div className="hero-image" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "70%", pointerEvents: "none", zIndex: 0 }}>
          <img
            src="/hero-pic.png"
            alt="Senior Man KP Studio"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 1 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #020202 0%, #020202 3%, rgba(2,2,2,0.85) 18%, rgba(2,2,2,0.3) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #020202 0%, transparent 52%)" }} />
        </div>

        {/* Left producer photo — slideshow */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "65%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
          <img
            src={heroLeft === 1 ? "/hero-pic-left.png" : heroLeft === 2 ? "/hero-pic-left-2.png" : "/hero-pic-left-3.png"}
            alt="Senior Man KP"
            style={{
              width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%",
              opacity: 0.75, mixBlendMode: "luminosity",
              filter: "brightness(0.85) contrast(1.1) grayscale(1)",
              transition: "opacity 1.5s ease-in-out",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.5) 70%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.5) 70%, transparent 100%)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg-void) 0%, transparent 25%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, var(--bg-void) 0%, transparent 15%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg-void) 0%, transparent 8%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 0%, rgba(2,2,2,0.4) 30%, rgba(2,2,2,0.7) 55%, var(--bg-void) 80%)" }} />
        </div>

        <HeroParticles />

        {/* Hero content */}
        <div className="hero-content" style={{ position: "relative", zIndex: 10, paddingLeft: "clamp(24px, 8vw, 140px)", paddingRight: "24px", maxWidth: "600px", width: "100%" }}>

          <h1 style={{ fontSize: "clamp(2.5rem, 3.8vw, 4.2rem)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "20px", fontFamily: "var(--font-ui)" }}>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Find Your Sound.</span>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Own It.</span>
            <span style={{ display: "block", fontStyle: "italic", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create Freely.
            </span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "24px", maxWidth: "380px", fontFamily: "var(--font-ui)" }}>
            Original instrumentals for artists building something real.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", display: "flex", marginBottom: "14px", maxWidth: "480px" }}>
            <input
              type="text"
              placeholder="What do you need today?"
              style={{
                flex: 1, padding: "14px 16px",
                backgroundColor: "rgba(22,22,22,0.9)",
                border: "1px solid var(--border-gold)",
                borderRadius: "4px 0 0 4px",
                color: "var(--text-primary)", fontSize: "0.78rem",
                fontFamily: "var(--font-ui)", outline: "none",
                backdropFilter: "blur(10px)",
              }}
            />
            <button style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "0 4px 4px 0",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Quick filters */}
          <div className="hero-filters" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
            {[
              { type: "select", placeholder: "Mood / Feel", options: ["Chill", "Dark", "Energetic", "Emotional", "Melodic", "Happy", "Ambient"] },
              { type: "select", placeholder: "Genre", options: ["Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"] },
            ].map((filter) => (
              <select key={filter.placeholder} style={{
                padding: "10px 14px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px", color: "var(--text-secondary)",
                fontSize: "0.72rem", fontFamily: "var(--font-ui)",
                outline: "none", cursor: "pointer",
              }}>
                <option>{filter.placeholder}</option>
                {filter.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
            <input
              type="number"
              placeholder="BPM"
              style={{
                padding: "10px 14px", width: "90px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px", color: "var(--text-secondary)",
                fontSize: "0.72rem", fontFamily: "var(--font-ui)", outline: "none",
              }}
            />
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
            <Link href="/store" style={{
              padding: "13px 28px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none", color: "#000",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)", borderRadius: "3px",
              fontFamily: "var(--font-ui)",
            }}>
              Browse Beats
            </Link>
            <Link href="/licensing" style={{
              padding: "13px 28px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none", color: "var(--gold)",
              border: "1px solid rgba(201,168,76,0.3)", borderRadius: "3px",
              fontFamily: "var(--font-ui)",
            }}>
              How It Works ▶
            </Link>
          </div>

          {/* Genre tags */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                Browse by Genre
              </span>
              <Link href="/store" style={{ color: "var(--gold)", fontSize: "0.6rem", textDecoration: "none", fontFamily: "var(--font-mono)" }}>
                View all
              </Link>
            </div>
            <div className="genre-tags" style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
              {["Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"].map((genre) => (
                <Link key={genre} href={`/store?genre=${genre.toLowerCase()}`} style={{
                  padding: "8px 14px", border: "1px solid var(--border-dim)", borderRadius: "3px",
                  color: "var(--text-secondary)", fontSize: "0.65rem", textDecoration: "none",
                  backgroundColor: "var(--bg-elevated)", whiteSpace: "nowrap",
                  fontFamily: "var(--font-ui)", fontWeight: 500,
                }}>
                  {genre}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Featured Beats ── */}
      <section className="section-padding" style={{ padding: "80px 48px", backgroundColor: "var(--bg-void)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Featured Beats
              </span>
              <h2 style={{ color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", marginTop: "4px" }}>
                Latest Drops
              </h2>
            </div>
            <Link href="/store" style={{
              padding: "10px 24px", fontSize: "0.7rem", fontWeight: 700,
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              borderRadius: "3px", textDecoration: "none", color: "#000",
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              See More
            </Link>
          </div>

          <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", width: "100%" }}>
            {featuredBeats.map((beat) => (
              <div key={beat.id} style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px", overflow: "hidden",
              }}>
                {/* Cover */}
                <div style={{ position: "relative", aspectRatio: "1", background: `linear-gradient(135deg, ${beat.color} 0%, #0a0a0a 100%)` }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.4rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 12px" }}>
                      {beat.title.toUpperCase()}
                    </span>
                  </div>
                  {/* Share trigger */}
                  <div
                    onClick={() => setShareBeat(beat)}
                    style={{
                      position: "absolute", top: "10px", right: "12px",
                      color: "var(--text-muted)", fontSize: "1rem",
                      zIndex: 2, cursor: "pointer",
                    }}>···</div>
                  <button style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    width: "36px", height: "36px", borderRadius: "50%",
                    backgroundColor: "var(--gold)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <span style={{ color: "#000", fontSize: "0.7rem", marginLeft: "2px" }}>▶</span>
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: "14px" }}>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "4px" }}>
                    {beat.title}
                  </h3>
                  <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)", marginBottom: "8px" }}>{beat.genre}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                    <span style={{ color: "var(--border-dim)" }}>•</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{beat.key}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href={`/beat/${beat.id}`} style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                      from ₦{beat.price.toLocaleString()}
                    </Link>
                    <button style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "var(--gold)", border: "none", cursor: "pointer", fontSize: "0.7rem" }}>
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Learn More ── */}
      <section className="section-padding" style={{ padding: "80px 48px", backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Learn More
          </span>
          <h2 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "8px", marginBottom: "48px" }}>
            Everything You Need to Know
          </h2>

          <div className="learn-more-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", width: "100%" }}>
            {learnMoreItems.map((item) => (
              <div key={item.title} style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px", padding: "32px", textAlign: "left",
              }}>
                <h3 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)", lineHeight: 1.7, marginBottom: "20px" }}>
                  {item.desc}
                </p>
                {item.external ? (
                  <a href={item.link} style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 600, textDecoration: "none" }}>
                    {item.cta} →
                  </a>
                ) : (
                  <Link href={item.link} style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 600, textDecoration: "none" }}>
                    {item.cta} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Share Modal ── */}
      {shareBeat && (
        <div
          onClick={() => setShareBeat(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "12px",
              width: "100%", maxWidth: "420px",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                Share Beat
              </h3>
              <button onClick={() => setShareBeat(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", padding: "14px", backgroundColor: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
                background: `linear-gradient(135deg, ${shareBeat.color}, #0a0a0a)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", fontFamily: "var(--font-mono)" }}>
                  {shareBeat.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{shareBeat.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)" }}>{shareBeat.genre} • {shareBeat.bpm} BPM</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.id}`}
                style={{
                  flex: 1, padding: "10px 12px",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "4px", color: "var(--text-secondary)",
                  fontSize: "0.72rem", fontFamily: "var(--font-mono)", outline: "none",
                }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/beat/${shareBeat.id}`)}
                style={{
                  padding: "10px 16px",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", borderRadius: "4px",
                  color: "#000", fontSize: "0.68rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", cursor: "pointer",
                  letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >Copy</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Twitter / X", icon: "✕", url: `https://x.com/intent/tweet?text=Check out "${shareBeat.title}" by Senior Man KP&url=${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.id}` },
                { label: "WhatsApp", icon: "💬", url: `https://wa.me/?text=Check out "${shareBeat.title}" by Senior Man KP — ${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.id}` },
                { label: "Instagram", icon: "◉", url: `https://instagram.com` },
                { label: "TikTok", icon: "♪", url: `https://tiktok.com` },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 14px",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "6px", textDecoration: "none",
                  color: "var(--text-secondary)", fontSize: "0.72rem",
                  fontFamily: "var(--font-ui)", fontWeight: 500,
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