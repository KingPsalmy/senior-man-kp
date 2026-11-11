"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Mail, CheckCircle2 } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import PageIntro from "@/components/ui/PageIntro"
export default function ContactPage() {
  const [status, setStatus] = useState("idle"),
    [error, setError] = useState("")
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await res.json()
      if (!res.ok) throw Error(data.error || "Please try again")
      setStatus("sent")
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t send your message")
      setStatus("idle")
    }
  }
  return (
    <main>
      <Navbar />
      <PageIntro
        eyebrow="Talk to the producer"
        title="Let’s make something"
        description="Custom production, a license question, or help with your order Start the conversation"
      />
      <div className="container section contact-layout">
        <section>
          <span className="eyebrow">Direct from the studio</span>
          <h2>
            Real music
            <br />
            Real conversations
          </h2>
          <a className="contact-email" href="mailto:contact@seniormankp.com">
            <Mail size={20} />
            contact@seniormankp.com
          </a>
          <p className="muted">
            For order support, include your payment reference so we can find
            your purchase
          </p>
          <div className="social-pills">
            {[
              ["Instagram", "https://instagram.com/kingpsalmy_"],
              ["YouTube", "https://youtube.com/@kingpsalmy"],
              ["X / Twitter", "https://x.com/kingpsalmy_"],
              ["TikTok", "https://tiktok.com/@kingpsalmy_"],
              ["Discord", "https://discord.gg/uRmK38EgcD"],
            ].map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
          <Link className="text-link" href="/faq">
            Find a quick answer in the FAQ
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="surface-panel">
          <h2>Leave a message</h2>
          {status === "sent" ? (
            <div className="empty-panel" role="status">
              <CheckCircle2 size={36} />
              <h3>You’re on our radar</h3>
              <p>Your message has been sent We’ll reply to your email</p>
              <button className="button" onClick={() => setStatus("idle")}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="stack-form" onSubmit={send}>
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="What should we call you?"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Your message
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  placeholder="Tell me what you have in mind…"
                />
              </label>
              <div hidden>
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {error && (
                <p className="notice error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button primary"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send message"}
                <ArrowUpRight size={18} />
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
