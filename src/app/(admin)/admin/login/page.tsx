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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/admin/dashboard")
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-void)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: "420px",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        padding: "40px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/logo-white.png"
            alt="Senior Man KP"
            style={{ height: "60px", width: "auto", objectFit: "contain", marginBottom: "16px" }}
          />
          <h1 style={{
            color: "var(--text-primary)", fontSize: "1.3rem",
            fontWeight: 800, fontFamily: "var(--font-ui)",
            marginBottom: "6px",
          }}>
            Admin Login
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)" }}>
            Access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", color: "var(--text-muted)",
              fontSize: "0.65rem", fontFamily: "var(--font-mono)",
              letterSpacing: "0.15em", textTransform: "uppercase",
              marginBottom: "8px",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@seniormanKP.com"
              required
              style={{
                width: "100%", padding: "12px 16px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "4px", color: "var(--text-primary)",
                fontSize: "0.82rem", fontFamily: "var(--font-ui)",
                outline: "none", transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block", color: "var(--text-muted)",
              fontSize: "0.65rem", fontFamily: "var(--font-mono)",
              letterSpacing: "0.15em", textTransform: "uppercase",
              marginBottom: "8px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: "100%", padding: "12px 16px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "4px", color: "var(--text-primary)",
                fontSize: "0.82rem", fontFamily: "var(--font-ui)",
                outline: "none", transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: "rgba(255,50,50,0.08)",
              border: "1px solid rgba(255,50,50,0.2)",
              borderRadius: "4px", padding: "10px 14px",
              color: "#ff6b6b", fontSize: "0.75rem",
              fontFamily: "var(--font-ui)", marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              border: "none", borderRadius: "4px",
              color: "#000", fontSize: "0.75rem",
              fontWeight: 800, fontFamily: "var(--font-ui)",
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot password */}
          <div style={{ textAlign: "right", marginTop: "12px" }}>
            <span style={{
              color: "var(--gold)", fontSize: "0.72rem",
              fontFamily: "var(--font-ui)", cursor: "pointer",
            }}>
              Forgot password?
            </span>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "32px", paddingTop: "20px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
          color: "var(--text-muted)", fontSize: "0.65rem",
          fontFamily: "var(--font-mono)",
        }}>
          © 2024 Senior Man KP. All rights reserved.
        </div>

      </div>
    </main>
  )
}