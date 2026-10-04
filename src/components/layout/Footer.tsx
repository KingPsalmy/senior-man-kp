"use client"

import Link from "next/link"
import { useState } from "react"

// Set to false if your icon PNGs are already WHITE glyphs.
// true  = icons are dark/black on a light or transparent background (inverts them to white)
const ICONS_ARE_DARK = false

const socials = [
  { href: "https://instagram.com/kingpsalmy_", icon: "/instagram.png", label: "Instagram" },
  { href: "https://x.com/kingpsalmy_", icon: "/twitter_x.png", label: "X" },
  { href: "https://youtube.com/@kingpsalmy", icon: "/youtube.png", label: "YouTube" },
  { href: "https://tiktok.com/@kingpsalmy_", icon: "/tiktok.png", label: "TikTok" },
  { href: "https://discord.gg/uRmK38EgcD", icon: "/discord.png", label: "Discord" },
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

        <div className="ft-top">

          {/* Left: brand + links */}
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
            <p className="ft-card-sub">Custom work, collabs or questions? Drop a note.</p>

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
              <form onSubmit={handleSubmit}>
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
                    id="ft-message" required minLength={10} maxLength={5000} rows={3}
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

        {/* Bottom bar */}
        <div className="ft-bottom">
          <span className="ft-copy">© {new Date().getFullYear()} Senior Man KP. All rights reserved.</span>

          <div className="ft-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label} title={s.label} className="ft-social">
                <img
                  src={s.icon}
                  alt=""
                  className={`ft-social-img${ICONS_ARE_DARK ? " ft-social-invert" : ""}`}
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
          padding: 36px 48px 18px;
        }
        .ft-inner { max-width: 1200px; margin: 0 auto; }

        .ft-top {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 56px;
          align-items: start;
          padding-bottom: 28px;
        }

        .ft-logo { height: 40px; width: auto; object-fit: contain; display: block; margin-bottom: 10px; }
        .ft-tagline {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-style: italic;
          font-size: 0.9rem;
          line-height: 1.5;
          max-width: 280px;
        }

        .ft-links { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 22px; max-width: 420px; }
        .ft-heading {
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.66rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 12px;
        }
        .ft-link-list { display: flex; flex-direction: column; gap: 8px; }
        .ft-link {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-size: 0.86rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ft-link:hover { color: var(--gold); }

        /* Contact card */
        .ft-card {
          position: relative; overflow: hidden;
          background-color: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 20px;
        }
        .ft-card-glow {
          position: absolute; top: 0; left: 20px; right: 20px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent);
        }
        .ft-card-title {
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 1.05rem; font-weight: 700;
          margin-bottom: 4px;
        }
        .ft-card-sub {
          color: rgba(245,240,232,0.5);
          font-family: var(--font-ui);
          font-size: 0.82rem; line-height: 1.4;
          margin-bottom: 14px;
        }

        .ft-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ft-field { margin-bottom: 10px; }
        .ft-label {
          display: block;
          color: rgba(245,240,232,0.5);
          font-family: var(--font-mono);
          font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase;
          margin-bottom: 5px;
        }
        .ft-input {
          width: 100%;
          padding: 10px 12px;
          background-color: rgba(16,16,16,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ft-input::placeholder { color: rgba(245,240,232,0.28); }
        .ft-input:focus {
          border-color: rgba(201,168,76,0.55);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }
        .ft-textarea { resize: vertical; min-height: 70px; line-height: 1.45; }
        .ft-honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

        .ft-btn {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #C9A84C, #F5D98B);
          border: none; border-radius: 8px;
          color: #000;
          font-family: var(--font-ui);
          font-size: 0.76rem; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s ease, box-shadow 0.2s ease;
        }
        .ft-btn:hover:not(:disabled) { box-shadow: 0 0 24px rgba(201,168,76,0.3); }
        .ft-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ft-btn-ghost {
          padding: 9px 18px;
          background: transparent;
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 8px;
          color: var(--gold);
          font-family: var(--font-ui);
          font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
        }

        .ft-error {
          background-color: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.25);
          color: #ff7b7b;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 8px 12px; border-radius: 8px;
          margin-bottom: 10px;
        }

        .ft-success { text-align: center; padding: 10px 0 2px; }
        .ft-success-icon {
          width: 40px; height: 40px; border-radius: 50%;
          margin: 0 auto 10px;
          display: flex; align-items: center; justify-content: center;
          background-color: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.3);
          color: #4ade80; font-size: 1.1rem;
        }
        .ft-success-title {
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 1rem; font-weight: 700;
          margin-bottom: 4px;
        }
        .ft-success-text {
          color: rgba(245,240,232,0.55);
          font-family: var(--font-ui);
          font-size: 0.86rem; line-height: 1.5;
          margin-bottom: 14px;
        }

        /* Bottom bar */
        .ft-bottom {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ft-copy {
          color: rgba(245,240,232,0.4);
          font-family: var(--font-mono);
          font-size: 0.72rem;
        }
        .ft-socials { display: flex; gap: 8px; }
        .ft-social {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background-color: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          isolation: isolate; /* keeps the blend inside this circle only */
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }
        .ft-social:hover {
          border-color: rgba(201,168,76,0.45);
          background-color: rgba(201,168,76,0.1);
          transform: translateY(-2px);
        }
        /* "screen" blend makes pure black vanish, so a solid black icon background disappears into the circle */
        .ft-social-img {
          width: 16px; height: 16px; object-fit: contain; display: block;
          mix-blend-mode: screen;
          opacity: 0.65;
          transition: opacity 0.2s ease;
        }
        .ft-social-invert { filter: grayscale(1) invert(1); }
        .ft-social:hover .ft-social-img { opacity: 1; }

        /* ═════════ MOBILE ═════════ */
        @media (max-width: 900px) {
          .ft-top { grid-template-columns: 1fr; gap: 24px; }
          .ft-links { max-width: none; }
        }
        @media (max-width: 768px) {
          .ft { padding: 28px 18px 16px; }
          .ft-top { padding-bottom: 20px; gap: 20px; }
          .ft-logo { height: 34px; margin-bottom: 8px; }
          .ft-tagline { font-size: 0.84rem; }
          .ft-links { margin-top: 16px; gap: 20px; }
          .ft-heading { margin-bottom: 10px; }
          .ft-link-list { gap: 7px; }
          .ft-link { font-size: 0.82rem; }
          .ft-card { padding: 16px 14px; border-radius: 12px; }
          .ft-card-glow { left: 14px; right: 14px; }
          .ft-row { grid-template-columns: 1fr; gap: 0; }
          .ft-input { font-size: 1rem; padding: 10px 12px; } /* 16px stops iOS zoom on focus */
          .ft-textarea { min-height: 64px; }
          .ft-bottom { flex-direction: column; align-items: center; gap: 10px; padding-top: 14px; text-align: center; }
          .ft-socials { order: -1; }
          .ft-copy { font-size: 0.68rem; }
        }
      `}</style>
    </footer>
  )
}