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
    a: "Yes. Basic: Buy 2, get 1 free. Premium: Buy 2, get 1 Basic free. Unlimited: Buy 2, get 1 Premium free. Exclusive: Buy 1, get 1 Exclusive free.",
  },
]

export default function FAQPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      <section style={{
        padding: "120px 48px 80px",
        textAlign: "center",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <span style={{
          color: "var(--gold)", fontSize: "0.65rem",
          fontFamily: "var(--font-mono)", letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>
          FAQ
        </span>
        <h1 style={{
          color: "var(--text-primary)",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800, fontFamily: "var(--font-ui)",
          letterSpacing: "-0.03em", marginTop: "10px", marginBottom: "16px",
        }}>
          Frequently Asked Questions
        </h1>
        <p style={{
          color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.8,
          maxWidth: "520px", margin: "0 auto", fontFamily: "var(--font-ui)",
        }}>
          Everything you need to know about licensing, payments, and working with Senior Man KP.
        </p>
      </section>

      <section style={{ padding: "80px 48px" }}>
        <div style={{
          maxWidth: "760px", margin: "0 auto",
          display: "flex", flexDirection: "column", gap: "2px",
        }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: i === 0 ? "8px 8px 0 0" : i === faqs.length - 1 ? "0 0 8px 8px" : "0",
              padding: "24px 28px",
            }}>
              <h3 style={{
                color: "var(--text-primary)", fontSize: "0.9rem",
                fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "10px",
              }}>
                {faq.q}
              </h3>
              <p style={{
                color: "var(--text-muted)", fontSize: "0.82rem",
                fontFamily: "var(--font-ui)", lineHeight: 1.8,
              }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: "60px 48px",
        backgroundColor: "var(--bg-deep)",
        borderTop: "1px solid var(--border-subtle)",
        textAlign: "center",
      }}>
        <p style={{
          color: "var(--text-muted)", fontSize: "0.88rem",
          fontFamily: "var(--font-ui)", marginBottom: "20px",
        }}>
          Still have questions?
        </p>
        <a
          href="mailto:contact@seniormankp.com"
          style={{
            padding: "13px 28px",
            background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
            color: "#000", textDecoration: "none", borderRadius: "4px",
            fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}
          >
          Contact Producer
        </a>
      </section>
    </main>
  )
}