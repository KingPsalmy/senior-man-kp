"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

function AdminAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"checking" | "recovery" | "redirecting" | "error">("checking")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function run() {
      const code = searchParams.get("code")
      if (!code) {
        if (!cancelled) setMode("error")
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (cancelled) return

      if (error || !data.session) {
        setMode("error")
        return
      }

      setMode("recovery")
    }

    run()
    return () => { cancelled = true }
  }, [searchParams])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setMode("redirecting")
    router.push("/admin/dashboard")
    router.refresh()
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-dim)",
    borderRadius: "4px", color: "var(--text-primary)",
    fontSize: "0.92rem", fontFamily: "var(--font-ui)",
    outline: "none", boxSizing: "border-box" as const,
  }

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "var(--bg-void)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: "12px", padding: "40px",
      }}>
        {mode === "checking" && (
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.92rem", textAlign: "center" }}>
            Verifying your link...
          </p>
        )}

        {mode === "redirecting" && (
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.92rem", textAlign: "center" }}>
            Password updated — redirecting to dashboard...
          </p>
        )}

        {mode === "error" && (
          <>
            <p style={{ color: "#ff6b6b", fontFamily: "var(--font-ui)", fontSize: "0.92rem", textAlign: "center", marginBottom: "16px" }}>
              This link is invalid or has expired.
            </p>
            <a href="/admin/login" style={{ display: "block", textAlign: "center", color: "var(--gold)", fontFamily: "var(--font-ui)", fontSize: "0.88rem" }}>
              ← Back to login
            </a>
          </>
        )}

        {mode === "recovery" && (
          <form onSubmit={handleSetPassword}>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "20px", textAlign: "center" }}>
              Set New Password
            </h1>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                New Password
              </label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required style={inputStyle} />
            </div>
            {error && (
              <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "4px", padding: "11px 14px", color: "#ff6b6b", fontSize: "0.85rem", fontFamily: "var(--font-ui)", marginBottom: "16px" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={saving} style={{
              width: "100%", padding: "13px",
              background: saving ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "4px",
              color: saving ? "var(--text-muted)" : "#000",
              fontSize: "0.85rem", fontWeight: 800, fontFamily: "var(--font-ui)",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving..." : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function AdminAuthCallback() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: "100vh", backgroundColor: "var(--bg-void)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.92rem" }}>
          Loading...
        </p>
      </main>
    }>
      <AdminAuthCallbackContent />
    </Suspense>
  )
}