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
      price: 10000,
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
      price: 30000,
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
      price: 200000,
      popular: false,
      features: [
        "Direct producer access",
        "Beat customization",
        "Exclusive rights",
        "Consultation & support",
        "Project collaboration",
      ],
      cta: "Contact Producer",
    },
  ],
}

export default function BeatDetailPage() {
  const [selectedLicense, setSelectedLicense] = useState("premium")
  const [isPlaying, setIsPlaying] = useState(false)

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

            {/* Genre badge */}
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

            {/* Stats */}
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

            {/* Description */}
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7, fontFamily: "var(--font-ui)", maxWidth: "480px", marginBottom: "16px" }}>
              {beat.description}
            </p>

            {/* Tags */}
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

          {/* License Cards */}
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
                {/* Popular badge */}
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

                <h3 style={{
                  color: "var(--text-primary)", fontSize: "0.85rem",
                  fontWeight: 700, fontFamily: "var(--font-ui)",
                  marginBottom: "8px",
                }}>
                  {license.name}
                </h3>

                <div style={{
                  fontSize: "1.8rem", fontWeight: 800,
                  fontFamily: "var(--font-ui)", letterSpacing: "-0.02em",
                  marginBottom: "20px",
                  color: license.popular ? "var(--gold)" : "var(--text-primary)",
                }}>
                  ₦{license.price.toLocaleString()}
                  {license.type === "exclusive" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>+</span>
                  )}
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {license.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✓</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button style={{
                  width: "100%", padding: "12px",
                  backgroundColor: license.popular ? "var(--gold)" : "transparent",
                  border: `1px solid ${license.popular ? "var(--gold)" : "var(--border-dim)"}`,
                  borderRadius: "4px", cursor: "pointer",
                  color: license.popular ? "#000" : "var(--text-primary)",
                  fontSize: "0.72rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}>
                  {license.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Preview */}
        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px", padding: "24px",
        }}>
          <h2 style={{
            color: "var(--text-primary)", fontSize: "0.72rem",
            fontWeight: 700, fontFamily: "var(--font-mono)",
            letterSpacing: "0.2em", textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            Listen to Preview
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Play button */}
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

            {/* Timestamp */}
            <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              0:00
            </span>

            {/* Waveform placeholder */}
            <div style={{ flex: 1, height: "48px", position: "relative", cursor: "pointer" }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", gap: "2px",
              }}>
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.sin(i * 0.4) * 40 + Math.random() * 30 + 20}%`,
                      backgroundColor: i < 24 ? "var(--gold)" : "rgba(255,255,255,0.1)",
                      borderRadius: "1px",
                      transition: "background-color 0.2s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Duration */}
            <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {beat.duration}
            </span>
          </div>
        </div>

      </div>
    </main>
  )
}