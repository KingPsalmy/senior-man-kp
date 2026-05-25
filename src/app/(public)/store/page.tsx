import HeroParticles from "@/components/ui/HeroParticles"
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
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      {/* Page Header */}
      <div style={{ paddingTop: "88px", padding: "88px 48px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>›</span>
          <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
            Beats
          </span>
        </div>
        <h1 style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          fontFamily: "var(--font-ui)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          All Beats
        </h1>
      </div>

      {/* Filters Bar */}
      <div style={{
        padding: "16px 48px",
        borderBottom: "1px solid var(--border-subtle)",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
      }}>
        {/* Search */}
        <div style={{ position: "relative", width: "280px" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            pointerEvents: "none",
          }}>
            🔍
          </span>
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

        {/* Filter pills */}
        {[
          { label: "Genre", options: ["All Genres", "Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"] },
          { label: "Mood", options: ["Any Mood", "Dark", "Euphoric", "Melancholic", "Energetic"] },
          { label: "BPM", options: ["Any BPM", "60–89", "90–119", "120+"] },
          { label: "Key", options: ["Any Key", "A Minor", "C Minor", "D Minor", "F Minor", "G Minor"] },
        ].map((f) => (
          <select
            key={f.label}
            style={{
              padding: "9px 14px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-dim)",
              borderRadius: "4px",
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontFamily: "var(--font-ui)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {f.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}

        {/* Sort — pushed to right */}
        <select
          style={{
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
          }}
        >
          <option>Sort: Newest</option>
          <option>Sort: Price Low</option>
          <option>Sort: Price High</option>
          <option>Sort: BPM</option>
        </select>
      </div>

      {/* Beat Grid */}
      <div style={{ padding: "28px 48px 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}>
          {mockBeats.map((beat) => (
            <Link
              key={beat.id}
              href={`/beat/${beat.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                }}
              >
                {/* Cover Art */}
                <div style={{ position: "relative", aspectRatio: "1", background: `linear-gradient(135deg, ${beat.color} 0%, #0a0a0a 100%)` }}>

                  {/* New tag */}
                  {beat.isNew && (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "var(--gold)",
                      color: "#000",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "2px",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      zIndex: 2,
                    }}>
                      New
                    </div>
                  )}

                  {/* More options */}
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "12px",
                    color: "var(--text-muted)",
                    fontSize: "1.1rem",
                    zIndex: 2,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}>
                    ···
                  </div>

                  {/* Beat title watermark */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{
                      color: "rgba(255,255,255,0.08)",
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-ui)",
                      textAlign: "center",
                      padding: "0 16px",
                      lineHeight: 1.1,
                    }}>
                      {beat.title.toUpperCase()}
                    </span>
                  </div>

                  {/* Play button */}
                  <div style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    boxShadow: "0 4px 12px rgba(201,168,76,0.4)",
                  }}>
                    <span style={{ color: "#000", fontSize: "0.75rem", marginLeft: "2px" }}>▶</span>
                  </div>

                </div>

                {/* Beat Info */}
                <div style={{ padding: "14px 14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "4px" }}>
                    <h3 style={{
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-ui)",
                      lineHeight: 1.2,
                    }}>
                      {beat.title}
                    </h3>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}>♡</span>
                  </div>

                  <div style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", marginBottom: "8px", fontWeight: 500 }}>
                    {beat.genre}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                      {beat.bpm} BPM
                    </span>
                    <span style={{ color: "var(--border-dim)", fontSize: "0.65rem" }}>•</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                      {beat.key}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      color: "var(--text-primary)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-ui)",
                    }}>
                      from ₦{beat.price.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => e.preventDefault()}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "var(--gold)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        flexShrink: 0,
                      }}>
                      🛒
                    </button>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>

    </main>
  )
}