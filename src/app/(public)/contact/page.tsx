import Navbar from "@/components/layout/Navbar"

export default function ContactPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      <section style={{ padding: "120px 48px 80px", textAlign: "center", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Get In Touch
        </span>
        <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginTop: "10px", marginBottom: "16px" }}>
          Contact Producer
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.8, maxWidth: "520px", margin: "0 auto", fontFamily: "var(--font-ui)" }}>
          For custom beats, exclusive negotiations, collaborations, or any questions — reach out directly.
        </p>
      </section>

      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {/* Contact cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "48px" }}>

            {[
              {
                icon: "✉️",
                label: "Email",
                value: "kingpsalmyofficial@gmail.com",
                href: "mailto:kingpsalmyofficial@gmail.com",
                cta: "Send Email",
              },
              {
                icon: "◉",
                label: "Instagram",
                value: "@kingpsalmy_",
                href: "https://instagram.com/kingpsalmy_",
                cta: "Follow",
              },
              {
                icon: "▶",
                label: "YouTube",
                value: "@kingpsalmy_",
                href: "https://youtube.com/kingpsalmy_",
                cta: "Subscribe",
              },
              {
                icon: "✕",
                label: "X (Twitter)",
                value: "@kingpsalmy_",
                href: "https://x.com/kingpsalmy_",
                cta: "Follow",
              },
                            {
                icon: "♪",
                label: "Tiktok",
                value: "@kingpsalmy_",
                href: "https://tiktok.com/kingpsalmy_",
                cta: "Follow",
              },
                           {
                icon: " ",
                label: "Discord",
                value: "@kingpsalmy_",
                href: "https://discord.com/kingpsalmy_",
                cta: "Follow",
              },
              
            ].map((contact) => (
              <div key={contact.label} style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px", padding: "28px",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>{contact.icon}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
                  {contact.label}
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-ui)", marginBottom: "16px", wordBreak: "break-all" }}>
                  {contact.value}
                </div>
                <a href={contact.href} target={contact.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" style={{
                  color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)",
                  fontWeight: 600, textDecoration: "none", letterSpacing: "0.05em",
                }}>
                  {contact.cta} →
                </a>
              </div>
            ))}
          </div>

          {/* Response time note */}
          <div style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px", padding: "28px",
            textAlign: "center",
          }}>
            <h3 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "10px" }}>
              Response Time
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", lineHeight: 1.8 }}>
              Emails are typically answered within 24–48 hours.
              For faster responses, DM on Instagram.
              For exclusive license negotiations, mention your project details upfront.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}