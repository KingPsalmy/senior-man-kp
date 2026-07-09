"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "♪", label: "Beats", href: "/admin/dashboard/beats" },
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases" },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers" },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings", active: true },
]

export default function SettingsPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [adminEmail, setAdminEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!data.session) router.push("/admin/login")
      else {
        setChecking(false)
        setAdminEmail(data.session.user.email ?? "")
      }
    })
  }, [router])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    setPasswordLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>Loading...</span>
    </div>
  )

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-dim)",
    borderRadius: "4px", color: "var(--text-primary)",
    fontSize: "0.92rem", fontFamily: "var(--font-ui)",
    outline: "none", boxSizing: "border-box" as const,
  }

  const labelStyle = {
    display: "block", color: "var(--text-muted)",
    fontSize: "0.72rem", fontFamily: "var(--font-mono)",
    letterSpacing: "0.12em", textTransform: "uppercase" as const,
    marginBottom: "7px",
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {/* Sidebar (desktop: left rail — mobile: bottom tab bar, styled via globals.css) */}
      <aside className="admin-sidebar" style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "var(--bg-deep)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
      }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>Senior Man</div>
          <div style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1 }}>KP</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 24px", textDecoration: "none",
              color: (item as any).active ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "0.9rem", fontFamily: "var(--font-ui)", fontWeight: 500,
              backgroundColor: (item as any).active ? "rgba(201,168,76,0.06)" : "transparent",
              borderRight: (item as any).active ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 24px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <span>→</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px", minWidth: 0 }}>

        {/* Mobile header */}
        <div className="admin-mobile-header" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <span className="admin-mobile-title" style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1.3rem" }}>Settings</span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Desktop header */}
        <div className="admin-desktop-header" style={{ marginBottom: "32px" }}>
          <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.9rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Settings</h1>
        </div>

        <div className="admin-settings-wrap" style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Account Info */}
          <div className="admin-settings-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "28px" }}>
            <h2 className="admin-settings-title" style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>
              Account
            </h2>
            <div>
              <label className="admin-settings-label" style={labelStyle}>Admin Email</label>
              <div className="admin-settings-static" style={{
                padding: "12px 14px",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                borderRadius: "4px", color: "var(--text-muted)",
                fontSize: "0.92rem", fontFamily: "var(--font-ui)",
              }}>
                {adminEmail}
              </div>
              <p className="admin-settings-hint" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", marginTop: "8px" }}>
                This is your login email. Contact Supabase to change it.
              </p>
            </div>
          </div>

          {/* Change Password */}
          <div className="admin-settings-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "28px" }}>
            <h2 className="admin-settings-title" style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="admin-settings-label" style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="admin-settings-input"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="admin-settings-label" style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="admin-settings-input"
                  style={inputStyle}
                />
              </div>

              {passwordError && (
                <div className="admin-settings-alert" style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "4px", padding: "11px 14px", color: "#ff6b6b", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="admin-settings-alert" style={{ backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "4px", padding: "11px 14px", color: "#4ade80", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>
                  Password updated successfully.
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="admin-settings-submit"
                style={{
                  padding: "13px", background: passwordLoading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", borderRadius: "4px",
                  color: passwordLoading ? "var(--text-muted)" : "#000",
                  fontSize: "0.85rem", fontWeight: 800,
                  fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: passwordLoading ? "not-allowed" : "pointer",
                }}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Store Info */}
          <div className="admin-settings-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "28px" }}>
            <h2 className="admin-settings-title" style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>
              Store Info
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Store Name", value: "Senior Man KP — Official Beat Store" },
                { label: "Contact Email", value: "contact@seniormankp.com" },
                { label: "Support Email", value: "contact@seniormankp.com" },
              ].map((row) => (
                <div key={row.label}>
                  <label className="admin-settings-label" style={labelStyle}>{row.label}</label>
                  <div className="admin-settings-static" style={{ padding: "12px 14px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "0.92rem", fontFamily: "var(--font-ui)" }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="admin-settings-card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: "8px", padding: "28px" }}>
            <h2 className="admin-settings-title" style={{ color: "#ff6b6b", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>
              Danger Zone
            </h2>
            <p className="admin-settings-hint" style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", marginBottom: "16px", lineHeight: 1.6 }}>
              Sign out of all devices and end your current session.
            </p>
            <button
              onClick={handleLogout}
              className="admin-settings-danger-btn"
              style={{
                padding: "11px 22px",
                backgroundColor: "rgba(255,100,100,0.08)",
                border: "1px solid rgba(255,100,100,0.3)",
                borderRadius: "4px", color: "#ff6b6b",
                fontSize: "0.82rem", fontWeight: 700,
                fontFamily: "var(--font-ui)", cursor: "pointer",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; padding: 20px 16px 80px !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-desktop-header { display: none !important; }

          .admin-mobile-title {
            font-size: 1.3rem !important;
          }
          .admin-settings-wrap {
            max-width: 100% !important;
            gap: 16px !important;
          }
          .admin-settings-card {
            padding: 20px !important;
          }
          .admin-settings-title {
            font-size: 1.05rem !important;
          }
          .admin-settings-label {
            font-size: 0.78rem !important;
          }
          .admin-settings-static {
            font-size: 1rem !important;
            padding: 14px !important;
          }
          .admin-settings-hint {
            font-size: 0.85rem !important;
          }
          .admin-settings-input {
            font-size: 1rem !important;
            padding: 14px !important;
          }
          .admin-settings-alert {
            font-size: 0.9rem !important;
          }
          .admin-settings-submit {
            font-size: 0.88rem !important;
            padding: 15px !important;
          }
          .admin-settings-danger-btn {
            font-size: 0.85rem !important;
            padding: 13px 24px !important;
          }
        }
      `}</style>
    </main>
  )
}