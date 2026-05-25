"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/admin/dashboard", active: true },
  { icon: "♪", label: "Beats", href: "/admin/dashboard/beats", active: false },
  { icon: "≡", label: "Licenses", href: "/admin/dashboard/licenses", active: false },
  { icon: "↑", label: "Uploads", href: "/admin/dashboard/uploads", active: false },
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases", active: false },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers", active: false },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings", active: false },
  { icon: "→", label: "Logout", href: "#", active: false },
]

const stats = [
  { label: "Total Sales", value: "₦2,450,000", change: "+234%", positive: true },
  { label: "Total Orders", value: "48", change: "+18.2%", positive: true },
  { label: "Total Customers", value: "36", change: "+12.4%", positive: true },
  { label: "Conversion Rate", value: "3.6%", change: "+6.3%", positive: true },
]

const recentPurchases = [
  { customer: "olami@gmail.com", beat: "Midnight Drive", license: "Premium", amount: "₦30,000", date: "May 21, 10:45 AM" },
  { customer: "theo@proton.com", beat: "No Limit", license: "Basic", amount: "₦10,000", date: "May 21, 9:15 AM" },
  { customer: "beatbytes@gmail.com", beat: "Paradise", license: "Premium", amount: "₦30,000", date: "May 20, 11:28 PM" },
  { customer: "iam_jolly@cloud.com", beat: "Timeless", license: "Exclusive", amount: "₦250,000", date: "May 20, 8:15 PM" },
  { customer: "officejay@gmail.com", beat: "Higher", license: "Basic", amount: "₦10,000", date: "May 20, 4:05 PM" },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login")
      else setChecking(false)
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading...</span>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", flexDirection: "column" }}>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "var(--bg-deep)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
            Senior Man
          </div>
          <div style={{
            background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1,
          }}>
            KP
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            item.label === "Logout" ? (
              <button
                key={item.label}
                onClick={handleLogout}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 24px", background: "none", border: "none",
                  color: "var(--text-muted)", fontSize: "0.78rem",
                  fontFamily: "var(--font-ui)", fontWeight: 500,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 24px", textDecoration: "none",
                  color: item.active ? "var(--gold)" : "var(--text-secondary)",
                  fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 500,
                  backgroundColor: item.active ? "rgba(201,168,76,0.06)" : "transparent",
                  borderRight: item.active ? "2px solid var(--gold)" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
            Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
              May 14 – May 21, 2024
            </span>
            <Link href="/store" style={{
              padding: "8px 16px", fontSize: "0.68rem", fontWeight: 700,
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              borderRadius: "3px", textDecoration: "none", color: "#000",
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              View Store
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px", padding: "20px",
            }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                {stat.label}
              </div>
              <div style={{ color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                {stat.value}
              </div>
              <div style={{ color: stat.positive ? "#4ade80" : "#f87171", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Purchases */}
        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px", overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
              Recent Purchases
            </h2>
            <span style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
              View all purchases →
            </span>
          </div>

          {/* Desktop Table */}
          <div className="admin-purchases-table">
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
              padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)",
            }}>
              {["Customer", "Beat", "License", "Amount", "Date"].map((h) => (
                <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  {h}
                </span>
              ))}
            </div>

            {recentPurchases.map((p, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
                padding: "14px 24px",
                borderBottom: i < recentPurchases.length - 1 ? "1px solid var(--border-subtle)" : "none",
                alignItems: "center",
              }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>{p.customer}</span>
                <span style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>{p.beat}</span>
                <span style={{
                  display: "inline-block",
                  backgroundColor: p.license === "Exclusive" ? "rgba(201,168,76,0.12)" : "var(--bg-elevated)",
                  color: p.license === "Exclusive" ? "var(--gold)" : "var(--text-secondary)",
                  fontSize: "0.62rem", fontFamily: "var(--font-mono)",
                  padding: "3px 8px", borderRadius: "2px", width: "fit-content",
                }}>{p.license}</span>
                <span style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>{p.amount}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>{p.date}</span>
              </div>
            ))}
          </div>

          {/* Mobile Purchases */}
          <div className="admin-purchases-mobile" style={{ display: "none", flexDirection: "column" }}>
            {recentPurchases.map((p, i) => (
              <div key={i} style={{
                padding: "14px 20px",
                borderBottom: i < recentPurchases.length - 1 ? "1px solid var(--border-subtle)" : "none",
                display: "flex", flexDirection: "column", gap: "6px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{p.beat}</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>{p.amount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-ui)" }}>{p.customer}</span>
                  <span style={{
                    backgroundColor: p.license === "Exclusive" ? "rgba(201,168,76,0.12)" : "var(--bg-elevated)",
                    color: p.license === "Exclusive" ? "var(--gold)" : "var(--text-secondary)",
                    fontSize: "0.58rem", fontFamily: "var(--font-mono)",
                    padding: "2px 8px", borderRadius: "2px",
                  }}>{p.license}</span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>{p.date}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", textAlign: "right" }}>
            <span style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
              View all purchases →
            </span>
          </div>
        </div>

      </div>
    </main>
  )
}