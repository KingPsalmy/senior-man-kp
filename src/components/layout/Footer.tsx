"use client"

import Link from "next/link"
import { useState } from "react"

const socials = [
  { href: "https://instagram.com/kingpsalmy_", icon: "/instagram.png", label: "Instagram" },
  { href: "https://x.com/kingpsalmy_", icon: "/twitter_x.png", label: "X" },
  { href: "https://youtube.com/@kingpsalmy_", icon: "/youtube.png", label: "YouTube" },
  { href: "https://tiktok.com/@kingpsalmy_", icon: "/tiktok.png", label: "TikTok" },
]

const navLinks = [
  { label: "Home", href: "/" },
  { label: "More Beats", href: "/store" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
]

const legalLinks: { label: string; href: string; external: boolean }[] = [
  { label: "Licensing Info", href: "/licensing", external: false },
  { label: "Terms of Use", href: "/terms", external: false },
  { label: "Privacy Policy", href: "/privacy", external: false },
  { label: "YouTube Terms of Service", href: "https://www.youtube.com/t/terms", external: true },
]

type Status = "idle" | "sending" | "sent" | "error"

export default function Footer() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("") // honeypot: real users never see or fill this
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "sending") return

    setStatus("sending")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.")

      setStatus("sent")
      setName("")
      setEmail("")
      setMessage("")
    } catch (err: any) {
      setStatus("error")
      setErrorMsg(err.message || "Something went wrong. Please try again.")
    }
  }

  return (
    <footer className="ft">
      <div className="ft-inner">

        {/* ── Top: brand + links (left), contact form (right) ── */}
        <div className="ft-top">

          {/* Left */}
          <div>
            <img src="/logo-white.png" alt="Senior Man KP" className="ft-logo" />
            <p className="ft-tagline">Find the sound that sets you apart</p>

            <div className="ft-links">
              <div>
                <h4 className="ft-heading">Navigation</h4>
                <div className="ft-link-list">
                  {navLinks.map((l) => (
                    <Link key={l.label} href={l.href} className="ft-link">{l.label}</Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="ft-heading">Legal</h4>
                <div className="ft-link-list">
                  {legalLinks.map((l) =>
                    l.external ? (
                      <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="ft-link">{l.label}</a>
                    ) : (
                      <Link key={l.label} href={l.href} className="ft-link">{l.label}</Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div className="ft-card">
            <div className="ft-card-glow" />
            <h4 className="ft-card-title">Send KP a message</h4>
            <p className="ft-card-sub">Custom work, collabs or questions? Drop a note and you'll get a reply by email.</p>

            {status === "sent" ? (
              <div className="ft-success">
                <div className="ft-success-icon">✓</div>
                <div className="ft-success-title">Message sent</div>
                <p className="ft-success-text">Thanks for reaching out. KP will get back to you soon.</p>
                <button type="button" className="ft-btn-ghost" onClick={() => setStatus("idle")}>
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate={false}>
                <div className="ft-row">
                  <div className="ft-field">
                    <label htmlFor="ft-name" className="ft-label">Name</label>
                    <input
                      id="ft-name" type="text" required maxLength={100}
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name" className="ft-input"
                    />
                  </div>
                  <div className="ft-field">
                    <label htmlFor="ft-email" className="ft-label">Email</label>
                    <input
                      id="ft-email" type="email" required maxLength={200}
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className="ft-input"
                    />
                  </div>
                </div>

                <div className="ft-field">
                  <label htmlFor="ft-message" className="ft-label">Message</label>
                  <textarea
                    id="ft-message" required minLength={10} maxLength={5000} rows={4}
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?" className="ft-input ft-textarea"
                  />
                </div>

                {/* Honeypot: hidden from people, bots tend to fill it */}
                <input
                  type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={website} onChange={(e) => setWebsite(e.target.value)}
                  className="ft-honeypot"
                />

                {status === "error" && <div className="ft-error">{errorMsg}</div>}

                <button type="submit" disabled={status === "sending"} className="ft-btn">
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom bar: copyright + social icons ── */}
        <div className="ft-bottom">
          <span className="ft-copy">© {new Date().getFullYear()} Senior Man KP. All rights reserved.</span>

          <div className="ft-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label} title={s.label} className="ft-social">
                <span
                  className="ft-social-icon"
                  style={{ WebkitMaskImage: `url(${s.icon})`, maskImage: `url(${s.icon})` }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ft {
          background-color: var(--bg-deep);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 56px 48px 26px;
        }
        .ft-inner { max-width: 1200px; margin: 0 auto; }

        .ft-top {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 72px;
          align-items: start;
          padding-bottom: 44px;
        }

        .ft-logo { height: 50px; width: auto; object-fit: contain; display: block; margin-bottom: 16px; }
        .ft-tagline {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-style: italic;
          font-size: 0.98rem;
          line-height: 1.6;
          max-width: 280px;
        }

        .ft-links { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 34px; max-width: 460px; }
        .ft-heading {
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .ft-link-list { display: flex; flex-direction: column; gap: 11px; }
        .ft-link {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-size: 0.92rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ft-link:hover { color: var(--gold); }

        /* Contact card */
        .ft-card {
          position: relative; overflow: hidden;
          background-color: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px;
        }
        .ft-card-glow {
          position: absolute; top: 0; left: 28px; right: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent);
        }
        .ft-card-title {
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 1.2rem; font-weight: 700;
          margin-bottom: 6px;
        }
        .ft-card-sub {
          color: rgba(245,240,232,0.5);
          font-family: var(--font-ui);
          font-size: 0.88rem; line-height: 1.55;
          margin-bottom: 20px;
        }

        .ft-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ft-field { margin-bottom: 12px; }
        .ft-label {
          display: block;
          color: rgba(245,240,232,0.5);
          font-family: var(--font-mono);
          font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .ft-input {
          width: 100%;
          padding: 12px 14px;
          background-color: rgba(16,16,16,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ft-input::placeholder { color: rgba(245,240,232,0.28); }
        .ft-input:focus {
          border-color: rgba(201,168,76,0.55);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }
        .ft-textarea { resize: vertical; min-height: 96px; line-height: 1.5; }
        .ft-honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

        .ft-btn {
          width: 100%;
          margin-top: 4px;
          padding: 13px;
          background: linear-gradient(135deg, #C9A84C, #F5D98B);
          border: none; border-radius: 8px;
          color: #000;
          font-family: var(--font-ui);
          font-size: 0.8rem; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s ease, box-shadow 0.2s ease;
        }
        .ft-btn:hover:not(:disabled) { box-shadow: 0 0 24px rgba(201,168,76,0.3); }
        .ft-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ft-btn-ghost {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 8px;
          color: var(--gold);
          font-family: var(--font-ui);
          font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
        }

        .ft-error {
          background-color: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.25);
          color: #ff7b7b;
          font-family: var(--font-ui);
          font-size: 0.82rem;
          padding: 10px 14px; border-radius: 8px;
          margin-bottom: 12px;
        }

        .ft-success { text-align: center; padding: 18px 0 6px; }
        .ft-success-icon {
          width: 46px; height: 46px; border-radius: 50%;
          margin: 0 auto 14px;
          display: flex; align-items: center; justify-content: center;
          background-color: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80; font-size: 1.2rem;
        }
        .ft-success-title {
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 1.05rem; font-weight: 700;
          margin-bottom: 6px;
        }
        .ft-success-text {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-size: 0.9rem; line-height: 1.55;
          margin-bottom: 18px;
        }

        /* Bottom bar */
        .ft-bottom {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ft-copy {
          color: rgba(245,240,232,0.4);
          font-family: var(--font-mono);
          font-size: 0.78rem;
        }
        .ft-socials { display: flex; gap: 10px; }
        .ft-social {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background-color: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(245,240,232,0.6);
          transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }
        .ft-social:hover {
          color: var(--gold);
          border-color: rgba(201,168,76,0.45);
          background-color: rgba(201,168,76,0.08);
          transform: translateY(-2px);
        }
        /* The PNG becomes a stencil; background-color:currentColor paints it */
        .ft-social-icon {
          display: block;
          width: 17px; height: 17px;
          background-color: currentColor;
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-position: center; mask-position: center;
          -webkit-mask-size: contain; mask-size: contain;
        }

        /* ═════════ MOBILE ═════════ */
        @media (max-width: 900px) {
          .ft-top { grid-template-columns: 1fr; gap: 36px; }
          .ft-links { max-width: none; }
        }
        @media (max-width: 768px) {
          .ft { padding: 40px 20px 22px; }
          .ft-logo { height: 44px; }
          .ft-links { margin-top: 26px; gap: 24px; }
          .ft-card { padding: 22px 18px; border-radius: 14px; }
          .ft-card-glow { left: 18px; right: 18px; }
          .ft-row { grid-template-columns: 1fr; gap: 0; }
          .ft-input { font-size: 1rem; } /* 16px stops iOS zooming in on focus */
          .ft-bottom { flex-direction: column; align-items: center; gap: 16px; text-align: center; }
          .ft-socials { order: -1; }
        }
      `}</style>
    </footer>
  )
}