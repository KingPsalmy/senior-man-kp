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
      "One commercial song",
      "Streaming on all major platforms",
      "YouTube monetization",
      "Social media usage",
      "Live performances",
    ],
    restrictions: [
      "No stems",
      "No advertising or film usage",
      "No Content ID registration",
      "No exclusivity",
    ],
    bulkDeal: "Buy 3 Beats, Get 1 FREE" as string | null,
    ctaStyle: "outline",
  },
  {
    type: "premium",
    name: "Premium License",
    price: "₦70,000",
    popular: true,
    tag: "POPULAR" as string | null,
    features: [
      "MP3, WAV & full stems",
      "One commercial song",
      "Streaming & global distribution",
      "Unlimited music videos",
      "Radio broadcasting rights",
      "Online commercial promotion",
      "Live performances",
    ],
    restrictions: [
      "No TV or large-scale advertising",
      "No Content ID registration",
      "No exclusivity",
    ],
    bulkDeal: "Buy 3 Beats, Get 1 Basic Beat FREE" as string | null,
    ctaStyle: "filled",
  },
  {
    type: "unlimited",
    name: "Unlimited License",
    price: "₦120,000",
    popular: false,
    tag: "BEST VALUE" as string | null,
    features: [
      "MP3, WAV & full stems",
      "One commercial song",
      "Streaming & global distribution",
      "Unlimited music videos",
      "Radio & television usage",
      "Commercial advertising usage",
      "Physical distribution",
      "Live performances",
    ],
    restrictions: [
      "No exclusivity",
      "No Content ID registration",
      "No ownership of instrumental",
    ],
    bulkDeal: "Buy 3 Beats, Get 1 Unlimited Beat FREE" as string | null,
    ctaStyle: "outline",
  },
  {
    type: "exclusive",
    name: "Exclusive License",
    price: "₦180,000",
    popular: false,
    tag: null as string | null,
    features: [
      "MP3, WAV & full stems",
      "Full commercial exploitation rights",
      "Streaming, video, radio & TV",
      "Film, documentary & advertising",
      "Physical & digital distribution",
      "Beat permanently removed from store",
      "Direct producer access",
      "Beat modifications & collaboration",
    ],
    restrictions: [
      "Prior licenses remain valid",
    ],
    bulkDeal: "Buy 3 Exclusives, Get 1 Exclusive FREE" as string | null,
    ctaStyle: "gold",
  },
]

const licenseTexts: Record<string, string> = {
  basic: `BASIC LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3 and WAV files of the Instrumental.
- Create and commercially release one (1) new Song.
- Monetize the Song on digital streaming platforms.
- Distribute the Song through Spotify, Apple Music, Audiomack, Boomplay, YouTube Music, Deezer, and similar services.
- Upload and monetize the Song on YouTube.
- Use the Song on social media platforms.
- Perform the Song live for commercial and non-commercial purposes.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated fingerprinting or copyright-claiming system.
- Use the Song in television, film, gaming, or advertising productions.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  premium: `PREMIUM LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all major digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song on radio stations.
- Use the Song for online commercial promotional campaigns.
- Perform the Song live without limitation.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated copyright-claiming system.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  unlimited: `UNLIMITED LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive Unlimited License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all major digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song through radio and television outlets.
- Use the Song in commercial advertising campaigns.
- Manufacture and distribute physical copies of the Song.
- Perform the Song live without limitation.
- Use the Song for commercial promotional purposes.

NON-EXCLUSIVE NATURE
Licensee acknowledges that this is a non-exclusive license. Senior Man KP reserves the unrestricted right to continue licensing the Instrumental to additional parties. No exclusivity is granted under this Agreement.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated copyright-claiming system.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.
- Use the Song in major motion pictures, television network productions, or national advertising campaigns without obtaining an Exclusive License or prior written approval from Senior Man KP.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  exclusive: `EXCLUSIVE LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song through radio and television outlets.
- Use the Song in commercial advertising campaigns.
- Use the Song in film, television, documentary, and audiovisual productions.
- Use the Song in major motion pictures, television network productions, and national advertising campaigns.
- Manufacture and distribute physical copies of the Song.
- Perform the Song live without limitation.
- Monetize the Song through all currently existing and future media formats.

EXCLUSIVITY
Following execution of this Agreement, Senior Man KP shall cease offering the Instrumental for future sale or licensing. The Instrumental shall be removed from public sale within a reasonable period following purchase. No future licenses shall be issued after the effective date of this Agreement.

PRIOR LICENSES
Licensee acknowledges that any licenses issued before the execution of this Agreement shall remain valid and enforceable. Nothing in this Agreement revokes rights previously granted to earlier purchasers.

OWNERSHIP
Senior Man KP retains ownership of the underlying musical composition and authorship of the Instrumental unless otherwise agreed in writing. Licensee receives exclusive commercial exploitation rights as granted under this Agreement.

PUBLISHING
Unless otherwise agreed in writing:
- Senior Man KP shall retain fifty percent (50%) of the writers and publishing share attributable to the Instrumental.
- Licensee shall retain fifty percent (50%) of the writers and publishing share attributable to the Song.

CONTENT ID
Licensee may register the Song with YouTube Content ID, Meta Rights Manager, TikTok Rights Management, and similar systems, provided such registration does not interfere with the legitimate rights of previous license holders.

TERM
Perpetual (Lifetime).

BREACH
Any violation of this Agreement immediately terminates all rights granted herein. Any continued use following termination constitutes copyright infringement.

GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.`,
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
          padding: "140px 48px 100px",
          textAlign: "center",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Licensing
        </span>
        <h1 style={{ color: "var(--text-primary)", marginTop: "14px", marginBottom: "20px" }}>
          Clear Licensing.
          <br />
          Real Ownership.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.8, maxWidth: "620px", margin: "0 auto 36px", fontFamily: "var(--font-ui)" }}>
          Four tiers designed for every stage of your career — from your first single to your biggest commercial release.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link href="/store" style={{ padding: "15px 32px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", color: "#000", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Browse Store
          </Link>
          <Link href="/faq" style={{ padding: "15px 32px", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            View FAQ
          </Link>
        </div>
      </section>

      {/* License Cards */}
      <section
        className="license-section"
        style={{ padding: "100px 48px" }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            className="license-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", alignItems: "start" }}
          >
            {licenses.map((item) => (
              <div
                key={item.type}
                style={{
                  backgroundColor: item.popular ? "rgba(201,168,76,0.05)" : "var(--bg-card)",
                  border: `1px solid ${item.popular ? "rgba(201,168,76,0.4)" : "var(--border-subtle)"}`,
                  borderRadius: "12px", padding: "32px", position: "relative",
                }}
              >
                {item.tag && (
                  <div style={{
                    position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)",
                    backgroundColor: item.type === "unlimited" ? "var(--bg-elevated)" : "var(--gold)",
                    color: item.type === "unlimited" ? "var(--gold)" : "#000",
                    border: item.type === "unlimited" ? "1px solid var(--gold)" : "none",
                    fontSize: "0.65rem", fontWeight: 700, padding: "6px 18px", borderRadius: "20px",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.14em", whiteSpace: "nowrap",
                  }}>
                    {item.tag}
                  </div>
                )}

                <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>
                  {item.name}
                </div>

                <div style={{ color: item.popular ? "var(--gold)" : "var(--text-primary)", fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginBottom: "28px" }}>
                  {item.price}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>Included</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {item.features.map((feature) => (
                      <div key={feature} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--gold)", marginTop: "2px", flexShrink: 0 }}>✓</span>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, fontFamily: "var(--font-ui)" }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>Limitations</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {item.restrictions.map((restriction) => (
                      <div key={restriction} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--text-muted)", marginTop: "2px", flexShrink: 0 }}>×</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, fontFamily: "var(--font-ui)" }}>{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setModalLicense(item.type)}
                  style={{
                    width: "100%", padding: "13px", marginBottom: "10px",
                    borderRadius: "4px", cursor: "pointer",
                    border: "1px solid var(--gold)", backgroundColor: "transparent",
                    color: "var(--gold)", fontSize: "0.82rem", fontWeight: 700,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                  Read License
                </button>

                {item.type === "exclusive" ? (
                  <a
                    href="mailto:contact@seniormankp.com?subject=Exclusive License Inquiry"
                    style={{
                      display: "block", width: "100%", padding: "13px",
                      background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                      borderRadius: "4px", color: "#000", textDecoration: "none",
                      textAlign: "center", fontSize: "0.82rem", fontWeight: 700,
                      fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                      textTransform: "uppercase", boxSizing: "border-box",
                    }}>
                    Contact Producer
                  </a>
                ) : (
                  <Link
                    href="/store"
                    style={{
                      display: "block", width: "100%", padding: "13px",
                      border: "1px solid var(--border-dim)", borderRadius: "4px",
                      color: "var(--text-secondary)", textDecoration: "none",
                      textAlign: "center", fontSize: "0.82rem", fontWeight: 700,
                      fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                      textTransform: "uppercase", boxSizing: "border-box",
                    }}>
                    Browse Store
                  </Link>
                )}

                {item.bulkDeal && (
                  <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "var(--bg-elevated)", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>Bundle Deal</div>
                    <div style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", lineHeight: 1.5 }}>{item.bulkDeal}</div>
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
        style={{ padding: "100px 48px", borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-deep)" }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Need Help?</span>
          <h2 style={{ color: "var(--text-primary)", marginTop: "12px", marginBottom: "20px" }}>
            Still Have Questions?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.8, fontFamily: "var(--font-ui)", marginBottom: "36px" }}>
            Visit the FAQ page or contact the producer directly for custom licensing, collaborations, and exclusive negotiations.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/faq" style={{ padding: "15px 32px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", color: "#000", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Visit FAQ
            </Link>
            <a href="mailto:contact@seniormankp.com" style={{ padding: "15px 32px", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Contact Producer
            </a>
          </div>
        </div>
      </section>

      {/* License Modal */}
      {modalLicense && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "12px", width: "100%", maxWidth: "720px", maxHeight: "82vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
                {licenses.find((l) => l.type === modalLicense)?.name} Agreement
              </h3>
              <button onClick={() => setModalLicense(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "28px 32px", overflowY: "auto", flex: 1 }}>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.9, fontFamily: "var(--font-ui)" }}>
                {licenseTexts[modalLicense]}
              </pre>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .license-hero {
            padding: 100px 20px 60px !important;
          }
          .license-section {
            padding: 60px 20px !important;
          }
          .license-grid {
            grid-template-columns: 1fr !important;
          }
          .license-faq {
            padding: 60px 20px !important;
          }
        }
      `}</style>
    </main>
  )
}