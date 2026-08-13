import Link from "next/link"

export default function Footer() {
  const socials = [
    { href: "https://youtube.com/kingpsalmy_", icon: "▶", label: "YouTube" },
    { href: "https://instagram.com/kingpsalmy_", icon: "◉", label: "Instagram" },
    { href: "https://x.com/kingpsalmy_", icon: "✕", label: "X" },
    { href: "https://tiktok.com/kingpsalmy_", icon: "♪", label: "TikTok" },
  ]

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "More Beats", href: "/store" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ]

  const legalLinks: { label: string; href: string; external: boolean }[] = [
    { label: "Licensing Info", href: "/licensing", external: false },
    { label: "Terms of Use", href: "/terms", external: false },
    { label: "Privacy Policy", href: "/privacy", external: false },
    { label: "YouTube Terms of Service", href: "https://www.youtube.com/t/terms", external: true },
  ]

  return (
    <footer style={{
      backgroundColor: "var(--bg-deep)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "90px 48px 56px",
    }}>

      <div className="footer-grid" style={{
        maxWidth: "1200px",
        margin: "0 auto 70px",
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
        gap: "56px",
      }}>

        {/* Brand */}
        <div>
          <img
            src="/logo-white.png"
            alt="Senior Man KP"
            style={{ height: "64px", width: "auto", objectFit: "contain", marginBottom: "24px" }}
          />
          <p style={{
            color: "rgba(245,240,232,0.55)",
            fontSize: "1.02rem",
            fontFamily: "var(--font-ui)",
            lineHeight: 1.9,
            maxWidth: "260px",
          }}>
            <i>Find the sound that sets you apart</i>
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(245,240,232,0.55)", fontSize: "0.95rem", textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{
            color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "0.25em",
            textTransform: "uppercase", marginBottom: "30px",
          }}>
            Navigation
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} style={{
                color: "rgba(245,240,232,0.55)",
                fontSize: "1.02rem",
                fontFamily: "var(--font-ui)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{
            color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "0.25em",
            textTransform: "uppercase", marginBottom: "30px",
          }}>
            Legal
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {legalLinks.map((l) => (
              l.external ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: "rgba(245,240,232,0.55)", fontSize: "1.02rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} href={l.href}
                  style={{ color: "rgba(245,240,232,0.55)", fontSize: "1.02rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                  {l.label}
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{
            color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "0.25em",
            textTransform: "uppercase", marginBottom: "30px",
          }}>
            Contact
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <a href="mailto:kingpsalmyofficial@gmail.com"
              style={{ color: "rgba(245,240,232,0.55)", fontSize: "1.02rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              kingpsalmyofficial@gmail.com
            </a>
            <a href="https://instagram.com/kingpsalmy_" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(245,240,232,0.55)", fontSize: "1.02rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              @kingpsalmy_
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          © 2025 Senior Man KP. All rights reserved.
        </span>
        <span style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          Built for artists who move culture forward.
        </span>
      </div>
    </footer>
  )
}


