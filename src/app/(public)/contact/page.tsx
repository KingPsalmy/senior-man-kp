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
                href: "mailto:contact@seniormankp.com",
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
               icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
               </svg>
             ),
  label: "Discord",
  value: "@kingpsalmy_",
  href: "https://discord.com/users/your-id",
  cta: "Join",
}
              
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