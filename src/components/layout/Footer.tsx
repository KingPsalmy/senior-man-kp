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
    { label: "Cookie Preferences", href: "/cookies", external: false },
  ]

  return (
    <footer style={{
      backgroundColor: "var(--bg-deep)",
      borderTop: "1px solid var(--border-subtle)",
      padding: "60px 48px 40px",
    }}>

      {/* Main grid — Brand / Nav / Legal / Contact */}
            <div className="footer-grid" style={{
        maxWidth: "1200px",
        marginTop: "0",
        marginRight: "auto",
        marginBottom: "48px",
        marginLeft: "auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: "40px",
        }}>

        {/* Brand */}
        <div>
          <img
            src="/logo-white.png"
            alt="Senior Man KP"
            style={{ height: "48px", width: "auto", objectFit: "contain", marginBottom: "16px" }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", lineHeight: 1.8, maxWidth: "200px" }}>
            Premium Afro-fusion instrumentals crafted for artists who want to stand out.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", fontSize: "0.75rem", textDecoration: "none",
                }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
            Navigation
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href}
                style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
            Legal
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {legalLinks.map((l) => (
              l.external ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} href={l.href}
                  style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
                  {l.label}
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
            Contact
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a href="mailto:kingpsalmyofficial@gmail.com"
              style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              kingpsalmyofficial@gmail.com
            </a>
            <a href="https://instagram.com/kingpsalmy_" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              @kingpsalmy_
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: "24px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
          © 2024 Senior Man KP. All rights reserved.
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
          Built for artists who move culture forward.
        </span>
      </div>

    </footer>
  )
}