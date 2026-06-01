"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { getCart, removeFromCart, updateCartLicense, LICENSE_PRICES } from "@/lib/cart"
import { getGuestId } from "@/lib/guest"
import type { LicenseType } from "@/lib/cart"

type CartItem = {
  id: string
  beat_id: string
  license_type: LicenseType
  beats: {
    id: string
    title: string
    genre: string
    bpm: number
    cover_url: string | null
    color: string | null
    basic_price: number
    premium_price: number
    unlimited_price: number
    exclusive_price: number
  }
}

type ValidationResult = {
  valid: boolean
  items: any[]
  subtotal: number
  discount: number
  total: number
  freeItems: { beat_id: string; free_license: LicenseType }[]
}

const LICENSE_LABELS: Record<LicenseType, string> = {
  basic: "Basic",
  premium: "Premium",
  unlimited: "Unlimited",
  exclusive: "Exclusive",
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCart()
  }, [])

  async function loadCart() {
    setLoading(true)
    const items = await getCart()
    setCartItems(items as CartItem[])
    setLoading(false)
    if (items.length > 0) {
      await validateCart(items as CartItem[])
    }
  }

  async function validateCart(items: CartItem[]) {
    setValidating(true)
    setError(null)
    try {
      const guestId = getGuestId()
      const res = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_id: guestId,
          items: items.map((i) => ({
            beat_id: i.beat_id,
            license_type: i.license_type,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Validation failed")
        return
      }
      setValidation(data)
    } catch {
      setError("Failed to validate cart. Please try again.")
    } finally {
      setValidating(false)
    }
  }

  async function handleRemove(beatId: string) {
    await removeFromCart(beatId)
    await loadCart()
  }

  async function handleLicenseChange(beatId: string, license: LicenseType) {
    await updateCartLicense(beatId, license)
    await loadCart()
  }

  async function handlePay() {
    if (!name.trim()) { setError("Please enter your name."); return }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return }
    if (!validation) { setError("Cart not validated. Please wait."); return }

    setPaying(true)
    setError(null)

    const handler = (window as any).PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: validation.total * 100,
      currency: "NGN",
      metadata: {
        name,
        guest_id: getGuestId(),
        items: cartItems.map((i) => ({
          beat_id: i.beat_id,
          title: i.beats.title,
          license_type: i.license_type,
        })),
        subtotal: validation.subtotal,
        discount: validation.discount,
        free_items: validation.freeItems,
      },
      callback: (response: { reference: string }) => {
        router.push(`/success?reference=${response.reference}&email=${encodeURIComponent(email)}`)
      },
      onClose: () => {
        setPaying(false)
      },
    })

    handler?.openIframe()
  }

  const getPriceForLicense = (item: CartItem, license: LicenseType) => {
    const map: Record<LicenseType, number> = {
      basic: item.beats.basic_price,
      premium: item.beats.premium_price,
      unlimited: item.beats.unlimited_price,
      exclusive: item.beats.exclusive_price,
    }
    return map[license]
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--border-dim)", borderTop: "3px solid var(--gold)", animation: "spin 1s linear infinite" }} />
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "160px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🛒</div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
            Your cart is empty
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", marginBottom: "28px" }}>
            Browse the store and add beats to get started.
          </p>
          <Link href="/store" style={{ padding: "13px 28px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", color: "#000", textDecoration: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Browse Store
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 24px 0" }}>
        <div style={{ marginBottom: "40px" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Checkout
          </span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginTop: "8px" }}>
            Review Your Order
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>

          {/* Left — Cart Items */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {cartItems.map((item) => (
                <div key={item.beat_id} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "20px", display: "flex", gap: "16px", alignItems: "center" }}>

                  {/* Cover */}
                  <div style={{ width: "60px", height: "60px", borderRadius: "4px", flexShrink: 0, overflow: "hidden", background: `linear-gradient(135deg, ${item.beats.color || "#1a0a2e"}, #0a0a0a)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.beats.cover_url
                      ? <img src={item.beats.cover_url} alt={item.beats.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", fontFamily: "var(--font-mono)" }}>{item.beats.title.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.beats.title}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                      {item.beats.genre} • {item.beats.bpm} BPM
                    </div>

                    {/* License selector */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(["basic", "premium", "unlimited", "exclusive"] as LicenseType[]).map((license) => (
                        <button
                          key={license}
                          onClick={() => handleLicenseChange(item.beat_id, license)}
                          style={{
                            padding: "5px 12px", borderRadius: "3px", cursor: "pointer",
                            border: `1px solid ${item.license_type === license ? "var(--gold)" : "var(--border-subtle)"}`,
                            backgroundColor: item.license_type === license ? "rgba(201,168,76,0.12)" : "transparent",
                            color: item.license_type === license ? "var(--gold)" : "var(--text-muted)",
                            fontSize: "0.62rem", fontWeight: 600,
                            fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {LICENSE_LABELS[license]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                    <span style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                      ₦{getPriceForLicense(item, item.license_type)?.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemove(item.beat_id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.68rem", fontFamily: "var(--font-ui)", letterSpacing: "0.05em" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Free items notice */}
            {validation && validation.freeItems.length > 0 && (
              <div style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
                <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "8px", letterSpacing: "0.05em" }}>
                  🎁 Bundle Deal Applied
                </div>
                {validation.freeItems.map((f, i) => (
                  <div key={i} style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>
                    1 {LICENSE_LABELS[f.free_license]} license applied free
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Order Summary + Payment */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "28px", marginBottom: "16px" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
                Order Summary
              </h2>

              {validating ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid var(--border-dim)", borderTop: "2px solid var(--gold)", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : validation ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>Subtotal</span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>₦{validation.subtotal.toLocaleString()}</span>
                  </div>
                  {validation.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>Bundle Discount</span>
                      <span style={{ color: "#4ade80", fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>-₦{validation.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", marginTop: "4px" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Total</span>
                    <span style={{ color: "var(--gold)", fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{validation.total.toLocaleString()}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Customer Info */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "28px", marginBottom: "16px" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
                Your Details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your artist or full name"
                    style={{ width: "100%", padding: "11px 14px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: "100%", padding: "11px 14px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none", boxSizing: "border-box" }}
                  />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-ui)", marginTop: "6px", lineHeight: 1.5 }}>
                    Your download links will be accessible at /my-downloads using this email.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "6px", padding: "12px 16px", marginBottom: "14px" }}>
                <p style={{ color: "#ff6464", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>{error}</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying || validating || !validation}
              style={{
                width: "100%", padding: "15px",
                background: paying || validating || !validation
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                border: "none", borderRadius: "4px", cursor: paying || validating || !validation ? "not-allowed" : "pointer",
                color: paying || validating || !validation ? "var(--text-muted)" : "#000",
                fontSize: "0.78rem", fontWeight: 800,
                fontFamily: "var(--font-ui)", letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {paying ? "Processing..." : validating ? "Validating..." : validation ? `Pay ₦${validation.total.toLocaleString()}` : "Loading..."}
            </button>

            <p style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-ui)", textAlign: "center", marginTop: "12px", lineHeight: 1.6 }}>
              Secured by Paystack. By completing this purchase you agree to the{" "}
              <Link href="/licensing" style={{ color: "var(--gold)" }}>license terms</Link>.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}