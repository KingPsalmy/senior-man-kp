import Navbar from "@/components/layout/Navbar"

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      <section style={{ padding: "120px 48px 60px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Legal
          </span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginTop: "10px", marginBottom: "8px" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginBottom: "48px" }}>
            Last updated: January 2025
          </p>

          {[
            {
              title: "Information We Collect",
              body: "We collect your email address at checkout to deliver your purchased files and license agreements. We also generate an anonymous guest ID stored in your browser to persist your cart and favorites across sessions. We do not collect passwords, payment card numbers, or any sensitive financial information — payments are processed securely by Paystack.",
            },
            {
              title: "How We Use Your Information",
              body: "Your email is used to deliver purchase receipts, download links, and license agreements. We may also use it to notify you when a beat you favorited becomes unavailable or has been sold exclusively. We do not sell, rent, or share your personal information with third parties for marketing purposes.",
            },
            {
              title: "Cookies & Local Storage",
              body: "We use browser localStorage and cookies to store your guest ID, which powers your cart and favorites. No tracking cookies or third-party advertising cookies are used.",
            },
            {
              title: "Payment Processing",
              body: "All payments are processed by Paystack. We never store your card details. Paystack's privacy policy applies to all payment transactions.",
            },
            {
              title: "Data Retention",
              body: "Order records are retained for accounting and legal compliance. You may request deletion of your personal data by emailing kingpsalmyofficial@gmail.com.",
            },
            {
              title: "Contact",
              body: "For privacy-related questions, contact: kingpsalmyofficial@gmail.com",
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: "40px" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
                {section.title}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", lineHeight: 1.9 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}