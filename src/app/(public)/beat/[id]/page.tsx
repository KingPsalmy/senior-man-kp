"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Link from "next/link"

const beat = {
  id: 1,
  title: "Midnight Drive",
  genre: "Afrobeat",
  bpm: 98,
  key: "F# Minor",
  duration: "4:02",
  description: "Smooth Afrobeat instrumental with vibey melodies and modern drum patterns. Perfect for hit records.",
  tags: ["afrobeat", "vibes", "smooth", "melodic"],
  color: "#1a0a2e",
  licenses: [
    {
      type: "basic",
      name: "Basic License",
      price: 30000,
      popular: false,
      features: [
        "Waveform (MP3)",
        "Non-exclusive",
        "YouTube & Social Media",
        "Up to 10,000 streams",
      ],
      cta: "Select Basic",
    },
    {
      type: "premium",
      name: "Premium License",
      price: 70000,
      popular: true,
      features: [
        "Stems (ZIP)",
        "WAV + MP3",
        "Non-exclusive",
        "Unlimited streams",
        "Commercial use",
      ],
      cta: "Select Premium",
    },
    {
      type: "exclusive",
      name: "Exclusive License",
      price: 150000,
      popular: false,
      features: [
        "Direct producer access",
        "Beat customization",
        "Exclusive rights",
        "Consultation & support",
        "Project collaboration",
      ],
      cta: "Select Exclusive",
    },
  ],
}

export default function BeatDetailPage() {
  const [selectedLicense, setSelectedLicense] = useState("premium")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState("")
  const [pendingLicense, setPendingLicense] = useState<typeof beat.licenses[0] | null>(null)
  const [paying, setPaying] = useState(false)

  function handlePurchase(license: typeof beat.licenses[0]) {
    if (license.type === "exclusive") {
      window.location.href = `mailto:seniormanKP@gmail.com?subject=Exclusive License - ${beat.title}`
      return
    }
    setPendingLicense(license)
    setShowModal(true)
  }

  function handlePaystack() {
    if (!pendingLicense || !email) return
    setPaying(true)

    const reference = `SMKP-${beat.id}-${pendingLicense.type}-${Date.now()}`

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: pendingLicense.price * 100,
      currency: "NGN",
      ref: reference,
      metadata: {
        beat_id: beat.id,
        beat_title: beat.title,
        license_type: pendingLicense.type,
      },
      callback: (response: any) => {
        window.location.href = `/success?reference=${response.reference}`
      },
      onClose: () => {
        setPaying(false)
      },
    })

    handler.openIframe()
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "80px" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "96px 32px 0" }}>

        {/* Back link */}
        <Link href="/store" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          color: "var(--text-muted)", fontSize: "0.78rem",
          fontFamily: "var(--font-ui)", textDecoration: "none",
          marginBottom: "32px",
        }}>
          ← Back to all beats
        </Link>

        {/* Top Section */}
        <div className="beat-detail-top" style={{ display: "flex", gap: "40px", marginBottom: "48px", flexWrap: "wrap" }}>

          {/* Cover Art */}
          <div className="beat-detail-cover" style={{
            width: "200px", height: "200px", flexShrink: 0, borderRadius: "8px",
            background: `linear-gradient(135deg, ${beat.color} 0%, #0a0a0a 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            <span style={{
              color: "rgba(255,255,255,0.08)", fontSize: "2rem",
              fontWeight: 900, fontFamily: "var(--font-ui)", textAlign: "center",
              padding: "0 16px", lineHeight: 1.1,
            }}>
              {beat.title.toUpperCase()}
            </span>
          </div>

          {/* Beat Info */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h1 style={{
              fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)",
              fontFamily: "var(--font-ui)", letterSpacing: "-0.02em",
              lineHeight: 1, marginBottom: "12px",
            }}>
              {beat.title}
            </h1>

            <div style={{
              display: "inline-block",
              backgroundColor: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "var(--gold)", fontSize: "0.65rem",
              fontFamily: "var(--font-mono)", letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "4px 12px",
              borderRadius: "20px", marginBottom: "16px",
            }}>
              {beat.genre}
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { label: "BPM", value: beat.bpm },
                { label: "Key", value: beat.key },
                { label: "Duration", value: beat.duration },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
                    {stat.label}
                  </div>
                  <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7, fontFamily: "var(--font-ui)", maxWidth: "480px", marginBottom: "16px" }}>
              {beat.description}
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {beat.tags.map((tag) => (
                <span key={tag} style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-dim)",
                  color: "var(--text-muted)", fontSize: "0.65rem",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                  padding: "4px 10px", borderRadius: "2px",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* License Section */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Choose a License
            </h2>
            <Link href="/licensing" style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              License Info →
            </Link>
          </div>

          <div className="license-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {beat.licenses.map((license) => (
              <div
                key={license.type}
                onClick={() => setSelectedLicense(license.type)}
                style={{
                  backgroundColor: selectedLicense === license.type ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                  border: `1px solid ${selectedLicense === license.type ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                  borderRadius: "8px", padding: "24px",
                  cursor: "pointer", position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                {license.popular && (
                  <div style={{
                    position: "absolute", top: "-12px", left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--gold)", color: "#000",
                    fontSize: "0.55rem", fontWeight: 700,
                    padding: "4px 12px", borderRadius: "20px",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}>
                    Popular
                  </div>
                )}

                <h3 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>
                  {license.name}
                </h3>

                <div style={{
                  fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)",
                  letterSpacing: "-0.02em", marginBottom: "20px",
                  color: license.popular ? "var(--gold)" : "var(--text-primary)",
                }}>
                  ₦{license.price.toLocaleString()}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {license.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✓</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handlePurchase(license) }}
                  style={{
                    width: "100%", padding: "12px",
                    backgroundColor: license.popular ? "var(--gold)" : "transparent",
                    border: `1px solid ${license.popular ? "var(--gold)" : "var(--border-dim)"}`,
                    borderRadius: "4px", cursor: "pointer",
                    color: license.popular ? "#000" : "var(--text-primary)",
                    fontSize: "0.72rem", fontWeight: 700,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                    textTransform: "uppercase", transition: "all 0.2s ease",
                  }}
                >
                  {license.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Preview */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ color: "var(--text-primary)", fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
            Listen to Preview
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: "44px", height: "44px", borderRadius: "50%",
                backgroundColor: "var(--gold)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
              }}
            >
              <span style={{ color: "#000", fontSize: "0.85rem", marginLeft: isPlaying ? "0" : "2px" }}>
                {isPlaying ? "■" : "▶"}
              </span>
            </button>

            <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>0:00</span>

            <div style={{ flex: 1, height: "48px", position: "relative", cursor: "pointer" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: "2px" }}>
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${Math.sin(i * 0.4) * 40 + Math.random() * 30 + 20}%`,
                    backgroundColor: i < 24 ? "var(--gold)" : "rgba(255,255,255,0.1)",
                    borderRadius: "1px",
                  }} />
                ))}
              </div>
            </div>

            <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {beat.duration}
            </span>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "12px", padding: "36px",
            maxWidth: "420px", width: "100%",
          }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>
              Almost there!
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)", marginBottom: "24px", lineHeight: 1.6 }}>
              Enter your email to receive your download link after payment.
            </p>

            {/* Order Summary */}
            <div style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px", padding: "14px 16px",
              marginBottom: "20px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{beat.title}</div>
                <div style={{ color: "var(--gold)", fontSize: "0.7rem", fontFamily: "var(--font-ui)" }}>{pendingLicense?.name}</div>
              </div>
              <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
                ₦{pendingLicense?.price.toLocaleString()}
              </div>
            </div>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "4px", color: "var(--text-primary)",
                fontSize: "0.85rem", fontFamily: "var(--font-ui)",
                outline: "none", marginBottom: "16px",
              }}
            />

            <button
              onClick={handlePaystack}
              disabled={!email || paying}
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                border: "none", borderRadius: "4px",
                color: "#000", fontSize: "0.78rem", fontWeight: 800,
                fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: !email || paying ? "not-allowed" : "pointer",
                opacity: !email || paying ? 0.6 : 1,
                marginBottom: "12px",
              }}
            >
              {paying ? "Opening Paystack..." : "Pay with Paystack"}
            </button>

            <button
              onClick={() => { setShowModal(false); setPaying(false) }}
              style={{
                width: "100%", padding: "10px",
                background: "none", border: "none",
                color: "var(--text-muted)", fontSize: "0.75rem",
                fontFamily: "var(--font-ui)", cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <p style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)", textAlign: "center", marginTop: "12px" }}>
              Secured by Paystack. Download link sent to your email after payment.
            </p>
          </div>
        </div>
      )}

    </main>
  )
}