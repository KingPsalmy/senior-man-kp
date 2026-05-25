"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const links = [
  { href: "/store", label: "Beats" },
  { href: "/licensing", label: "Licenses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(2,2,2,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          height: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            padding: "0 24px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Logo */}
         <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
  <img
    src="/logo-white.png"
    alt="Senior Man KP"
    style={{ height: "90px", width: "auto", objectFit: "contain", marginTop: "4px" }}
  />
</Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", gap: "32px", alignItems: "center" }} className="desktop-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontWeight: 600,
                  color: pathname === link.href ? "var(--gold)" : "var(--text-secondary)",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }} className="desktop-nav">
<button
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
    border: "none",
    borderRadius: "3px",
    padding: "9px 18px",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    fontWeight: 700,
    fontSize: "0.68rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#000",
  }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
  0 Items
</button>
            
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "none",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--text-primary)", transition: "all 0.2s" }} />
            <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--text-primary)", transition: "all 0.2s" }} />
            <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: "var(--text-primary)", transition: "all 0.2s" }} />
          </button>

        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            zIndex: 49,
            background: "rgba(2,2,2,0.98)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
                color: pathname === link.href ? "var(--gold)" : "var(--text-primary)",
                letterSpacing: "0.05em",
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
    border: "none",
    borderRadius: "3px",
    padding: "12px 20px",
    cursor: "pointer",
    fontFamily: "var(--font-ui)",
    fontWeight: 700,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#000",
    width: "100%",
  }}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
  0 Items
</button>
        </div>
      )}
    </>
  )
}