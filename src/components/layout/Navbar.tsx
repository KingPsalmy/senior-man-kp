"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { getCartCount } from "@/lib/cart"

const links = [
  { href: "/store", label: "Store" },
  { href: "/licensing", label: "Licensing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const count = await getCartCount()
      setCartCount(count)
    }
    loadCount()
  }, [pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const cartLabel = cartCount === 0 ? "0 Items" : `${cartCount} Item${cartCount !== 1 ? "s" : ""}`

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(2,2,2,0.88)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "76px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "100%", padding: "0 40px", maxWidth: "1400px", margin: "0 auto",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img src="/logo-white.png" alt="Senior Man KP"
              style={{ height: "62px", width: "auto", objectFit: "contain" }} />
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ display: "flex", gap: "48px", alignItems: "center" }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} style={{
                fontFamily: "var(--font-ui)",
                fontSize: "1rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontWeight: 700,
                color: pathname === link.href ? "var(--gold)" : "rgba(245,240,232,0.75)",
                transition: "color 0.2s ease",
              }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Cart */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center" }}>
            <Link href="/cart" style={{
              display: "flex", alignItems: "center", gap: "9px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "6px",
              padding: "12px 24px", cursor: "pointer",
              fontFamily: "var(--font-ui)", fontWeight: 700,
              fontSize: "0.88rem", letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#000", textDecoration: "none",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartLabel}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px",
            display: "none", flexDirection: "column", justifyContent: "center",
            alignItems: "center", width: "40px", height: "40px", position: "relative",
          }}>
            <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--text-primary)", position: "absolute", transition: "all 0.25s ease", transform: menuOpen ? "rotate(45deg)" : "translateY(-6px)" }} />
            <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--text-primary)", position: "absolute", transition: "all 0.25s ease", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--text-primary)", position: "absolute", transition: "all 0.25s ease", transform: menuOpen ? "rotate(-45deg)" : "translateY(6px)" }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "76px", left: 0, right: 0, zIndex: 49,
          background: "rgba(2,2,2,0.98)", borderBottom: "1px solid var(--border-subtle)",
          padding: "32px 28px", display: "flex", flexDirection: "column", gap: "28px",
        }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: "var(--font-ui)", fontSize: "1.3rem", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
              color: pathname === link.href ? "var(--gold)" : "var(--text-primary)",
            }}>
              {link.label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setMenuOpen(false)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
            borderRadius: "6px", padding: "16px 20px",
            fontFamily: "var(--font-ui)", fontWeight: 700,
            fontSize: "1rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#000",
            textDecoration: "none", width: "100%",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartLabel}
          </Link>
        </div>
      )}
    </>
  )
}
