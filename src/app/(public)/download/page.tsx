"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

type DownloadData = {
  beat: { title: string; cover_url: string | null; preview_url: string | null; stems_url: string | null }
  license_type: string
  customer_email: string
  download_expires_at: string
}

export default function DownloadPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "error">("loading")
  const [data, setData] = useState<DownloadData | null>(null)

  useEffect(() => {
    if (!token) { setStatus("error"); return }

    fetch(`/api/download?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === "Download link has expired") setStatus("expired")
        else if (d.error) setStatus("error")
        else { setData(d); setStatus("ready") }
      })
      .catch(() => setStatus("error"))
  }, [token])

  const files = data ? [
    data.license_type === "basic" && { label: "Midnight Drive - WAV.mp3", desc: "MP3 File", size: "8.6 MB", key: "preview" },
    data.license_type === "premium" && { label: "Midnight Drive - Stems.zip", desc: "Stems ZIP", size: "320 MB", key: "stems" },
    { label: "License Agreement.pdf", desc: "PDF Document", size: "128 KB", key: "license" },
  ].filter(Boolean) : []

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "120px 24px 80px" }}>

        {status === "loading" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              border: "3px solid var(--border-dim)", borderTop: "3px solid var(--gold)",
              animation: "spin 1s linear infinite", margin: "0 auto 20px",
            }} />
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>Loading your files...</p>
          </div>
        )}

        {status === "expired" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⏰</div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
              Link Expired
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", lineHeight: 1.7, marginBottom: "24px" }}>
              This download link has expired. Please contact us to get a new one.
            </p>
            <a href="mailto:kingpsalmyofficial@gmail.com" style={{
              display: "inline-block", padding: "12px 28px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              borderRadius: "4px", textDecoration: "none",
              color: "#000", fontSize: "0.75rem", fontWeight: 800,
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Contact Support
            </a>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
              Invalid Link
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", lineHeight: 1.7, marginBottom: "24px" }}>
              This download link is invalid or has already been used.
            </p>
            <Link href="/store" style={{
              display: "inline-block", padding: "12px 28px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              borderRadius: "4px", textDecoration: "none",
              color: "#000", fontSize: "0.75rem", fontWeight: 800,
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Back to Store
            </Link>
          </div>
        )}

        {status === "ready" && data && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <span style={{ fontSize: "1.5rem" }}>♡</span>
              <div>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em" }}>
                  Your Downloads
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                  Download your files below. Links expire in 48 hours.
                </p>
              </div>
            </div>

            {/* Files */}
            <div style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px", overflow: "hidden", marginBottom: "20px",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Files
                </h2>
              </div>

              {files.map((file: any) => (
                <div key={file.key} style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                }}>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-ui)", marginBottom: "4px" }}>
                      {data.beat.title} — {file.desc}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
                      Size: {file.size}
                    </div>
                  </div>
                  <button style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "9px 18px",
                    background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                    border: "none", borderRadius: "4px", cursor: "pointer",
                    color: "#000", fontSize: "0.7rem", fontWeight: 700,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                    textTransform: "uppercase", flexShrink: 0,
                  }}>
                    Download ↓
                  </button>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "14px 16px",
              backgroundColor: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "6px", marginBottom: "24px",
            }}>
              <span style={{ color: "var(--gold)", flexShrink: 0 }}>⚠</span>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", lineHeight: 1.6 }}>
                These links are private and should not be shared. They will expire on{" "}
                <strong style={{ color: "var(--text-secondary)" }}>
                  {new Date(data.download_expires_at).toLocaleString()}
                </strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/store" style={{
                flex: 1, padding: "12px", textAlign: "center",
                background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                borderRadius: "4px", textDecoration: "none",
                color: "#000", fontSize: "0.72rem", fontWeight: 800,
                fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Browse More Beats
              </Link>
              <a href={`/licensing`} style={{
                flex: 1, padding: "12px", textAlign: "center",
                backgroundColor: "transparent", border: "1px solid var(--border-dim)",
                borderRadius: "4px", textDecoration: "none",
                color: "var(--text-secondary)", fontSize: "0.72rem", fontWeight: 700,
                fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                View License
              </a>
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
 