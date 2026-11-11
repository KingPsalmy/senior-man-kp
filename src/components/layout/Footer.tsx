"use client"
import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"
const socials = [
  { href: "https://instagram.com/kingpsalmy_", label: "Instagram" },
  { href: "https://youtube.com/@kingpsalmy", label: "YouTube" },
  { href: "https://x.com/kingpsalmy_", label: "X" },
  { href: "https://tiktok.com/@kingpsalmy_", label: "TikTok" },
  { href: "https://discord.gg/uRmK38EgcD", label: "Discord" },
]
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-callout">
          <div>
            <span className="eyebrow">
              From the studio to your next release
            </span>
            <h2>
              Make something
              <br />
              <em>they’ll remember</em>
            </h2>
          </div>
          <Link href="/beatstore/beats" className="button primary">
            Find your sound <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo-white.png" alt="Senior Man KP" />
            <p>
              Original instrumentals with real feeling
              <br />
              Produced by Senior Man KP
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/beatstore/beats">Beat catalog</Link>
            <Link href="/licensing">License options</Link>
            <Link href="/favorites">Saved beats</Link>
          </div>
          <div>
            <h3>We’re here to help</h3>
            <Link href="/my-downloads">My downloads</Link>
            <Link href="/faq">Common questions</Link>
            <Link href="/contact">
              Contact <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="footer-contact">
            <h3>Something more personal?</h3>
            <p>
              Let’s talk custom beats
              <br />
              and collaborations
            </p>
            <a href="mailto:contact@seniormankp.com">
              Get in touch <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="footer-socials">
          {socials.map((s) => (
            <a
              href={s.href}
              key={s.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.label}
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
        <div className="footer-bottom">
          <span>
          © {new Date().getFullYear()} Senior Man KP
          </span>
          <div>
            <Link href="/terms">Terms of use</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <span>Made for your next record</span>
        </div>
      </div>
    </footer>
  )
}
