"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Navbar from "@/components/layout/Navbar"

import PageIntro from "@/components/ui/PageIntro"
import { Download, ArrowUpRight, Mail, Music2 } from "lucide-react"

type Purchase = {
  id: string
  beat_id: string
  license_type: string
  amount_paid: number
  download_token: string
  created_at: string
  payment_status: string
  beat_is_exclusive_sold?: boolean
}

type DownloadFile = {
  label: string
  url: string
}

type PurchaseWithFiles = Purchase & {
  beat_title?: string
  files?: DownloadFile[]
  loading?: boolean
  error?: string
  upgradeLoading?: boolean
  upgradeMessage?: string
  upgradeError?: string
  upgradeRequested?: boolean
}

const LICENSE_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  unlimited: "Unlimited",
  exclusive: "Exclusive",
}

export default function MyDownloadsPage() {
  const [email, setEmail] = useState("")
  const [reference, setReference] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [purchases, setPurchases] = useState<PurchaseWithFiles[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const busy = useRef(false)
  const autoLoaded = useRef(false)
  const handleLookup = useCallback(async (email: string, reference: string) => {
    if (busy.current) return
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    busy.current = true
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/my-downloads/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          reference: reference.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong Please try again")
        setLoading(false)
        return
      }

      setPurchases(
        data.purchases.map((p: Purchase & { beat_title?: string }) => ({
          ...p,
          files: undefined,
          loading: false,
          error: undefined,
        })),
      )
      setSubmitted(true)
    } catch {
      setError("Something went wrong Please try again")
    } finally {
      busy.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoaded.current) return
    autoLoaded.current = true
    const values = new URLSearchParams(window.location.hash.slice(1))
    const buyer = values.get("email"),
      receipt = values.get("reference")
    if (buyer && receipt) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      )
      // The receipt fragment is client-only and must be consumed after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(buyer)
      setReference(receipt)
      void handleLookup(buyer, receipt)
    }
  }, [handleLookup])

  async function handleGetFiles(purchase: PurchaseWithFiles) {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchase.id ? { ...p, loading: true, error: undefined } : p,
      ),
    )

    try {
      const res = await fetch(`/api/download?token=${purchase.download_token}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setPurchases((prev) =>
          prev.map((p) =>
            p.id === purchase.id
              ? {
                  ...p,
                  loading: false,
                  error: data.error ?? "Failed to load files",
                }
              : p,
          ),
        )
        return
      }

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? { ...p, loading: false, files: data.files }
            : p,
        ),
      )
    } catch {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? {
                ...p,
                loading: false,
                error: "Failed to load files Please try again",
              }
            : p,
        ),
      )
    }
  }

  async function handleRequestUpgrade(purchase: PurchaseWithFiles) {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchase.id
          ? {
              ...p,
              upgradeLoading: true,
              upgradeError: undefined,
              upgradeMessage: undefined,
            }
          : p,
      ),
    )

    try {
      const res = await fetch("/api/request-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_id: purchase.id,
          download_token: purchase.download_token,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setPurchases((prev) =>
          prev.map((p) =>
            p.id === purchase.id
              ? {
                  ...p,
                  upgradeLoading: false,
                  upgradeError:
                    data.error ?? "Something went wrong Please try again",
                }
              : p,
          ),
        )
        return
      }

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? {
                ...p,
                upgradeLoading: false,
                upgradeRequested: true,
                upgradeMessage: data.message,
              }
            : p,
        ),
      )
    } catch {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? {
                ...p,
                upgradeLoading: false,
                upgradeError: "Something went wrong Please try again",
              }
            : p,
        ),
      )
    }
  }

  return (
    <main>
      <Navbar />
      <PageIntro
        eyebrow="Your personal collection"
        title="Back to the music"
        description="Open the link in your receipt email to return to your beats No account or password needed"
      />
      <div className="container section download-layout">
        <aside className="surface-panel lookup-panel">
          <Mail size={28} />
          <h2>Find your purchase</h2>
          <p className="muted">
            Have an older receipt? Use the email and payment reference from that
            order
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleLookup(email, reference)
            }}
            className="stack-form"
          >
            <label>
              Checkout email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Payment reference
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                placeholder="From your receipt"
              />
            </label>
            <button className="button primary" disabled={loading}>
              {loading ? "Finding your beats…" : "Find my beats"}
              <ArrowUpRight size={18} />
            </button>
          </form>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <a className="text-link" href="/contact">
            Need help finding your receipt?
          </a>
        </aside>
        <section aria-live="polite" aria-busy={loading}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ready when you are</span>
              <h2>Your downloads</h2>
            </div>
            {submitted && (
              <span className="muted">
                {purchases.length} beat{purchases.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {!submitted ? (
            <div className="empty-panel">
              <Music2 size={38} />
              <h3>
                {loading
                  ? "Opening your collection…"
                  : "Your next session starts here"}
              </h3>
              <p>
                Find your purchase to access the files included with your
                license
              </p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="empty-panel">
              <h3>No purchases found</h3>
              <p>Check that the email and reference match your receipt</p>
            </div>
          ) : (
            <div className="download-list">
              {purchases.map((p) => (
                <article key={p.id} className="surface-panel purchase-card">
                  <div className="purchase-top">
                    <div>
                      <span className="eyebrow">
                        {LICENSE_LABELS[p.license_type]} license
                      </span>
                      <h3>{p.beat_title || "Your beat"}</h3>
                      <small className="muted">
                        Purchased{" "}
                        {new Date(p.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </small>
                    </div>
                    <Download size={24} />
                  </div>
                  {p.files ? (
                    <div className="file-links">
                      {p.files.map((file) => (
                        <a
                          className="button"
                          key={file.label}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.label}
                          <Download size={16} />
                        </a>
                      ))}
                      <button
                        className="text-link"
                        onClick={() => handleGetFiles(p)}
                        disabled={p.loading}
                      >
                        {p.loading ? "Refreshing…" : "Refresh file links"}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="button primary"
                      onClick={() => handleGetFiles(p)}
                      disabled={p.loading}
                    >
                      {p.loading ? "Preparing files…" : "Get my files"}
                      <Download size={16} />
                    </button>
                  )}
                  {p.error && <p className="notice error">{p.error}</p>}
                  {p.license_type !== "exclusive" &&
                    !p.beat_is_exclusive_sold && (
                      <button
                        className="text-link upgrade-link"
                        onClick={() => handleRequestUpgrade(p)}
                        disabled={p.upgradeLoading || p.upgradeRequested}
                      >
                        {p.upgradeLoading
                          ? "Sending request…"
                          : p.upgradeRequested
                            ? "Upgrade request sent"
                            : "Request a license upgrade"}
                        <ArrowUpRight size={14} />
                      </button>
                    )}
                  {p.upgradeMessage && (
                    <p className="notice">{p.upgradeMessage}</p>
                  )}
                  {p.upgradeError && (
                    <p className="notice error">{p.upgradeError}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
