"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

const faqs = [
  {
    q: "Do I need an account to buy beats?",
    a: "No. You can browse, favorite, and purchase beats without creating an account. We use a guest system that tracks your cart and favorites across sessions.",
  },
  {
    q: "What's the difference between the four license tiers?",
    a: "Basic (₦30,000) gives you MP3 & WAV for standard releases. Premium (₦70,000) adds stems and broader commercial rights. Unlimited (₦120,000) covers full commercial use including TV and advertising. Exclusive (₦180,000) removes the beat from the store permanently and gives you full commercial control.",
  },
  {
    q: "Can someone else buy the same beat I licensed?",
    a: "Yes, for Basic, Premium, and Unlimited licenses. Multiple artists can license the same beat non-exclusively. Only the Exclusive license removes the beat from the store permanently.",
  },
  {
    q: "What happens after I pay?",
    a: "You'll receive a confirmation email. You can access your downloads anytime at /my-downloads using the email address you used at checkout.",
  },
  {
    q: "Can I get a refund?",
    a: "Due to the digital nature of music files, all sales are final. If you have an issue with your purchase, contact us at contact@seniormankp.com.",
  },
  {
    q: "How do I credit the producer?",
    a: 'All releases using beats from this store must credit "Prod. by Senior Man KP" in the title, description, or credits section.',
  },
  {
    q: "Can I use the beat for commercial projects?",
    a: "Yes, all four tiers allow commercial use. The difference is in scope — Basic covers streaming and social media, Premium adds radio, Unlimited adds TV and advertising, and Exclusive covers everything with no restrictions.",
  },
  {
    q: "What if a beat I favorited gets sold exclusively?",
    a: "You'll receive an email notification. The beat will be marked as unavailable in your favorites and we'll suggest similar beats you might like.",
  },
  {
    q: "Do you offer custom beats?",
    a: "Yes. Contact the producer directly at contact@seniormankp.com to discuss custom projects and collaborations.",
  },
  {
    q: "What file formats do I receive?",
    a: "Basic: MP3 & WAV. Premium: MP3, WAV & full stems. Unlimited: MP3, WAV & full stems. Exclusive: MP3, WAV & full stems, plus direct producer access for modifications.",
  },
  {
    q: "Are there any bulk deals?",
    a: "Yes. Basic: Buy 3, get 1 free. Premium: Buy 3, get 1 Basic free. Unlimited: Buy 3, get 1 Unlimited free. Exclusive: Buy 3, get 1 Exclusive free.",
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "160px 48px 120px", textAlign: "center", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{
          display: "inline-block",
          color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
          letterSpacing: "0.32em", textTransform: "uppercase",
          marginBottom: "20px", padding: "8px 20px",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
        }}>
          FAQ
        </span>
        <h1 style={{
          color: "var(--text-primary)", marginTop: "0", marginBottom: "24px",
          fontSize: "clamp(2.6rem, 5vw, 4.5rem)", fontWeight: 800,
          fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", lineHeight: 1.08,
        }}>
          Frequently Asked
          <br />
          <span style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Questions
          </span>
        </h1>
        <p style={{
          color: "rgba(245,240,232,0.65)", fontSize: "1.2rem", lineHeight: 1.8,
          maxWidth: "600px", margin: "0 auto",
          fontFamily: "var(--font-ui)",
        }}>
          Everything you need to know about licensing, payments, and working with Senior Man KP.
        </p>
      </section>

      {/* FAQ Items */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "32px 0",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", background: "none", border: "none",
                  cursor: "pointer", textAlign: "left", padding: 0,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px",
                }}
              >
                <span style={{
                  color: open === i ? "var(--gold)" : "var(--text-primary)",
                  fontSize: "1.15rem", fontWeight: 700,
                  fontFamily: "var(--font-ui)", lineHeight: 1.4,
                  transition: "color 0.2s ease",
                }}>
                  {faq.q}
                </span>
                <span style={{
                  color: open === i ? "var(--gold)" : "var(--text-muted)",
                  fontSize: "1.5rem", flexShrink: 0, lineHeight: 1,
                  transition: "transform 0.25s ease, color 0.2s ease",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}>+</span>
              </button>

              {open === i && (
                <p style={{
                  color: "rgba(245,240,232,0.72)", fontSize: "1.05rem",
                  lineHeight: 1.9, fontFamily: "var(--font-ui)",
                  marginTop: "20px", maxWidth: "720px",
                }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "140px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "var(--bg-deep)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
            letterSpacing: "0.28em", textTransform: "uppercase",
            marginBottom: "20px", padding: "8px 20px",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
          }}>
            Still have questions?
          </span>
          <h2 style={{
            color: "var(--text-primary)", marginTop: "0", marginBottom: "24px",
            fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 800,
            fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            Get in Touch Directly
          </h2>
          <p style={{
            color: "rgba(245,240,232,0.65)", fontSize: "1.15rem",
            lineHeight: 1.85, fontFamily: "var(--font-ui)",
            marginBottom: "44px", maxWidth: "540px", margin: "0 auto 44px",
          }}>
            Can't find your answer here? Reach out directly for custom licensing, collaborations, or any other enquiries.
          </p>
          <a
            href="mailto:contact@seniormankp.com"
            style={{
              display: "inline-block", padding: "17px 44px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              color: "#000", textDecoration: "none", borderRadius: "8px",
              fontSize: "0.95rem", fontWeight: 700,
              fontFamily: "var(--font-ui)", letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Contact Producer
          </a>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
          section:first-of-type { padding-top: 120px !important; padding-bottom: 70px !important; }
        }
      `}</style>
    </main>
  )
}
