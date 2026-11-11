"use client"

import AdminSidebar from "@/components/admin/AdminSidebar"

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


export default function CustomersPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

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
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>Loading...</span>
    </div>
  )

  const LICENSE_COLORS: Record<string, string> = {
    basic: "var(--text-muted)",
    premium: "#60a5fa",
    unlimited: "#a78bfa",
    exclusive: "var(--gold)",
  }

  return (
    <main className="admin-screen" style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {/* Sidebar (desktop: left rail — mobile: bottom tab bar, styled via globals.css) */}
      <AdminSidebar />

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px", minWidth: 0 }}>

        {/* Mobile header */}
        <div className="admin-mobile-header" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <span className="admin-mobile-title" style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1.3rem" }}>Customers</span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Header */}
        <div className="admin-desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.9rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Customers</h1>
          </div>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 24px", textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Total Customers</div>
            <div style={{ color: "var(--gold)", fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>{customers.length}</div>
          </div>
        </div>

        {/* Mobile stat card */}
        <div className="admin-mobile-stat" style={{ display: "none", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Total Customers</div>
          <div style={{ color: "var(--gold)", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>{customers.length}</div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filter-input"
            style={{
              width: "100%", maxWidth: "400px", padding: "11px 14px",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dim)",
              borderRadius: "4px", color: "var(--text-primary)",
              fontSize: "0.92rem", fontFamily: "var(--font-ui)", outline: "none",
            }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.95rem" }}>No customers found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="admin-orders-desktop">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Email", "Orders", "Total Spent", "Licenses", "Last Purchase"].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {filtered.map((customer, i) => (
                  <div key={customer.email} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr",
                    padding: "16px 24px", alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>{customer.totalOrders}</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{customer.totalSpent.toLocaleString()}</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {customer.licenses.map((l) => (
                        <span key={l} style={{
                          fontSize: "0.7rem", fontFamily: "var(--font-mono)",
                          padding: "3px 8px", borderRadius: "2px",
                          textTransform: "uppercase",
                          backgroundColor: "var(--bg-elevated)",
                          color: LICENSE_COLORS[l] ?? "var(--text-muted)",
                        }}>{l}</span>
                      ))}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                      {new Date(customer.lastPurchase).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="admin-orders-mobile" style={{ display: "none", flexDirection: "column" }}>
                {filtered.map((customer, i) => (
                  <div key={customer.email} className="admin-customer-card" style={{
                    padding: "18px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="admin-customer-spent" style={{ color: "var(--gold)", fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{customer.totalSpent.toLocaleString()}</span>
                      <span className="admin-customer-orders" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="admin-customer-email" style={{ color: "var(--text-secondary)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
                      {customer.licenses.map((l) => (
                        <span key={l} className="admin-customer-license" style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: "2px", textTransform: "uppercase", backgroundColor: "var(--bg-elevated)", color: LICENSE_COLORS[l] ?? "var(--text-muted)" }}>{l}</span>
                      ))}
                    </div>
                    <span className="admin-customer-date" style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                      {new Date(customer.lastPurchase).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && (
          <div style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textAlign: "right" }}>
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; padding: 20px 16px 80px !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-desktop-header { display: none !important; }
          .admin-mobile-stat { display: block !important; }
          .admin-orders-desktop { display: none !important; }
          .admin-orders-mobile { display: flex !important; }

          .admin-mobile-title {
            font-size: 1.3rem !important;
          }
          .admin-filter-input {
            font-size: 1rem !important;
            padding: 13px 14px !important;
            max-width: 100% !important;
          }

          .admin-customer-spent {
            font-size: 1.05rem !important;
          }
          .admin-customer-orders {
            font-size: 0.8rem !important;
          }
          .admin-customer-email {
            font-size: 0.9rem !important;
          }
          .admin-customer-license {
            font-size: 0.72rem !important;
            padding: 4px 9px !important;
          }
          .admin-customer-date {
            font-size: 0.78rem !important;
          }
        }
      `}</style>
    </main>
  )
}