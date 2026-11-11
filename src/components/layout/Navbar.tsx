"use client"
import { mediaAssets } from "@/lib/media-assets"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Heart, Menu, ShoppingBag, X } from "lucide-react"
import { refreshCartCount } from "@/lib/cart"
import { useCartStore } from "@/store/cartStore"
import { useFavoritesStore } from "@/store/favoritesStore"
const links = [
  { href: "/beatstore/beats", label: "Discover beats" },
  { href: "/licensing", label: "Licensing" },
  { href: "/my-downloads", label: "My downloads" },
]
export default function Navbar() {
  const path = usePathname()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const open = menuPath === path
  const button = useRef<HTMLButtonElement>(null)
  const count = useCartStore((s) => s.count)
  const savedError = useFavoritesStore((s) => s.error)
  useEffect(() => {
    refreshCartCount().catch(() => {})
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuPath(null)
        button.current?.focus()
      }
    }
    const resize = () => {
      if (window.innerWidth > 900) setMenuPath(null)
    }
    window.addEventListener("keydown", close)
    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("keydown", close)
      window.removeEventListener("resize", resize)
    }
  }, [open])
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        {savedError && (
          <div className="nav-notice" role="alert">
            <span>{savedError}</span>
            <button
              type="button"
              aria-label="Dismiss saved beats error"
              onClick={() => useFavoritesStore.getState().clearError()}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="nav-container">
          <Link href="/beatstore" className="brand" aria-label="Senior Man KP Beat Store home">
            <img src={mediaAssets["logo-white"]} alt="Senior Man KP" />
            <span className="brand-wordmark">
              <small>THE</small>
              <strong>BEAT STORE</strong>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={path.startsWith(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link
              href="/favorites"
              className="icon-button nav-saved"
              aria-label="Saved beats"
            >
              <Heart size={20} />
            </Link>
            <Link
              href="/cart"
              className="nav-cart"
              aria-label={"Cart, " + count + " items"}
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              <b>{count}</b>
            </Link>
            <button
              ref={button}
              className="icon-button menu-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-controls="mobile-navigation"
              aria-expanded={open}
              onClick={() => setMenuPath(open ? null : path)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <nav
          className="mobile-navigation"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {[
            ...links,
            { href: "/favorites", label: "Saved beats" },
            { href: "/faq", label: "Help & FAQs" },
            { href: "/contact", label: "Contact the producer" },
          ].map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setMenuPath(null)}
              aria-current={path === link.href ? "page" : undefined}
            >
              {link.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
      <span id="main-content" tabIndex={-1} />
    </>
  )
}
