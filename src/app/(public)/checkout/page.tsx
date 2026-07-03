"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"
import { getCart, clearCart, LicenseType } from "@/lib/cart"
import { calculateDiscount } from "@/lib/discount"

const LICENSE_PRICES: Record<LicenseType, number> = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

function genreColor(genre: string) {
  const map: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
    "Trap": "#2e0a0a", "R&B": "#0a2e1a",
    "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }
  return map[genre] || "#111111"
}

export default function CheckoutPage() {
  const router = useRouter()
  const paystackRef = useRef<any>(null)

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, LicenseType>>({})
  const [form, setForm] = useState({ name: "", email: "" })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const data = await getCart()
      setItems(data)
      const licenses: Record<string, LicenseType> = {}
      data.forEach((item: any) => {
        licenses[item.beat_id] = item.license_type
      })
      setSelectedLicenses(licenses)
      setLoading(false)
    }
    load()
  }, [])

  const { subtotal, discount, total, freeItems } = calculateDiscount(
    items.map((item) => ({ ...item, license_type: selectedLicenses[item.beat_id] || item.license_type }))
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleLicenseChange(beatId: string, license: LicenseType) {
    setSelectedLicenses((prev) => ({ ...prev, [beatId]: license }))
  }

  async function handlePayment() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.")
      return
    }
    setError("")
    setPaying(true)

    const PaystackPop = (window as any).PaystackPop
    if (!PaystackPop) {
      setError("Payment system not loaded. Please refresh the page.")
      setPaying(false)
      return
    }

    const orderItems = items.map((item) => ({
      beat_id: item.beat_id,
      license_type: selectedLicenses[item.beat_id] || item.license_type,
      price: LICENSE_PRICES[selectedLicenses[item.beat_id] || item.license_type],
      is_free: freeItems.includes(item.beat_id),
    }))

    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: total * 100,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: form.name },
          { display_name: "Items", variable_name: "items", value: JSON.stringify(orderItems) },
        ],
      },
      onSuccess: async (response: any) => {
        await clearCart()
        router.push(`/success?reference=${response.reference}&email=${encodeURIComponent(form.email)}`)
      },
      onCancel: () => {
        setPaying(false)
      },
    })

    handler.openIframe()
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem" }}>
          Loading...
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "20px" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "1rem" }}>Your cart is empty.</p>
          <Link href="/store" style={{ color: "var(--gold)", fontFamily: "var(--font-ui)", textDecoration: "none", fontSize: "0.95rem" }}>← Browse Store</Link>
        </div>
      </main>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 18px",
    backgroundColor: "rgba(16,16,16,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "var(--text-primary)", fontSize: "1rem",
    fontFamily: "var(--font-ui)", outline: "none",
    boxSizing: "border-box",
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "108px 48px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
            letterSpacing: "0.32em", textTransform: "uppercase",
            marginBottom: "20px", padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
          }}>
            Checkout
          </span>
          <h1 style={{
            color: "var(--text-primary)", marginTop: "0",
            fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 800,
            fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", lineHeight: 1.08,
          }}>
            Review Your Order
          </h1>
        </div>
      </section>

      <div style={{ padding: "40px 48px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px", alignItems: "start" }}>

            {/* Left — Beat list + details form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

              {/* Beat list */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
                {items.map((item, i) => {
                  const beat = item.beats
                  const isFree = freeItems.includes(item.beat_id)
                  const currentLicense = selectedLicenses[item.beat_id] || item.license_type

                  return (
                    <div key={item.beat_id} style={{
                      display: "flex", alignItems: "center", gap: "18px",
                      padding: "22px 28px",
                      borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      flexWrap: "wrap",
                    }}>
                      {/* Cover */}
                      <div style={{
                        width: "60px", height: "60px", borderRadius: "8px", flexShrink: 0,
                        background: beat?.cover_url ? "none" : `linear-gradient(135deg, ${genreColor(beat?.genre)}, #0a0a0a)`,
                        overflow: "hidden",
                      }}>
                        {beat?.cover_url && (
                          <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{beat?.title}</span>
                          {isFree && (
                            <span style={{ fontSize: "0.62rem", padding: "3px 10px", backgroundColor: "rgba(201,168,76,0.15)", color: "var(--gold)", borderRadius: "20px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.1em" }}>FREE</span>
                          )}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
                          {beat?.genre} • {beat?.bpm} BPM
                        </div>
                      </div>

                      {/* License selector */}
                      <select
                        value={currentLicense}
                        onChange={(e) => handleLicenseChange(item.beat_id, e.target.value as LicenseType)}
                        style={{
                          padding: "11px 16px",
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-ui)",
                          outline: "none", cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        {(["basic", "premium", "unlimited", "exclusive"] as LicenseType[]).map((license) => (
                          <option key={license} value={license}>
                            {license.charAt(0).toUpperCase() + license.slice(1)} — ₦{LICENSE_PRICES[license].toLocaleString()}
                          </option>
                        ))}
                      </select>

                      {/* Price */}
                      <div style={{
                        color: isFree ? "var(--text-muted)" : "var(--text-primary)",
                        fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                        textDecoration: isFree ? "line-through" : "none",
                        minWidth: "90px", textAlign: "right", flexShrink: 0,
                      }}>
                        ₦{LICENSE_PRICES[currentLicense].toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Your Details */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
                <h3 style={{ color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>
                  Your Details
                </h3>
                <p style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", marginBottom: "28px", lineHeight: 1.7 }}>
                  Your download link will be sent to this email.
                </p>

                {error && (
                  <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "8px", padding: "14px 18px", marginBottom: "20px", color: "#ff6b6b", fontSize: "0.9rem", fontFamily: "var(--font-ui)" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", color: "rgba(245,240,232,0.55)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Name
                    </label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your artist or legal name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "rgba(245,240,232,0.55)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Email
                    </label>
                    <input
                      name="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" type="email"
                      style={inputStyle}
                    />
                    <p style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.8rem", fontFamily: "var(--font-ui)", marginTop: "8px" }}>
                      Your download links will be sent here immediately after payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div style={{
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

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(245,240,232,0.6)", fontSize: "0.95rem", fontFamily: "var(--font-ui)" }}>
                    Subtotal ({items.length} beat{items.length !== 1 ? "s" : ""})
                  </span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.95rem", fontFamily: "var(--font-ui)" }}>Bundle Discount</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.95rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>−₦{discount.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Total</span>
                  <span style={{ color: "var(--gold)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {discount > 0 && (
                <div style={{ padding: "14px 18px", backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "10px", marginBottom: "20px" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                    🎉 You saved ₦{discount.toLocaleString()} with a bundle deal!
                  </span>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paying}
                style={{
                  width: "100%", padding: "17px",
                  background: paying ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", borderRadius: "8px", cursor: paying ? "not-allowed" : "pointer",
                  color: paying ? "var(--text-muted)" : "#000",
                  fontSize: "0.95rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: "16px",
                }}
              >
                {paying ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
              </button>

              <Link href="/cart" style={{
                display: "block", textAlign: "center",
                color: "rgba(245,240,232,0.5)", fontSize: "0.9rem",
                fontFamily: "var(--font-ui)", textDecoration: "none",
              }}>
                ← Back to Cart
              </Link>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", lineHeight: 1.7, textAlign: "center" }}>
                  🔒 Secured by Paystack. Your payment info is encrypted and never stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </main>
  )
}
