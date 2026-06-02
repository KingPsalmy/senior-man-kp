"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

type Order = {
  id: string
  email: string
  guest_id: string
  paystack_reference: string
  status: string
  subtotal: number
  discount: number
  total: number
  items: any[]
  created_at: string
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
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases", active: true },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers" },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings" },
]

export default function PurchasesPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login")
      else {
        setChecking(false)
        fetchOrders()
      }
    })
  }, [router])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
    setOrders(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let result = orders
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.email?.toLowerCase().includes(q) ||
          o.paystack_reference?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, orders])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading...</span>
    </div>
  )

  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 39 }} />
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "var(--bg-deep)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
        padding: "24px 0",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
      }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>Senior Man</div>
          <div style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1 }}>KP</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 24px", textDecoration: "none",
              color: (item as any).active ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 500,
              backgroundColor: (item as any).active ? "rgba(201,168,76,0.06)" : "transparent",
              borderRight: (item as any).active ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <span>→</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px", minWidth: 0 }}>

        {/* Mobile header */}
        <div className="admin-mobile-header" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}>☰</button>
          <span style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1rem" }}>Purchases</span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Header */}
        <div className="admin-desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Purchases</h1>
          </div>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 24px", textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Filtered Revenue</div>
            <div style={{ color: "var(--gold)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by email or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: "200px", padding: "10px 14px",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dim)",
              borderRadius: "4px", color: "var(--text-primary)",
              fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px", backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-dim)", borderRadius: "4px",
              color: "var(--text-primary)", fontSize: "0.82rem",
              fontFamily: "var(--font-ui)", outline: "none", cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading purchases...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>No purchases found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="admin-orders-desktop">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Customer", "Reference", "Items", "Total", "Date", ""].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {filtered.map((order, i) => (
                  <div key={order.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                    padding: "14px 24px", alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.paystack_reference}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)" }}>{order.items?.length ?? 0} beat{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{Number(order.total).toLocaleString()}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: "5px 12px", borderRadius: "3px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", cursor: "pointer" }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="admin-orders-mobile" style={{ display: "none", flexDirection: "column" }}>
                {filtered.map((order, i) => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
                    padding: "16px 20px", cursor: "pointer",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{Number(order.total).toLocaleString()}</span>
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
        </div>

        {/* Summary */}
        {!loading && (
          <div style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", textAlign: "right" }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "12px", width: "100%", maxWidth: "560px", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>

              {/* Order meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {[
                  { label: "Email", value: selectedOrder.email },
                  { label: "Reference", value: selectedOrder.paystack_reference },
                  { label: "Date", value: new Date(selectedOrder.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                  { label: "Status", value: selectedOrder.status.toUpperCase() },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{row.label}</span>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 600, textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Items</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(selectedOrder.items ?? []).map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "var(--bg-elevated)", borderRadius: "6px" }}>
                      <div>
                        <div style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-ui)" }}>{item.title}</div>
                        <div style={{ color: "var(--gold)", fontSize: "0.62rem", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{LICENSE_LABELS[item.license_type] ?? item.license_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>Subtotal</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>₦{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>Discount</span>
                    <span style={{ color: "#4ade80", fontSize: "0.75rem", fontFamily: "var(--font-ui)" }}>-₦{Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Total</span>
                  <span style={{ color: "var(--gold)", fontSize: "0.95rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%) !important; transition: transform 0.25s ease; }
          .admin-main { margin-left: 0 !important; padding: 20px 16px !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-desktop-header { display: none !important; }
          .admin-orders-desktop { display: none !important; }
          .admin-orders-mobile { display: flex !important; }
        }
      `}</style>
    </main>
  )
}