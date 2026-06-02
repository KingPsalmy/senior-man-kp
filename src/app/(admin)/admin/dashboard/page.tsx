"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/admin/dashboard", active: true },
  { icon: "♪", label: "Beats", href: "/admin/dashboard/beats", active: false },
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases", active: false },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers", active: false },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings", active: false },
]

type Order = {
  id: string
  email: string
  total: number
  status: string
  items: any[]
  created_at: string
  paystack_reference: string
}

type Stats = {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalBeats: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!data.session) router.push("/admin/login")
      else {
        setChecking(false)
        fetchDashboardData()
      }
    })
  }, [router])

async function fetchDashboardData() {
    setLoadingStats(true)

    const { data } = await supabase
      .from("orders")
      .select("id, email, total, status, items, created_at, paystack_reference")
      .eq("status", "paid")
      .order("created_at", { ascending: false })

    const orders = (data ?? []) as Order[]

    const totalRevenue = orders.reduce((sum: number, o: Order) => sum + Number(o.total), 0)
    const totalOrders = orders.length
    const uniqueEmails = new Set(orders.map((o: Order) => o.email))
    const totalCustomers = uniqueEmails.size

    const { count: totalBeats } = await supabase
      .from("beats")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)

    setStats({ totalRevenue, totalOrders, totalCustomers, totalBeats: totalBeats ?? 0 })
    setRecentOrders(orders.slice(0, 10))
    setLoadingStats(false)
  }

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
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 39 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "var(--bg-deep)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
        transform: sidebarOpen ? "translateX(0)" : undefined,
      }}
        className="admin-sidebar"
      >
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>Senior Man</div>
          <div style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1 }}>KP</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 24px", textDecoration: "none",
              color: item.active ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 500,
              backgroundColor: item.active ? "rgba(201,168,76,0.06)" : "transparent",
              borderRight: item.active ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}
          >
            <span>→</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px", minWidth: 0 }}>

        {/* Mobile header */}
        <div className="admin-mobile-header" style={{
          display: "none", alignItems: "center", justifyContent: "space-between",
          marginBottom: "24px",
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}
          >
            ☰
          </button>
          <span style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1rem" }}>Dashboard</span>
          <Link href="/store" style={{ fontSize: "0.65rem", color: "var(--gold)", fontFamily: "var(--font-ui)", textDecoration: "none" }}>Store →</Link>
        </div>

        {/* Desktop header */}
        <div className="admin-desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
            Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>
              {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
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

        {/* Stats */}
        <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {loadingStats ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "20px", height: "100px", opacity: 0.5 }} />
            ))
          ) : (
            [
              { label: "Total Revenue", value: `₦${stats?.totalRevenue.toLocaleString() ?? 0}` },
              { label: "Total Orders", value: String(stats?.totalOrders ?? 0) },
              { label: "Unique Customers", value: String(stats?.totalCustomers ?? 0) },
              { label: "Published Beats", value: String(stats?.totalBeats ?? 0) },
            ].map((stat) => (
              <div key={stat.label} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {stat.label}
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
              Recent Orders
            </h2>
            <Link href="/admin/dashboard/purchases" style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {loadingStats ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
              Loading orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>No orders yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="admin-orders-desktop">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {recentOrders.map((order, i) => (
                  <div key={order.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
                    padding: "14px 24px", alignItems: "center",
                    borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)" }}>{order.items?.length ?? 0} beat{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{Number(order.total).toLocaleString()}</span>
                    <span style={{ display: "inline-block", backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", fontSize: "0.6rem", fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: "2px", width: "fit-content", textTransform: "uppercase" }}>{order.status}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="admin-orders-mobile" style={{ display: "none", flexDirection: "column" }}>
                {recentOrders.map((order, i) => (
                  <div key={order.id} style={{
                    padding: "16px 20px",
                    borderBottom: i < recentOrders.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{Number(order.total).toLocaleString()}</span>
                      <span style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", fontSize: "0.58rem", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" }}>{order.status}</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "var(--font-ui)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{order.items?.length ?? 0} beat{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", textAlign: "right" }}>
            <Link href="/admin/dashboard/purchases" style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
              View all orders →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%) !important;
            transition: transform 0.25s ease;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 20px 16px !important;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-desktop-header {
            display: none !important;
          }
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .admin-orders-desktop {
            display: none !important;
          }
          .admin-orders-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </main>
  )
}