"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

type Customer = {
  email: string
  totalOrders: number
  totalSpent: number
  licenses: string[]
  lastPurchase: string
}

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "♪", label: "Beats", href: "/admin/dashboard/beats" },
  { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases" },
  { icon: "👤", label: "Customers", href: "/admin/dashboard/customers", active: true },
  { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings" },
]

export default function CustomersPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (!data.session) router.push("/admin/login")
      else {
        setChecking(false)
        fetchCustomers()
      }
    })
  }, [router])

  async function fetchCustomers() {
    setLoading(true)

    const { data: orders } = await supabase
      .from("orders")
      .select("email, total, items, created_at")
      .eq("status", "paid")
      .order("created_at", { ascending: false })

    if (!orders) {
      setLoading(false)
      return
    }

    // Group by email
    const customerMap: Record<string, Customer> = {}

    for (const order of orders) {
      if (!customerMap[order.email]) {
        customerMap[order.email] = {
          email: order.email,
          totalOrders: 0,
          totalSpent: 0,
          licenses: [],
          lastPurchase: order.created_at,
        }
      }

      const customer = customerMap[order.email]
      customer.totalOrders += 1
      customer.totalSpent += Number(order.total)

      // Collect license types
      for (const item of order.items ?? []) {
        if (item.license_type && !customer.licenses.includes(item.license_type)) {
          customer.licenses.push(item.license_type)
        }
      }

      // Keep most recent purchase
      if (new Date(order.created_at) > new Date(customer.lastPurchase)) {
        customer.lastPurchase = order.created_at
      }
    }

    const list = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent)
    setCustomers(list)
    setFiltered(list)
    setLoading(false)
  }

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(customers)
      return
    }
    const q = search.toLowerCase()
    setFiltered(customers.filter((c) => c.email.toLowerCase().includes(q)))
  }, [search, customers])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading...</span>
    </div>
  )

  const LICENSE_COLORS: Record<string, string> = {
    basic: "var(--text-muted)",
    premium: "#60a5fa",
    unlimited: "#a78bfa",
    exclusive: "var(--gold)",
  }

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
          <span style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1rem" }}>Customers</span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Header */}
        <div className="admin-desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Customers</h1>
          </div>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 24px", textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>Total Customers</div>
            <div style={{ color: "var(--gold)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>{customers.length}</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", maxWidth: "400px", padding: "10px 14px",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dim)",
              borderRadius: "4px", color: "var(--text-primary)",
              fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none",
            }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.85rem" }}>No customers found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="admin-orders-desktop">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Email", "Orders", "Total Spent", "Licenses", "Last Purchase"].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {filtered.map((customer, i) => (
                  <div key={customer.email} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr",
                    padding: "14px 24px", alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{customer.totalOrders}</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{customer.totalSpent.toLocaleString()}</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {customer.licenses.map((l) => (
                        <span key={l} style={{
                          fontSize: "0.58rem", fontFamily: "var(--font-mono)",
                          padding: "2px 6px", borderRadius: "2px",
                          textTransform: "uppercase",
                          backgroundColor: "var(--bg-elevated)",
                          color: LICENSE_COLORS[l] ?? "var(--text-muted)",
                        }}>{l}</span>
                      ))}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
                      {new Date(customer.lastPurchase).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="admin-orders-mobile" style={{ display: "none", flexDirection: "column" }}>
                {filtered.map((customer, i) => (
                  <div key={customer.email} style={{
                    padding: "16px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{customer.totalSpent.toLocaleString()}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>{customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
                      {customer.licenses.map((l) => (
                        <span key={l} style={{ fontSize: "0.58rem", fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: "2px", textTransform: "uppercase", backgroundColor: "var(--bg-elevated)", color: LICENSE_COLORS[l] ?? "var(--text-muted)" }}>{l}</span>
                      ))}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>
                      {new Date(customer.lastPurchase).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && (
          <div style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", textAlign: "right" }}>
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

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