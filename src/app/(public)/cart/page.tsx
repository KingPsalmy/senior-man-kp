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

      <div style={{ padding: "100px 48px 0" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Your Order
            </span>
            <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>
              Cart
            </h1>
          </div>

          {loading ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", textAlign: "center", padding: "80px 0" }}>
              Loading cart...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", marginBottom: "24px" }}>
                Your cart is empty.
              </div>
              <Link href="/store" style={{
                padding: "13px 28px",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                color: "#000", textDecoration: "none", borderRadius: "4px",
                fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

              {/* Cart Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map((item) => {
                  const beat = item.beats
                  const isFree = freeItems.includes(item.beat_id)

                  return (
                    <div key={item.beat_id} style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 20px",
                      backgroundColor: "var(--bg-card)",
                      border: `1px solid ${isFree ? "rgba(201,168,76,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: "8px",
                      flexWrap: "wrap",
                    }}>
                      {/* Cover */}
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "4px", flexShrink: 0,
                        background: beat?.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat?.genre)}, #0a0a0a)`,
                        overflow: "hidden",
                      }}>
                        {beat?.cover_url && (
                          <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                            {beat?.title}
                          </span>
                          {isFree && (
                            <span style={{
                              fontSize: "0.6rem", padding: "2px 8px",
                              backgroundColor: "rgba(201,168,76,0.15)",
                              color: "var(--gold)", borderRadius: "2px",
                              fontFamily: "var(--font-mono)",
                            }}>
                              FREE
                            </span>
                          )}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                          {beat?.genre} • {beat?.bpm} BPM
                        </div>
                      </div>

                      {/* License selector */}
                      <select
                        value={item.license_type}
                        onChange={(e) => handleLicenseChange(item.beat_id, e.target.value as LicenseType)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--border-dim)",
                          borderRadius: "4px",
                          color: "var(--text-secondary)",
                          fontSize: "0.72rem",
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
                        fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                        textDecoration: isFree ? "line-through" : "none",
                        minWidth: "80px", textAlign: "right",
                      }}>
                        ₦{LICENSE_OPTIONS.find((o) => o.value === item.license_type)?.price.toLocaleString()}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.beat_id)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", flexShrink: 0 }}
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
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px", padding: "28px",
                  position: "sticky", top: "88px",
                }}> 
                <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "24px" }}>
                  Order Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                      Subtotal ({items.length} beat{items.length !== 1 ? "s" : ""})
                    </span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                        Bundle Discount
                      </span>
                      <span style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                        −₦{discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div style={{ height: "1px", backgroundColor: "var(--border-subtle)", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                      Total
                    </span>
                    <span style={{ color: "var(--gold)", fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {discount > 0 && (
                  <div style={{
                    padding: "10px 14px", backgroundColor: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.2)", borderRadius: "6px",
                    marginBottom: "20px",
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)" }}>
                      🎉 You saved ₦{discount.toLocaleString()} with a bundle deal!
                    </span>
                  </div>
                )}

                <Link href="/checkout" style={{
                  display: "block", width: "100%", padding: "14px",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  color: "#000", textDecoration: "none", textAlign: "center",
                  borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                  Proceed to Checkout
                </Link>

                <Link href="/store" style={{
                  display: "block", textAlign: "center", marginTop: "14px",
                  color: "var(--text-muted)", fontSize: "0.72rem",
                  fontFamily: "var(--font-ui)", textDecoration: "none",
                }}>
                  ← Continue Shopping
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  )
}