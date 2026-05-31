import Navbar from "@/components/layout/Navbar"

export default function TermsPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />

      <section style={{ padding: "120px 48px 60px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Legal
          </span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginTop: "10px", marginBottom: "8px" }}>
            Terms of Use
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginBottom: "48px" }}>
            Last updated: January 2025
          </p>

          {[
            {
              title: "1. Acceptance of Terms",
              body: "By accessing and using this website, you agree to be bound by these Terms of Use. If you do not agree, please do not use this site.",
            },
            {
              title: "2. License Purchases",
              body: "All beat purchases grant you a license to use the beat as defined by the license tier purchased (Basic, Premium, or Exclusive). Purchasing a license does not transfer copyright ownership of the beat to you, except in the case of an Exclusive license as defined in the license agreement.",
            },
            {
              title: "3. Non-Exclusive Licenses",
              body: "Basic and Premium licenses are non-exclusive. This means the same beat may be licensed to multiple artists simultaneously. Your license rights are not affected by other artists purchasing the same beat.",
            },
            {
              title: "4. Exclusive Licenses",
              body: "Upon purchase of an Exclusive license, the beat is permanently removed from the marketplace. No new licenses may be sold for that beat. All previously sold Basic and Premium licenses remain valid.",
            },
            {
              title: "5. Credits",
              body: 'All releases using beats purchased from this platform must credit "Prod. by Senior Man KP" in the song title, video description, or credits section.',
            },
            {
              title: "6. Prohibited Uses",
              body: "You may not resell, sublicense, or redistribute beats purchased from this platform. You may not register beats with Content ID systems unless you hold an Exclusive license.",
            },
            {
              title: "7. Refund Policy",
              body: "All sales are final. Due to the digital nature of music files, refunds are not offered once download links have been issued.",
            },
            {
              title: "8. Changes to Terms",
              body: "We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
            },
            {
              title: "9. Contact",
              body: "For questions regarding these terms: kingpsalmyofficial@gmail.com",
            },
          ].map((section) => (
            <div key={section.title} style={{ marginBottom: "36px" }}>
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