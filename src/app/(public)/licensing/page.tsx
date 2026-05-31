"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

const licenses = [
  {
    type: "basic",
    name: "Basic License",
    price: "₦30,000",
    popular: false,
    tag: null as string | null,
    features: [
      "MP3 & WAV files",
      "Non-exclusive rights",
      "YouTube & Social Media",
      "Unlimited Streams (Audio & Video)",
      "For Profit Live Performances",
    ],
    bulkDeal: "Buy 3 Beats, Get 1 FREE!" as string | null,
    cta: "Browse Store",
    ctaStyle: "outline",
  },
  {
    type: "premium",
    name: "Premium License",
    price: "₦70,000",
    popular: true,
    tag: "POPULAR" as string | null,
    features: [
      "MP3, WAV & Track Stems",
      "Non-exclusive rights",
      "Unlimited streams",
      "Unlimited Music Videos",
      "Radio Broadcasting Rights",
      "For Profit Live Performances",
      "Commercial use",
    ],
    bulkDeal: "Buy 2 Beats, Get 1 FREE!" as string | null,
    cta: "Browse Store",
    ctaStyle: "filled",
  },
  {
    type: "exclusive",
    name: "Exclusive License",
    price: "From ₦150,000",
    popular: false,
    tag: null as string | null,
    features: [
      "MP3, WAV & Track Stems",
      "100% Exclusive rights",
      "Unlimited everything",
      "Direct producer access",
      "Beat customization",
      "Consultation & support",
      "Project collaboration",
    ],
    bulkDeal: "Buy 3 Beats, Get 2 FREE!" as string | null,
    cta: "Browse Store",
    ctaStyle: "gold",
  },
]

const licenseTexts: Record<string, string> = {
  basic: `This Non-Exclusive Basic License Agreement is made between Senior Man KP (the "Producer") and the Licensee.

WHAT YOU GET:
- High-quality MP3 & WAV audio files
- Non-exclusive rights to use the beat
- YouTube & Social Media usage
- Up to 10,000 streams
- 1 Music Video
- For Profit Live Performances

RESTRICTIONS:
- Rights are NON-TRANSFERABLE
- Cannot register the beat with Content ID systems
- Cannot sublicense or resell the beat
- Beat remains property of Senior Man KP

CREDIT:
Licensee shall credit the Producer as "Prod. by KP" on all releases.

TERM:
10 years from date of purchase.

By purchasing this license, you agree to all terms stated above.`,

  premium: `This Non-Exclusive Premium License Agreement is made between Senior Man KP (the "Producer") and the Licensee.

WHAT YOU GET:
- High-quality MP3, WAV & Track Stems
- Non-exclusive rights to use the beat
- Unlimited streams (audio & video)
- Unlimited Music Videos
- Radio Broadcasting rights
- For Profit Live Performances
- Commercial use rights

RESTRICTIONS:
- Rights are NON-TRANSFERABLE
- Cannot register the beat with Content ID systems
- Cannot sublicense or resell the beat
- Beat remains property of Senior Man KP

CREDIT:
Licensee shall credit the Producer as "Prod. by KP" on all releases.

TERM:
10 years from date of purchase.

By purchasing this license, you agree to all terms stated above.`,

  exclusive: `This Exclusive License Agreement is made between Senior Man KP (the "Producer") and the Licensee.

WHAT YOU GET:
- High-quality MP3, WAV & Track Stems
- 100% Exclusive rights
- Beat removed from store
- Unlimited streams, downloads & performances
- Direct producer access
- Beat customization
- Consultation & collaboration support

OWNERSHIP:
Producer assigns all master rights to Licensee.
Producer retains 50% publishing/composition rights.

CREDIT:
Licensee shall credit the Producer as "Prod. by KP" on all releases.

CONTACT:
kingpsalmyofficial@gmail.com

TERM:
Perpetual (Lifetime).

By purchasing this license, you agree to all terms stated above.`,
}

export default function LicensingPage() {
  const [modalLicense, setModalLicense] = useState<string | null>(null)

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="license-hero"
        style={{
          padding: "120px 48px 80px",
          textAlign: "center",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span style={{
          color: "var(--gold)", fontSize: "0.65rem",
          fontFamily: "var(--font-mono)", letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>
          Licensing
        </span>

        <h1 style={{
          color: "var(--text-primary)",
          fontSize: "clamp(2.4rem, 5vw, 4rem)",
          fontWeight: 800, fontFamily: "var(--font-ui)",
          letterSpacing: "-0.03em", marginTop: "10px", marginBottom: "18px",
        }}>
          Clear Licensing.
          <br />
          Real Ownership.
        </h1>

        <p style={{
          color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.8,
          maxWidth: "620px", margin: "0 auto", fontFamily: "var(--font-ui)",
        }}>
          Every beat includes transparent licensing terms designed for
          independent artists, commercial releases, and serious creators.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "32px", flexWrap: "wrap" }}>
          <Link href="/store" style={{
            padding: "13px 28px",
            background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
            color: "#000", textDecoration: "none", borderRadius: "4px",
            fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Browse Store
          </Link>
          <Link href="/faq" style={{
            padding: "13px 28px",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "var(--gold)", textDecoration: "none", borderRadius: "4px",
            fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            View FAQ
          </Link>
        </div>
      </section>

      {/* License Cards */}
      <section className="license-section" style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
          <div
            className="license-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {licenses.map((item) => (
              <div
                key={item.type}
                style={{
                  backgroundColor: item.popular ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                  border: `1px solid ${item.popular ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                  borderRadius: "10px", padding: "32px", position: "relative",
                }}
              >
                {/* Tag */}
                {item.tag && (
                  <div style={{
                    position: "absolute", top: "-14px", left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--gold)", color: "#000",
                    fontSize: "0.6rem", fontWeight: 700,
                    padding: "6px 16px", borderRadius: "20px",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.14em",
                  }}>
                    {item.tag}
                  </div>
                )}

                {/* Name */}
                <div style={{
                  color: "var(--text-muted)", fontSize: "0.68rem",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  fontFamily: "var(--font-mono)", marginBottom: "10px",
                }}>
                  {item.name}
                </div>

                {/* Price */}
                <div style={{
                  color: item.popular ? "var(--gold)" : "var(--text-primary)",
                  fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)",
                  letterSpacing: "-0.03em", marginBottom: "24px",
                }}>
                  {item.price}
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                  {item.features.map((feature) => (
                    <div key={feature} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--gold)", marginTop: "2px", flexShrink: 0 }}>•</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: 1.5, fontFamily: "var(--font-ui)" }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Read License Button */}
                <button
                  onClick={() => setModalLicense(item.type)}
                  style={{
                    width: "100%", padding: "12px", marginBottom: "12px",
                    borderRadius: "4px", cursor: "pointer",
                    border: `1px solid ${item.ctaStyle === "outline" ? "var(--border-dim)" : "var(--gold)"}`,
                    backgroundColor: item.ctaStyle === "outline" ? "transparent" : "var(--gold)",
                    color: item.ctaStyle === "outline" ? "var(--text-primary)" : "#000",
                    fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}
                >
                  Read License
                </button>

               {item.type === "exclusive" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <a
                        href="mailto:kingpsalmyofficial@gmail.com?subject=Exclusive License Inquiry"
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "12px",
                            border: "1px solid rgba(201,168,76,0.3)",
                            borderRadius: "4px",
                            color: "var(--gold)",
                            textDecoration: "none",
                            textAlign: "center",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-ui)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                        }}
                        >
                        Contact Producer
                        </a>
                    </div>
                    ) : (
                  <Link
                    href="/store"
                    style={{
                      display: "block", width: "100%", padding: "12px",
                      border: "1px solid var(--border-dim)", borderRadius: "4px",
                      color: "var(--text-secondary)", textDecoration: "none", textAlign: "center",
                      fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                    }}
                  >
                    {item.cta}
                  </Link>
                )}

                {/* Bulk Deal */}
                {item.bulkDeal && (
                  <div style={{
                    marginTop: "20px", padding: "14px",
                    backgroundColor: "var(--bg-elevated)",
                    borderRadius: "6px", textAlign: "center",
                  }}>
                    <div style={{
                      color: "var(--text-muted)", fontSize: "0.6rem",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      fontFamily: "var(--font-mono)", marginBottom: "5px",
                    }}>
                      Bundle Deal
                    </div>
                    <div style={{
                      color: "var(--text-primary)", fontSize: "0.72rem",
                      fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: 1.5,
                    }}>
                      {item.bulkDeal}
                      {item.type === "exclusive" && " • Direct Producer Access"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section
        className="license-faq"
        style={{
          padding: "80px 48px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-deep)",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
          <span style={{
            color: "var(--gold)", fontSize: "0.65rem",
            fontFamily: "var(--font-mono)", letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            Need Help?
          </span>

          <h2 style={{
            color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800,
            fontFamily: "var(--font-ui)", marginTop: "10px", marginBottom: "18px",
          }}>
            Still Have Questions?
          </h2>

          <p style={{
            color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.8,
            fontFamily: "var(--font-ui)", marginBottom: "32px",
          }}>
            Visit the FAQ page or contact the producer directly for
            custom licensing, collaborations, and exclusive negotiations.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/faq" style={{
              padding: "13px 28px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              color: "#000", textDecoration: "none", borderRadius: "4px",
              fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Visit FAQ
            </Link>
            <a href="mailto:kingpsalmyofficial@gmail.com" style={{
              padding: "13px 28px",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "var(--gold)", textDecoration: "none", borderRadius: "4px",
              fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Contact Producer
            </a>
          </div>
        </div>
      </section>

      {/* License Modal */}
      {modalLicense && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "12px", width: "100%", maxWidth: "680px",
            maxHeight: "80vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "20px 28px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h2 style={{
                color: "var(--text-primary)", fontSize: "0.9rem",
                fontWeight: 700, fontFamily: "var(--font-ui)",
              }}>
                {licenses.find((l) => l.type === modalLicense)?.name} Agreement
              </h2>
              <button
                onClick={() => setModalLicense(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
              <pre style={{
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                color: "var(--text-secondary)", fontSize: "0.78rem",
                lineHeight: 1.8, fontFamily: "var(--font-ui)",
              }}>
                {licenseTexts[modalLicense]}
              </pre>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}