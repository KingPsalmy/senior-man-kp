import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-void)" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>

        {/* Producer Image — right side */}
        <div className="absolute right-0 top-0 h-full w-[60%] pointer-events-none" style={{ zIndex: 0 }}>
          <img
            src="/Hero pic.jpg"
            alt="Senior Man KP"
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.9 }}
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, #020202 0%, #020202 10%, rgba(2,2,2,0.9) 30%, rgba(2,2,2,0.3) 65%, transparent 100%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, #020202 0%, transparent 35%)",
          }} />
        </div>

        {/* Left Content */}
       <div
  className="relative z-10"
  style={{
    paddingLeft: "clamp(48px, 8vw, 140px)",
    maxWidth: "580px",
    marginTop: "0px",
  }}
>

          {/* Headline */}
          <h1
            className="font-display mb-5"
            style={{ fontSize: "clamp(2.5rem, 3.8vw, 4.2rem)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            <span style={{ color: "var(--text-primary)", display: "block" }}>Premium Beats.</span>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Real Vibes.</span>
            <span className="gradient-gold" style={{ display: "block", fontStyle: "italic" }}>Real Results.</span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "36px", maxWidth: "380px" }}>
            High quality instrumentals crafted for artists who want to stand out.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4" style={{ marginBottom: "48px" }}>
            <Link href="/store" className="btn-gold rounded-sm" style={{ padding: "13px 28px", fontSize: "0.7rem" }}>
              Browse Beats
            </Link>
            <Link href="/licensing" className="btn-outline-gold rounded-sm flex items-center gap-2" style={{ padding: "13px 28px", fontSize: "0.7rem" }}>
              How It Works ▶
            </Link>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              paddingTop: "28px",
              paddingBottom: "28px",
              borderTop: "1px solid var(--border-subtle)",
              marginBottom: "32px",
            }}
          >
            {[
              { icon: "♪", value: "500+", label: "Premium Beats" },
              { icon: "✓", value: "100%", label: "Royalty Safe" },
              { icon: "≡", value: "3", label: "License Options" },
              { icon: "◷", value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--gold)", fontSize: "1rem" }}>{stat.icon}</span>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-ui)" }}>
                    {stat.value}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse by Genre */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Browse by Genre
              </span>
              <Link href="/store" className="font-mono" style={{ color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.1em", textDecoration: "none" }}>
                View all
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
              {["Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill"].map((genre) => (
                <Link
                  key={genre}
                  href={`/store?genre=${genre.toLowerCase()}`}
                  className="font-mono"
                  style={{
                    padding: "8px 16px",
                    border: "1px solid var(--border-dim)",
                    borderRadius: "2px",
                    color: "var(--text-secondary)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    textDecoration: "none",
                    backgroundColor: "var(--bg-elevated)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}