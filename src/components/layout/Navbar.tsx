"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/store", label: "Beats" },
  { href: "/licensing", label: "Licenses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(2,2,2,0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "64px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          height: "100%",
          padding: "0 48px",
        }}
      >
        {/* Left — Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.5rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                marginBottom: "2px",
              }}
            >
              Senior Man
            </div>
            <div
              className="gradient-gold font-display"
              style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}
            >
              KP
            </div>
          </div>
        </Link>

        {/* Center — Links */}
        <nav style={{ display: "flex", gap: "36px", alignItems: "center" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: pathname === link.href ? "var(--gold)" : "var(--text-secondary)",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — Cart + Login */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "flex-end" }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🛒 0
          </button>
          <Link
            href="/admin/login"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--bg-void)",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              padding: "9px 22px",
              borderRadius: "2px",
              fontWeight: 600,
            }}
          >
            Login
          </Link>
        </div>

      </div>
    </header>
  )
}