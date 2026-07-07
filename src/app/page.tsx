"use client"

import { useState, useEffect } from "react"
import HeroParticles from "@/components/ui/HeroParticles"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { usePlayerStore } from "@/store/playerStore"
import { useFavorite } from "@/hooks/useFavorites"
import { addToCart, LicenseType } from "@/lib/cart"

function HeartButton({ beatId }: { beatId: string }) {
  const { favorited, toggle } = useFavorite(beatId)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle() }}
      style={{
        position: "absolute", top: "10px", left: "10px",
        width: "32px", height: "32px", borderRadius: "50%",
        backgroundColor: favorited ? "rgba(201,168,76,0.9)" : "rgba(0,0,0,0.5)",
        border: favorited ? "none" : "1px solid rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: "0.85rem", zIndex: 2,
        color: favorited ? "#000" : "rgba(255,255,255,0.7)",
        transition: "all 0.2s ease",
        WebkitAppearance: "none" as any, outline: "none",
      }}
    >
      {favorited ? "♥" : "♡"}
    </button>
  )
}

const genreColor: Record<string, string> = {
  "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e", "Trap": "#2e0a0a",
  "R&B": "#0a2e1a", "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
}

function getLicenseOptions(beat: any) {
  return [
    { value: "basic" as LicenseType, label: "Basic", price: beat.basic_price, disabled: false },
    { value: "premium" as LicenseType, label: "Premium", price: beat.premium_price, disabled: false },
    { value: "unlimited" as LicenseType, label: "Unlimited", price: beat.unlimited_price, disabled: false },
    { value: "exclusive" as LicenseType, label: "Exclusive", price: beat.exclusive_price, disabled: beat.is_exclusive_sold },
  ]
}

export default function HomePage() {
  const router = useRouter()
  const [heroLeft, setHeroLeft] = useState(1)
  const [featuredBeats, setFeaturedBeats] = useState<any[]>([])
  const [shareBeat, setShareBeat] = useState<any | null>(null)
  const [licenseBeat, setLicenseBeat] = useState<any | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>("basic")
  const [justAdded, setJustAdded] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const { setQueue, play, pause, currentBeat, isPlaying, lastPlayed, hydrateHistory } = usePlayerStore()

  useEffect(() => {
    hydrateHistory()
    async function fetchFeatured() {
      const { data } = await supabase
        .from("beats").select("*")
        .eq("is_published", true).eq("is_featured", true)
        .order("created_at", { ascending: false }).limit(4)
      if (data) {
        setFeaturedBeats(data)
        // Only auto-play on a genuinely fresh session (nothing currently loaded).
        // Prevents restarting playback every time the user navigates back home.
        if (!currentBeat) {
          setQueue(data)
          play(data[0])
        }
      }
    }
    fetchFeatured()
    const t = setTimeout(() => setSubtitleVisible(true), 500)
    const interval = setInterval(() => {
      setHeroLeft((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))
    }, 25000)
    return () => { clearInterval(interval); clearTimeout(t) }
  }, [])

  const controlStyle = {
    padding: "13px 18px",
    backgroundColor: "rgba(16,16,16,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "rgba(245,240,232,0.7)",
    fontSize: "0.88rem",
    fontFamily: "var(--font-ui)",
    outline: "none",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  }

  function openLicensePicker(beat: any) {
    setSelectedLicense("basic")
    setJustAdded(false)
    setLicenseBeat(beat)
  }

  async function handleConfirmAddToCart() {
    if (!licenseBeat) return
    await addToCart(licenseBeat.id, selectedLicense)
    setJustAdded(true)
    setTimeout(() => {
      setLicenseBeat(null)
      setJustAdded(false)
    }, 900)
  }

  function renderBeatCard(beat: any) {
    const isThisPlaying = currentBeat?.id === beat.id && isPlaying
    return (
      <div key={beat.id} className="beat-card" style={{ backgroundColor: "var(--bg-card)", border: `1px solid ${isThisPlaying ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`, borderRadius: "10px", overflow: "hidden", transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease" }}>
        {/* Cover */}
        <div
          onClick={() => router.push(`/beat/${beat.slug}`)}
          style={{ position: "relative", aspectRatio: "1", background: beat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor[beat.genre] ?? "#111"} 0%, #0a0a0a 100%)`, backgroundColor: "#0a0a0a", cursor: "pointer" }}
        >
          {beat.cover_url
            ? <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.4rem", fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center", padding: "0 12px" }}>{beat.title.toUpperCase()}</span></div>
          }

          {isThisPlaying && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "28px" }}>
                {[1, 2, 3, 4].map((b) => (
                  <div key={b} className={`wave-bar-${b}`} style={{ width: "3px", height: "18px", backgroundColor: "var(--gold)", borderRadius: "2px", transformOrigin: "bottom" }} />
                ))}
              </div>
            </div>
          )}

          <div onClick={(e) => { e.stopPropagation(); setShareBeat(beat) }} style={{ position: "absolute", top: "10px", right: "12px", color: "var(--text-muted)", fontSize: "1rem", zIndex: 2, cursor: "pointer" }}>···</div>

          <HeartButton beatId={String(beat.id)} />

          <button
            onClick={(e) => { e.stopPropagation(); if (isThisPlaying) { pause() } else { setQueue(featuredBeats.length ? featuredBeats : [beat]); play(beat) } }}
            style={{ position: "absolute", bottom: "12px", right: "12px", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "var(--gold)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", outline: "none", WebkitAppearance: "none" as any, zIndex: 2 }}>
            {isThisPlaying
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="#000"><rect x="1" y="0" width="4" height="12" rx="1" /><rect x="7" y="0" width="4" height="12" rx="1" /></svg>
              : <span style={{ color: "#000", fontSize: "0.7rem", marginLeft: "2px" }}>▶</span>
            }
          </button>
        </div>

        {/* Info */}
        <div
          onClick={() => router.push(`/beat/${beat.slug}`)}
          style={{ padding: "18px", cursor: "pointer" }}
        >
          <h3 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "6px", lineHeight: 1.3 }}>{beat.title}</h3>
          <Link
            href={`/store?genre=${encodeURIComponent(beat.genre)}`}
            onClick={(e) => e.stopPropagation()}
            className="beat-tag-link"
            style={{ color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", fontWeight: 600, marginBottom: "10px", display: "inline-block", textDecoration: "none" }}
          >
            {beat.genre}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {beat.mood && (
              <>
                <Link
                  href={`/store?mood=${encodeURIComponent(beat.mood)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="beat-tag-link"
                  style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textDecoration: "none" }}
                >
                  {beat.mood}
                </Link>
                <span style={{ color: "var(--border-dim)" }}>•</span>
              </>
            )}
            <Link
              href={`/store?bpm=${beat.bpm}`}
              onClick={(e) => e.stopPropagation()}
              className="beat-tag-link"
              style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textDecoration: "none" }}
            >
              {beat.bpm} BPM
            </Link>
            {beat.key && (
              <>
                <span style={{ color: "var(--border-dim)" }}>•</span>
                <Link
                  href={`/store?key=${encodeURIComponent(beat.key)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="beat-tag-link"
                  style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textDecoration: "none" }}
                >
                  {beat.key}
                </Link>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href={`/beat/${beat.slug}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              from ₦{beat.basic_price?.toLocaleString()}
            </Link>
            <button
              onClick={(e) => { e.stopPropagation(); openLicensePicker(beat) }}
              style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "var(--gold)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none", WebkitAppearance: "none" as any }}
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
  }

  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      <style>{`
        @keyframes subtitleReveal {
          from { opacity: 0; transform: translateY(10px); letter-spacing: 0.04em; }
          to   { opacity: 1; transform: translateY(0);    letter-spacing: 0.02em; }
        }
        .hero-subtitle-visible {
          animation: subtitleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-subtitle-hidden { opacity: 0; }

        .learn-more-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--gold);
          font-size: 0.9rem;
          font-family: var(--font-ui);
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: gap 0.2s ease, opacity 0.2s ease;
        }
        .learn-more-cta:hover {
          gap: 14px;
          opacity: 0.85;
        }
        .learn-more-cta .arrow {
          font-size: 1.1rem;
          transition: transform 0.2s ease;
        }
        .learn-more-cta:hover .arrow {
          transform: translateX(4px);
        }

        .see-more-cta {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .see-more-cta:hover {
          transform: translateX(2px);
          box-shadow: 0 0 24px rgba(201, 168, 76, 0.35);
        }
        .see-more-cta:hover .arrow {
          transform: translateX(3px);
        }

        .beat-tag-link {
          transition: color 0.15s ease;
        }
        .beat-tag-link:hover {
          color: var(--gold) !important;
        }

        @media (max-width: 768px) {
          .hero-search-wrap { max-width: 100% !important; }
          .hero-filters-wrap { max-width: 100% !important; }
          .hero-filters-wrap select,
          .hero-filters-wrap input {
            flex: 1 1 calc(50% - 4px) !important;
            width: auto !important;
            min-width: 0 !important;
          }
          .hero-ctas a { flex: 1 !important; text-align: center !important; }

          .featured-header {
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .see-more-cta {
            padding: 10px 20px !important;
            font-size: 0.7rem !important;
          }
          .section-padding {
            padding: 60px 20px !important;
          }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>

        <div className="hero-image" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "70%", pointerEvents: "none", zIndex: 0 }}>
          <img src="/hero-pic.png" alt="Senior Man KP Studio" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 1 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #020202 0%, #020202 3%, rgba(2,2,2,0.85) 18%, rgba(2,2,2,0.3) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #020202 0%, transparent 52%)" }} />
        </div>

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

        <div className="hero-content" style={{ position: "relative", zIndex: 10, paddingLeft: "clamp(24px, 8vw, 140px)", paddingRight: "24px", maxWidth: "620px", width: "100%" }}>
          <h1 style={{ fontSize: "clamp(2.7rem, 3.6vw, 4.4rem)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "24px", fontFamily: "var(--font-ui)" }}>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Find Your Sound.</span>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Own It.</span>
            <span style={{ display: "block", fontStyle: "italic", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create Freely.
            </span>
          </h1>

          <div style={{ marginBottom: "28px" }}>
            <p className={subtitleVisible ? "hero-subtitle-visible" : "hero-subtitle-hidden"} style={{
              fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, fontFamily: "var(--font-ui)",
              color: "rgba(245,240,232,0.85)", letterSpacing: "0.02em",
              paddingLeft: "16px", borderLeft: "3px solid var(--gold)", maxWidth: "380px",
            }}>
              Original instrumentals for artists building something real.
            </p>
          </div>

          {/* Search bar */}
          <div className="hero-search-wrap" style={{ display: "flex", marginBottom: "12px", maxWidth: "500px" }}>
            <input
              type="text"
              placeholder="What do you need today?"
              style={{
                flex: 1, padding: "15px 20px",
                backgroundColor: "rgba(16,16,16,0.95)",
                border: "1px solid rgba(201,168,76,0.3)", borderRight: "none",
                borderRadius: "10px 0 0 10px",
                color: "var(--text-primary)", fontSize: "1.05rem",
                fontFamily: "var(--font-ui)", outline: "none", backdropFilter: "blur(10px)",
              }}
            />
            <button style={{
              padding: "15px 22px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "0 10px 10px 0",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Quick filters — updated genre + mood lists */}
          <div className="hero-filters hero-filters-wrap" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px", maxWidth: "500px" }}>
            <select style={{ ...controlStyle, flex: 1, minWidth: "120px" }}>
              <option>Mood / Feel</option>
              {["Dark","Euphoric","Melancholic","Energetic","Romantic","Chill","Soulful","Emotional","Happy","Uplifting","Inspirational","Reflective","Dreamy","Smooth","Groovy","Luxury","Sexy","Confident","Aggressive","Epic","Cinematic","Party","Rave","Spiritual","Hopeful","Nostalgic","Motivational","Passionate","Intimate","Triumphant"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select style={{ ...controlStyle, flex: 1, minWidth: "120px" }}>
              <option>Genre</option>
              {["Afrobeat","Afro Fusion","Afro-Soul","Afropop","Amapiano","Trap","Drill","R&B","Hip-Hop","Dancehall","Reggae","Highlife","Fuji","Gospel","Alternative","Pop","Soul","Lo-Fi","House","EDM","Jersey Club","UK Afroswing","Afro House","Piano Fusion","Neo Soul"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <input type="number" placeholder="BPM" style={{ ...controlStyle, width: "100px", flexShrink: 0 }} />
          </div>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px", flexWrap: "wrap" }}>
            <Link href="/store" style={{ padding: "14px 32px", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "#000", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", borderRadius: "8px", fontFamily: "var(--font-ui)" }}>Browse Beats</Link>
            <Link href="/licensing" style={{ padding: "14px 32px", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: "8px", fontFamily: "var(--font-ui)" }}>How It Works ▶</Link>
          </div>

          {/* Genre tags */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ color: "rgba(245,240,232,0.65)", fontSize: "0.85rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 600 }}>Browse by Genre</span>
              <Link href="/store" style={{ color: "var(--gold)", fontSize: "0.88rem", textDecoration: "none", fontFamily: "var(--font-mono)", fontWeight: 700 }}>View all</Link>
            </div>
            <div className="genre-tags" style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
              {["Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"].map((genre) => (
                <Link key={genre} href={`/store?genre=${encodeURIComponent(genre)}`} style={{
                  padding: "9px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px",
                  color: "rgba(245,240,232,0.65)", fontSize: "0.75rem", textDecoration: "none",
                  backgroundColor: "rgba(16,16,16,0.8)", whiteSpace: "nowrap",
                  fontFamily: "var(--font-ui)", fontWeight: 500,
                }}>{genre}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Last Played ── */}
      {lastPlayed.length > 0 && (
        <section className="section-padding" style={{ padding: "60px 48px 0", backgroundColor: "var(--bg-void)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Pick Up Where You Left Off</span>
              <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", marginTop: "8px" }}>Last Played</h2>
            </div>
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
              {lastPlayed.slice(0, 6).map((beat: any) => (
                <div key={beat.id} style={{ width: "230px", flexShrink: 0 }}>
                  {renderBeatCard(beat)}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Beats ── */}
      <section className="section-padding" style={{ padding: "80px 48px", backgroundColor: "var(--bg-void)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="featured-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
            <div>
              <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-mono)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Featured Beats</span>
              <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 6vw, 2.8rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", marginTop: "8px", lineHeight: 1.05 }}>Latest Drops</h2>
            </div>
            <Link href="/store" className="see-more-cta" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "13px 26px", fontSize: "0.82rem", fontWeight: 700,
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              borderRadius: "50px", textDecoration: "none", color: "#000",
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              See More
              <span className="arrow" style={{ fontSize: "1rem", display: "inline-block", transition: "transform 0.2s ease" }}>→</span>
            </Link>
          </div>

          <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", width: "100%" }}>
            {featuredBeats.map((beat) => renderBeatCard(beat))}
          </div>
        </div>
      </section>

      {/* ── Learn More ── */}
      <section style={{ padding: "100px 48px", backgroundColor: "var(--bg-void)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{ display: "inline-block", color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "16px", padding: "6px 16px", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "20px", backgroundColor: "rgba(201,168,76,0.05)" }}>
              Learn More
            </span>
            <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: "480px", margin: "0 auto" }}>
              Everything You Need to Know
            </h2>
          </div>

          <div className="learn-more-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { title: "Licensing Info", desc: "Learn what each license includes and choose the option that matches your creative goals.", link: "/licensing", cta: "View Licenses", external: false },
              { title: "Frequently Asked Questions", desc: "Need clarity? Explore answers to our most frequently asked questions about licenses and services.", link: "/faq", cta: "Read FAQ", external: false },
              { title: "Contact Producer", desc: "Looking for something unique? Get in! Let's create a sound tailored to your vision.", link: "mailto:contact@seniormankp.com", cta: "Get in Touch", external: true },
            ].map((item) => (
              <div key={item.title} style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "48px 36px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
                <h3 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "16px", lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p style={{ color: "rgba(245,240,232,0.78)", fontSize: "1.05rem", fontFamily: "var(--font-ui)", lineHeight: 1.9, marginBottom: "36px", flex: 1 }}>
                  {item.desc}
                </p>
                {item.external ? (
                  <a href={item.link} className="learn-more-cta">
                    {item.cta} <span className="arrow">→</span>
                  </a>
                ) : (
                  <Link href={item.link} className="learn-more-cta">
                    {item.cta} <span className="arrow">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── License Picker Modal ── */}
      {licenseBeat && (
        <div
          onClick={() => setLicenseBeat(null)}
          style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "32px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: 0, left: "32px", right: "32px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                  {licenseBeat.title}
                </div>
                <div style={{ color: "var(--gold)", fontSize: "0.8rem", fontFamily: "var(--font-ui)", marginTop: "2px" }}>
                  {licenseBeat.genre} · {licenseBeat.bpm} BPM · {licenseBeat.key}
                </div>
              </div>
              <button
                onClick={() => setLicenseBeat(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, WebkitAppearance: "none" as any, outline: "none" }}
              >✕</button>
            </div>

            <p style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", marginBottom: "24px" }}>
              Choose a license type
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {getLicenseOptions(licenseBeat).map((opt) => {
                const isSelected = selectedLicense === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => !opt.disabled && setSelectedLicense(opt.value)}
                    disabled={opt.disabled}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px",
                      backgroundColor: isSelected ? "rgba(201,168,76,0.1)" : "var(--bg-elevated)",
                      border: `1px solid ${isSelected ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "10px",
                      cursor: opt.disabled ? "not-allowed" : "pointer",
                      opacity: opt.disabled ? 0.4 : 1,
                      textAlign: "left", width: "100%",
                      WebkitAppearance: "none" as any, outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "16px", height: "16px", borderRadius: "50%",
                        border: `2px solid ${isSelected ? "var(--gold)" : "rgba(255,255,255,0.25)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--gold)" }} />}
                      </div>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.92rem", fontWeight: 600, fontFamily: "var(--font-ui)" }}>
                        {opt.label}
                        {opt.disabled && <span style={{ color: "#ff6b6b", fontSize: "0.72rem", marginLeft: "8px", fontWeight: 700 }}>SOLD</span>}
                      </span>
                    </div>
                    <span style={{ color: isSelected ? "var(--gold)" : "var(--text-secondary)", fontSize: "0.92rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                      ₦{opt.price?.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleConfirmAddToCart}
              disabled={justAdded}
              style={{
                width: "100%", padding: "15px",
                background: justAdded ? "rgba(74,222,128,0.15)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                border: justAdded ? "1px solid rgba(74,222,128,0.3)" : "none",
                borderRadius: "8px",
                color: justAdded ? "#4ade80" : "#000",
                fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: justAdded ? "default" : "pointer",
                WebkitAppearance: "none" as any, outline: "none",
              }}
            >
              {justAdded ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {shareBeat && (
        <div onClick={() => setShareBeat(null)} style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "12px", width: "100%", maxWidth: "420px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Share Beat</h3>
              <button onClick={() => setShareBeat(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", padding: "14px", backgroundColor: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0, background: shareBeat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor[shareBeat.genre] ?? "#111"}, #0a0a0a)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                style={{ flex: 1, padding: "10px 12px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", outline: "none" }} />
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/beat/${shareBeat.slug}`)}
                style={{ padding: "10px 16px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", border: "none", borderRadius: "4px", color: "#000", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Copy
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Twitter / X", icon: "✕", url: `https://x.com/intent/tweet?text=Check out "${shareBeat.title}" by Senior Man KP&url=${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "WhatsApp", icon: "💬", url: `https://wa.me/?text=Check out "${shareBeat.title}" by Senior Man KP — ${typeof window !== "undefined" ? window.location.origin : ""}/beat/${shareBeat.slug}` },
                { label: "Instagram", icon: "◉", url: "https://instagram.com" },
                { label: "TikTok", icon: "♪", url: "https://tiktok.com" },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "6px", textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", fontWeight: 500 }}>
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