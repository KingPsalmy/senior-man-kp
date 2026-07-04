"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { getCart, removeFromCart, updateCartLicense, LicenseType } from "@/lib/cart"
import { calculateDiscount } from "@/lib/discount"

const LICENSE_OPTIONS = [
  { value: "basic", label: "Basic", price: 30000 },
  { value: "premium", label: "Premium", price: 70000 },
  { value: "unlimited", label: "Unlimited", price: 120000 },
  { value: "exclusive", label: "Exclusive", price: 180000 },
]

function genreColor(genre: string) {
  const map: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
    "Trap": "#2e0a0a", "R&B": "#0a2e1a",
    "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }
  return map[genre] || "#111111"
}

export default function CartPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getCart()
      setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleRemove(beatId: string) {
    await removeFromCart(beatId)
    setItems((prev) => prev.filter((i) => i.beat_id !== beatId))
  }

  async function handleLicenseChange(beatId: string, license: LicenseType) {
    await updateCartLicense(beatId, license)
    setItems((prev) => prev.map((i) =>
      i.beat_id === beatId ? { ...i, license_type: license } : i
    ))
  }

  const { subtotal, discount, total, freeItems } = calculateDiscount(items)

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      {/* Hero */}
      <section className="cart-hero" style={{ padding: "108px 48px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
            letterSpacing: "0.32em", textTransform: "uppercase",
            marginBottom: "20px", padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
          }}>
            Your Order
          </span>
          <h1 style={{
            color: "var(--text-primary)", marginTop: "0",
            fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 800,
            fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", lineHeight: 1.08,
          }}>
            Cart
          </h1>
        </div>
      </section>

      <div className="cart-page-wrap" style={{ padding: "40px 48px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {loading ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem", padding: "80px 0", textAlign: "center" }}>
              Loading cart...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "1.05rem", fontFamily: "var(--font-ui)", marginBottom: "32px" }}>
                Your cart is empty.
              </div>
              <Link href="/store" style={{
                padding: "16px 36px",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                color: "#000", textDecoration: "none", borderRadius: "8px",
                fontSize: "0.92rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px", alignItems: "start" }}>

              {/* Cart Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {items.map((item) => {
                  const beat = item.beats
                  const isFree = freeItems.includes(item.beat_id)

                  return (
                    <div key={item.beat_id} className="cart-item-row" style={{
                      display: "flex", alignItems: "center", gap: "20px",
                      padding: "24px 28px",
                      backgroundColor: "var(--bg-card)",
                      border: `1px solid ${isFree ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "16px", flexWrap: "wrap",
                      position: "relative", overflow: "hidden",
                    }}>
                      {isFree && (
                        <div style={{ position: "absolute", top: 0, left: "24px", right: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
                      )}

                      {/* Cover */}
                      <div style={{
                        width: "68px", height: "68px", borderRadius: "10px", flexShrink: 0,
                        background: beat?.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat?.genre)}, #0a0a0a)`,
                        overflow: "hidden",
                      }}>
                        {beat?.cover_url && (
                          <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                            {beat?.title}
                          </span>
                          {isFree && (
                            <span style={{
                              fontSize: "0.65rem", padding: "3px 10px",
                              backgroundColor: "rgba(201,168,76,0.15)",
                              color: "var(--gold)", borderRadius: "20px",
                              fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.1em",
                            }}>
                              FREE
                            </span>
                          )}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                          {beat?.genre} • {beat?.bpm} BPM
                        </div>
                      </div>

                      {/* License selector */}
                      <select
                        value={item.license_type}
                        onChange={(e) => handleLicenseChange(item.beat_id, e.target.value as LicenseType)}
                        style={{
                          padding: "11px 16px",
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-ui)",
                          outline: "none", cursor: "pointer",
                        }}
                      >
                        {LICENSE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} — ₦{o.price.toLocaleString()}
                          </option>
                        ))}
                      </select>

                      {/* Price */}
                      <div style={{
                        color: isFree ? "var(--text-muted)" : "var(--text-primary)",
                        fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                        textDecoration: isFree ? "line-through" : "none",
                        minWidth: "100px", textAlign: "right",
                      }}>
                        ₦{LICENSE_OPTIONS.find((o) => o.value === item.license_type)?.price.toLocaleString()}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.beat_id)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", flexShrink: 0, padding: "4px" }}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="cart-summary" style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px", padding: "36px",
                position: "sticky", top: "96px",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />

                <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "28px" }}>
                  Order Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(245,240,232,0.6)", fontSize: "0.95rem", fontFamily: "var(--font-ui)" }}>
                      Subtotal ({items.length} beat{items.length !== 1 ? "s" : ""})
                    </span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--gold)", fontSize: "0.95rem", fontFamily: "var(--font-ui)" }}>
                        Bundle Discount
                      </span>
                      <span style={{ color: "var(--gold)", fontSize: "0.95rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                        −₦{discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                      Total
                    </span>
                    <span style={{ color: "var(--gold)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Saved banner */}
                {discount > 0 && (
                  <div style={{
                    padding: "14px 18px", backgroundColor: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.2)", borderRadius: "10px",
                    marginBottom: "14px",
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                      🎉 You saved ₦{discount.toLocaleString()} with a bundle deal!
                    </span>
                  </div>
                )}

                {/* Bundle deal progress */}
                {(() => {
                  const licenses: string[] = ["basic", "premium", "unlimited", "exclusive"]
                  const messages: string[] = []
                  for (const license of licenses) {
                    const count = items.filter(i => i.license_type === license).length
                    const needed = 3 - (count % 3)
                    if (count > 0 && needed < 3) {
                      const label = license.charAt(0).toUpperCase() + license.slice(1)
                      messages.push(`Add ${needed} more ${label} license${needed > 1 ? "s" : ""} to get 1 free`)
                    }
                  }
                  if (messages.length === 0) return null
                  return (
                    <div style={{
                      padding: "14px 18px", backgroundColor: "rgba(201,168,76,0.05)",
                      border: "1px solid rgba(201,168,76,0.15)", borderRadius: "10px",
                      marginBottom: "14px",
                    }}>
                      <div style={{ color: "var(--gold)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: "6px" }}>
                        🎁 Bundle Deal
                      </div>
                      {messages.map((msg, i) => (
                        <div key={i} style={{ color: "rgba(245,240,232,0.6)", fontSize: "0.88rem", fontFamily: "var(--font-ui)" }}>
                          {msg}
                        </div>
                      ))}
                    </div>
                  )
                })()}

                <Link href="/checkout" style={{
                  display: "block", width: "100%", padding: "17px",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  color: "#000", textDecoration: "none", textAlign: "center",
                  borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                  textTransform: "uppercase", boxSizing: "border-box",
                }}>
                  Proceed to Checkout
                </Link>

                <Link href="/store" style={{
                  display: "block", textAlign: "center", marginTop: "18px",
                  color: "rgba(245,240,232,0.5)", fontSize: "0.9rem",
                  fontFamily: "var(--font-ui)", textDecoration: "none",
                }}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .cart-hero {
            padding: 90px 20px 32px !important;
          }
          .cart-item-row {
            padding: 18px 20px !important;
            gap: 14px !important;
          }
          .cart-summary {
            padding: 24px !important;
          }
        }
      `}</style>
    </main>
  )
}
