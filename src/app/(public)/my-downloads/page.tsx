"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Purchase = {
  id: string
  beat_id: string
  license_type: string
  amount_paid: number
  download_token: string
  created_at: string
  payment_status: string
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
}

const LICENSE_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  unlimited: "Unlimited",
  exclusive: "Exclusive",
}

export default function MyDownloadsPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [purchases, setPurchases] = useState<PurchaseWithFiles[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLookup() {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from("purchases")
      .select("*")
      .eq("customer_email", email.toLowerCase().trim())
      .eq("payment_status", "success")
      .order("created_at", { ascending: false })

    if (dbError) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      setError("No purchases found for this email address.")
      setLoading(false)
      return
    }

    // Fetch beat titles
    const beatIds = [...new Set(data.map((p) => p.beat_id))]
    const { data: beats } = await supabase
      .from("beats")
      .select("id, title")
      .in("id", beatIds)

    const beatMap: Record<string, string> = {}
    beats?.forEach((b) => { beatMap[b.id] = b.title })

    setPurchases(
      data.map((p) => ({
        ...p,
        beat_title: beatMap[p.beat_id] ?? "Unknown Beat",
        files: undefined,
        loading: false,
        error: undefined,
      }))
    )

    setSubmitted(true)
    setLoading(false)
  }

  async function handleGetFiles(purchase: PurchaseWithFiles) {
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchase.id ? { ...p, loading: true, error: undefined } : p
      )
    )

    try {
      const res = await fetch(`/api/download?token=${purchase.download_token}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setPurchases((prev) =>
          prev.map((p) =>
            p.id === purchase.id
              ? { ...p, loading: false, error: data.error ?? "Failed to load files" }
              : p
          )
        )
        return
      }

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? { ...p, loading: false, files: data.files }
            : p
        )
      )
    } catch {
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchase.id
            ? { ...p, loading: false, error: "Failed to load files. Please try again." }
            : p
        )
      )
    }
  }

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", paddingBottom: "120px" }}>
      <Navbar />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "120px 24px 0" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            Downloads
          </span>
          <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.03em", marginBottom: "16px" }}>
            My Downloads
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", lineHeight: 1.7 }}>
            Enter the email address you used at checkout to access your purchases.
          </p>
        </div>

        {/* Email lookup */}
        {!submitted && (
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "32px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "13px 16px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" }}>
                <p style={{ color: "#ff6464", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleLookup}
              disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", color: loading ? "var(--text-muted)" : "#000", fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              {loading ? "Looking up..." : "Find My Downloads"}
            </button>
          </div>
        )}

        {/* Purchase list */}
        {submitted && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                {purchases.length} purchase{purchases.length !== 1 ? "s" : ""} found for <span style={{ color: "var(--gold)" }}>{email}</span>
              </p>
              <button
                onClick={() => { setSubmitted(false); setPurchases([]); setEmail(""); setError(null) }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", cursor: "pointer", textDecoration: "underline" }}
              >
                Use different email
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {purchases.map((purchase) => (
                <div key={purchase.id} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", gap: "12px" }}>
                    <div>
                      <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "6px" }}>
                        {purchase.beat_title}
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "var(--gold)", fontSize: "0.62rem", fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: "2px", textTransform: "uppercase" }}>
                          {LICENSE_LABELS[purchase.license_type] ?? purchase.license_type}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                          ₦{purchase.amount_paid?.toLocaleString()}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                          {new Date(purchase.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {!purchase.files && (
                      <button
                        onClick={() => handleGetFiles(purchase)}
                        disabled={purchase.loading}
                        style={{ padding: "10px 20px", background: purchase.loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)", border: "none", borderRadius: "4px", cursor: purchase.loading ? "not-allowed" : "pointer", color: purchase.loading ? "var(--text-muted)" : "#000", fontSize: "0.68rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}
                      >
                        {purchase.loading ? "Loading..." : "Get Files"}
                      </button>
                    )}
                  </div>

                  {purchase.error && (
                    <div style={{ backgroundColor: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "6px", padding: "10px 14px" }}>
                      <p style={{ color: "#ff6464", fontSize: "0.72rem", fontFamily: "var(--font-ui)" }}>{purchase.error}</p>
                    </div>
                  )}

                  {purchase.files && purchase.files.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {purchase.files.map((file) => (
                        <a
                          key={file.label}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "6px", textDecoration: "none" }}
                        >
                          <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                            {file.label}
                          </span>
                          <span style={{ color: "var(--gold)", fontSize: "0.68rem", fontFamily: "var(--font-ui)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Download ↓
                          </span>
                        </a>
                      ))}
                      <p style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-ui)", marginTop: "4px" }}>
                        Download links are active for 1 hour. Refresh this page to generate new links.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", lineHeight: 1.7 }}>
                Can't find your purchase or having issues downloading?{" "}
                <a href="mailto:contact@seniormankp.com" style={{ color: "var(--gold)" }}>
                  contact@seniormankp.com
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}