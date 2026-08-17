"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

type SoldBeat = {
  id: string
  beat_id: string
  customer_email: string
  customer_name: string | null
  artist_name: string | null
  license_type: string
  amount_paid: number
  paystack_reference: string
  payment_status: string
  created_at: string
  beats: { title: string } | null
}

const LICENSE_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  unlimited: "Unlimited",
  exclusive: "Exclusive",
}

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "♪", label: "Beats", href: "/admin/dashboard/beats" },
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases" },
  { icon: "📀", label: "Sold Beats", href: "/admin/dashboard/sold-beats", active: true },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers" },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings" },
]

function isTest(row: SoldBeat) {
  return row.paystack_reference?.startsWith("TEST_")
}

function expiryLabel(row: SoldBeat) {
  if (row.license_type === "exclusive") return "No expiry (Exclusive)"
  const purchaseDate = new Date(row.created_at)
  const expiry = new Date(purchaseDate)
  expiry.setFullYear(expiry.getFullYear() + 10)
  return expiry.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

export default function SoldBeatsPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [rows, setRows] = useState<SoldBeat[]>([])
  const [filtered, setFiltered] = useState<SoldBeat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [licenseFilter, setLicenseFilter] = useState("all")
  const [showTest, setShowTest] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (!data.session) router.push("/admin/login")
      else {
        setChecking(false)
        fetchRows()
      }
    })
  }, [router])

  async function fetchRows() {
    setLoading(true)
    const { data } = await supabase
      .from("purchases")
      .select("*, beats(title)")
      .eq("payment_status", "success")
      .order("created_at", { ascending: false })
    setRows(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let result = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.customer_email?.toLowerCase().includes(q) ||
          r.customer_name?.toLowerCase().includes(q) ||
          r.artist_name?.toLowerCase().includes(q) ||
          r.beats?.title?.toLowerCase().includes(q)
      )
    }
    if (licenseFilter !== "all") {
      result = result.filter((r) => r.license_type === licenseFilter)
    }
    if (!showTest) {
      result = result.filter((r) => !isTest(r))
    }
    setFiltered(result)
  }, [search, licenseFilter, showTest, rows])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>Loading...</span>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

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

      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px", minWidth: 0 }}>

        <div style={{ marginBottom: "28px" }}>
          <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.9rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Sold Beats</h1>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by beat, customer, artist name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: "240px", padding: "11px 14px",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dim)",
              borderRadius: "4px", color: "var(--text-primary)",
              fontSize: "0.92rem", fontFamily: "var(--font-ui)", outline: "none",
            }}
          />
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            style={{
              padding: "11px 14px", backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-dim)", borderRadius: "4px",
              color: "var(--text-primary)", fontSize: "0.92rem",
              fontFamily: "var(--font-ui)", outline: "none", cursor: "pointer",
            }}
          >
            <option value="all">All Licenses</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="unlimited">Unlimited</option>
            <option value="exclusive">Exclusive</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} />
            Show test/free orders
          </label>
        </div>

        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden", overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.95rem" }}>No sold beats found.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Beat", "Customer", "Artist Name", "Email", "License", "Price", "Purchased", "Expires"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                      {row.beats?.title ?? "Unknown"}
                      {isTest(row) && (
                        <span style={{ marginLeft: "8px", backgroundColor: "rgba(148,148,148,0.15)", color: "#999", fontSize: "0.6rem", fontFamily: "var(--font-mono)", padding: "2px 7px", borderRadius: "2px", textTransform: "uppercase" }}>Test</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>{row.customer_name ?? "—"}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>{row.artist_name ?? "—"}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>{row.customer_email}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "var(--gold)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: "2px", textTransform: "uppercase" }}>
                        {LICENSE_LABELS[row.license_type] ?? row.license_type}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: isTest(row) ? "var(--text-muted)" : "var(--gold)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{Number(row.amount_paid).toLocaleString()}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>{new Date(row.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>{expiryLabel(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textAlign: "right" }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""} shown
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; padding: 20px 16px 80px !important; }
        }
      `}</style>
    </main>
  )
}