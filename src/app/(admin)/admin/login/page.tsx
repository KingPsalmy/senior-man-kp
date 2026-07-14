"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !data.session) {
        setError(authError?.message || "Invalid email or password.")
        return
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then click Forgot password.")
      return
    }
    setForgotLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback`,
    })
    setForgotLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setForgotSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 18px",
    backgroundColor: "rgba(16,16,16,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", color: "var(--text-primary)",
    fontSize: "1rem", fontFamily: "var(--font-ui)",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  }

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "var(--bg-void)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        backgroundColor: "var(--bg-card)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px", padding: "48px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Gold top line */}
        <div style={{ position: "absolute", top: 0, left: "40px", right: "40px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)" }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
            Senior Man
          </div>
          <div style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "2.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1 }}>
            KP
          </div>
          <div style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.78rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "8px" }}>
            Admin Portal
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(255,50,50,0.08)",
            border: "1px solid rgba(255,50,50,0.2)",
            borderRadius: "8px", padding: "12px 16px",
            marginBottom: "24px", color: "#ff6b6b",
            fontSize: "0.88rem", fontFamily: "var(--font-ui)",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "rgba(245,240,232,0.5)", fontSize: "0.7rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(245,240,232,0.5)", fontSize: "0.7rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "15px",
              background: loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              color: loading ? "var(--text-muted)" : "#000",
              fontSize: "0.88rem", fontWeight: 800,
              fontFamily: "var(--font-ui)", letterSpacing: "0.14em",
              textTransform: "uppercase", marginTop: "8px",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ textAlign: "center", marginTop: "4px" }}>
            {forgotSent ? (
              <span style={{ color: "#4ade80", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
                Reset link sent — check your email
              </span>
            ) : (
              <span
                onClick={handleForgotPassword}
                style={{
                  color: "var(--gold)", fontSize: "0.78rem",
                  fontFamily: "var(--font-ui)", cursor: forgotLoading ? "default" : "pointer",
                  opacity: forgotLoading ? 0.6 : 1,
                }}
              >
                {forgotLoading ? "Sending..." : "Forgot password?"}
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}