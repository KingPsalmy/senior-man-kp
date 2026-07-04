"use client"

import Navbar from "@/components/layout/Navbar"
import Link from "next/link"

const contacts = [
  {
    icon: "✉",
    label: "Email",
    value: "kingpsalmyofficial@gmail.com",
    cta: "Send Email",
    href: "mailto:kingpsalmyofficial@gmail.com",
  },
  {
    icon: "◉",
    label: "Instagram",
    value: "@kingpsalmy_",
    cta: "Follow",
    href: "https://instagram.com/kingpsalmy_",
  },
  {
    icon: "▶",
    label: "YouTube",
    value: "@kingpsalmy_",
    cta: "Subscribe",
    href: "https://youtube.com/@kingpsalmy_",
  },
  {
    icon: "✕",
    label: "X (Twitter)",
    value: "@kingpsalmy_",
    cta: "Follow",
    href: "https://x.com/kingpsalmy_",
  },
  {
    icon: "♪",
    label: "TikTok",
    value: "@kingpsalmy_",
    cta: "Follow",
    href: "https://tiktok.com/@kingpsalmy_",
  },
  {
    icon: "🎮",
    label: "Discord",
    value: "@kingpsalmy_",
    cta: "Join",
    href: "https://discord.gg/kingpsalmy",
  },
]

export default function ContactPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section className="contact-hero" style={{ padding: "160px 48px 120px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{
          display: "inline-block",
          color: "var(--gold)", fontSize: "0.85rem", fontFamily: "var(--font-mono)",
          letterSpacing: "0.32em", textTransform: "uppercase",
          marginBottom: "20px", padding: "8px 20px",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "24px", backgroundColor: "rgba(201,168,76,0.06)",
        }}>
          Get in Touch
        </span>
        <h1 style={{
          color: "var(--text-primary)", marginTop: "0", marginBottom: "24px",
          fontSize: "clamp(2.6rem, 5vw, 4.5rem)", fontWeight: 800,
          fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", lineHeight: 1.08,
        }}>
          Contact{" "}
          <span style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Producer
          </span>
        </h1>
        <p style={{
          color: "rgba(245,240,232,0.65)", fontSize: "1.2rem", lineHeight: 1.8,
          maxWidth: "600px", margin: "0 auto",
          fontFamily: "var(--font-ui)",
        }}>
          For custom beats, exclusive negotiations, collaborations, or any questions — reach out directly.
        </p>
      </section>

      {/* Contact Cards */}
      <section className="contact-section" style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "32px" }}>
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div className="contact-card" style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px", padding: "40px",
                  transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  position: "relative", overflow: "hidden",
                }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(201,168,76,0.4)"
                    el.style.transform = "translateY(-4px)"
                    el.style.boxShadow = "0 20px 48px rgba(0,0,0,0.5), 0 0 24px rgba(201,168,76,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = "rgba(255,255,255,0.07)"
                    el.style.transform = "translateY(0)"
                    el.style.boxShadow = "none"
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: "36px", right: "36px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />

                  <div style={{
                    width: "52px", height: "52px", borderRadius: "14px",
                    backgroundColor: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", marginBottom: "28px",
                  }}>
                    {c.icon}
                  </div>

                  <div style={{ color: "var(--gold)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px" }}>
                    {c.label}
                  </div>
                  <div style={{ color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "24px" }}>
                    {c.value}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--gold)", fontSize: "0.92rem", fontFamily: "var(--font-ui)", fontWeight: 700, letterSpacing: "0.05em" }}>
                    {c.cta} <span style={{ fontSize: "1.05rem" }}>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Response time notice */}
          <div className="contact-notice" style={{
            padding: "40px 48px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: "80px", right: "80px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
            <h3 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "14px" }}>
              Response Time
            </h3>
            <p style={{ color: "rgba(245,240,232,0.65)", fontSize: "1.05rem", fontFamily: "var(--font-ui)", lineHeight: 1.85, maxWidth: "620px", margin: "0 auto" }}>
              Emails are typically answered within 24–48 hours. For faster responses, DM on Instagram. For exclusive license negotiations, mention your project details upfront.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-hero {
            padding: 120px 20px 70px !important;
          }
          .contact-section {
            padding: 60px 20px !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .contact-card {
            padding: 28px !important;
          }
          .contact-notice {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </main>
  )
}