import HeroParticles from "@/components/ui/HeroParticles"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

export default function HomePage() {
  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      <section className="hero-section" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <HeroParticles />

        {/* Producer Image */}
        <div
          className="hero-image"
          style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "60%", pointerEvents: "none", zIndex: 0 }}
        >
          <img
            src="/Hero pic.jpg"
            alt="Senior Man KP"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.9 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #020202 0%, #020202 10%, rgba(2,2,2,0.9) 30%, rgba(2,2,2,0.3) 65%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #020202 0%, transparent 35%)" }} />
        </div>

        {/* Left Content */}
        <div
          className="hero-content"
          style={{ position: "relative", zIndex: 10, paddingLeft: "clamp(24px, 8vw, 140px)", paddingRight: "24px", maxWidth: "580px", width: "100%" }}
        >
          <h1
            style={{ fontSize: "clamp(2.5rem, 3.8vw, 4.2rem)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "20px", fontFamily: "var(--font-ui)" }}
          >
            <span style={{ color: "var(--text-primary)", display: "block" }}>Premium Beats.</span>
            <span style={{ color: "var(--text-primary)", display: "block" }}>Real Vibes.</span>
            <span style={{ display: "block", fontStyle: "italic", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Real Results.
            </span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "36px", maxWidth: "380px", fontFamily: "var(--font-ui)" }}>
            High quality instrumentals crafted for artists who want to stand out.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px", flexWrap: "wrap" }}>
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

          {/* Stats */}
          <div
            className="hero-stats"
            style={{ display: "flex", alignItems: "center", gap: "28px", paddingTop: "28px", borderTop: "1px solid var(--border-subtle)", marginBottom: "32px" }}
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
                  <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-ui)" }}>
                    {stat.value}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "3px", fontFamily: "var(--font-mono)" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Genre Tags */}
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
                  padding: "8px 14px",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "3px",
                  color: "var(--text-secondary)",
                  fontSize: "0.65rem",
                  textDecoration: "none",
                  backgroundColor: "var(--bg-elevated)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 500,
                }}>
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