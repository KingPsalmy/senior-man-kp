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

function isTestOrder(order: Order) {
  return order.paystack_reference?.startsWith("TEST_")
}

export default function PurchasesPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refundingBeatId, setRefundingBeatId] = useState<string | null>(null)
  const [confirmingBeatId, setConfirmingBeatId] = useState<string | null>(null)
  const [refundError, setRefundError] = useState("")
  const [refundedBeatIds, setRefundedBeatIds] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
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

  function openOrder(order: Order) {
    setSelectedOrder(order)
    setRefundedBeatIds([])
    setRefundError("")
    setConfirmingBeatId(null)
  }

  async function handleRefund(beatId: string) {
    if (!selectedOrder) return
    setRefundError("")
    setRefundingBeatId(beatId)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paystack_reference: selectedOrder.paystack_reference,
          beat_id: beatId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRefundError(data.error || "Failed to process refund.")
        setRefundingBeatId(null)
        return
      }

      setRefundedBeatIds((prev) => [...prev, beatId])
      setConfirmingBeatId(null)
    } catch (err) {
      console.error("[refund error]", err)
      setRefundError("Something went wrong. Please try again.")
    } finally {
      setRefundingBeatId(null)
    }
  }

  if (checking) return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>Loading...</span>
    </div>
  )

  const totalRevenue = filtered
    .filter((o) => !isTestOrder(o))
    .reduce((sum, o) => sum + Number(o.total), 0)

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
          <span className="admin-mobile-title" style={{ color: "var(--text-primary)", fontWeight: 800, fontFamily: "var(--font-ui)", fontSize: "1.3rem" }}>Purchases</span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Header */}
        <div className="admin-desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.9rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginTop: "4px" }}>Purchases</h1>
          </div>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 24px", textAlign: "right" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Filtered Revenue</div>
            <div style={{ color: "var(--gold)", fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{totalRevenue.toLocaleString()}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)", marginTop: "2px" }}>excludes free/test orders</div>
          </div>
        </div>

        {/* Mobile revenue card */}
        <div className="admin-mobile-revenue" style={{ display: "none", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Filtered Revenue</div>
          <div style={{ color: "var(--gold)", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{totalRevenue.toLocaleString()}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginTop: "2px" }}>excludes free/test orders</div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by email or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filter-input"
            style={{
              flex: 1, minWidth: "200px", padding: "11px 14px",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dim)",
              borderRadius: "4px", color: "var(--text-primary)",
              fontSize: "0.92rem", fontFamily: "var(--font-ui)", outline: "none",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
            style={{
              padding: "11px 14px", backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-dim)", borderRadius: "4px",
              color: "var(--text-primary)", fontSize: "0.92rem",
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
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Loading purchases...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.95rem" }}>No purchases found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="admin-orders-desktop">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 90px", padding: "12px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Customer", "Reference", "Items", "Total", "Date", ""].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {filtered.map((order, i) => (
                  <div key={order.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 90px",
                    padding: "16px 24px", alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px" }}>
                      {order.email}
                      {isTestOrder(order) && (
                        <span style={{ backgroundColor: "rgba(148,148,148,0.15)", color: "#999", fontSize: "0.6rem", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase", flexShrink: 0 }}>Test</span>
                      )}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.paystack_reference}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>{order.items?.length ?? 0} beat{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                    <span style={{ color: "var(--gold)", fontSize: "0.9rem", fontFamily: "var(--font-ui)", fontWeight: 700 }}>₦{Number(order.total).toLocaleString()}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <button
                      onClick={() => openOrder(order)}
                      style={{ padding: "6px 14px", borderRadius: "3px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)", color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", cursor: "pointer" }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="admin-orders-mobile" style={{ display: "none", flexDirection: "column" }}>
                {filtered.map((order, i) => (
                  <div key={order.id} onClick={() => openOrder(order)} className="admin-order-card" style={{
                    padding: "18px 20px", cursor: "pointer",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="admin-order-amount" style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{Number(order.total).toLocaleString()}</span>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {isTestOrder(order) && (
                          <span style={{ backgroundColor: "rgba(148,148,148,0.15)", color: "#999", fontSize: "0.6rem", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" }}>Test</span>
                        )}
                        <span className="admin-order-status" style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80", fontSize: "0.72rem", fontFamily: "var(--font-mono)", padding: "4px 10px", borderRadius: "2px", textTransform: "uppercase" }}>{order.status}</span>
                      </div>
                    </div>
                    <div className="admin-order-email" style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontFamily: "var(--font-ui)", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="admin-order-meta" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{order.items?.length ?? 0} beat{(order.items?.length ?? 0) !== 1 ? "s" : ""}</span>
                      <span className="admin-order-meta" style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {!loading && (
          <div style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", textAlign: "right" }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div className="admin-order-modal" style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "12px", width: "100%", maxWidth: "560px", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="admin-order-modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="admin-order-modal-title" style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>
                Order Details
                {isTestOrder(selectedOrder) && (
                  <span style={{ marginLeft: "10px", backgroundColor: "rgba(148,148,148,0.15)", color: "#999", fontSize: "0.6rem", fontFamily: "var(--font-mono)", padding: "3px 9px", borderRadius: "2px", textTransform: "uppercase", verticalAlign: "middle" }}>Test / Free</span>
                )}
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div className="admin-order-modal-body" style={{ padding: "24px", overflowY: "auto", flex: 1 }}>

              {/* Order meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {[
                  { label: "Email", value: selectedOrder.email },
                  { label: "Reference", value: selectedOrder.paystack_reference },
                  { label: "Date", value: new Date(selectedOrder.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                  { label: "Status", value: selectedOrder.status.toUpperCase() },
                ].map((row) => (
                  <div key={row.label} className="admin-order-meta-row" style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <span className="admin-order-meta-label" style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>{row.label}</span>
                    <span className="admin-order-meta-value" style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", fontWeight: 600, textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {refundError && (
                <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                  {refundError}
                </div>
              )}

              {/* Items */}
              <div style={{ marginBottom: "20px" }}>
                <div className="admin-order-section-label" style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Items</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(selectedOrder.items ?? []).map((item: any, i: number) => {
                    const isRefunded = refundedBeatIds.includes(item.beat_id)
                    const isRefunding = refundingBeatId === item.beat_id
                    const isConfirming = confirmingBeatId === item.beat_id

                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 15px", backgroundColor: "var(--bg-elevated)", borderRadius: "6px", gap: "12px" }}>
                        <div>
                          <div className="admin-order-item-title" style={{ color: "var(--text-primary)", fontSize: "0.92rem", fontWeight: 600, fontFamily: "var(--font-ui)" }}>{item.title}</div>
                          <div className="admin-order-item-license" style={{ color: "var(--gold)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{LICENSE_LABELS[item.license_type] ?? item.license_type}</div>
                        </div>

                        {isRefunded ? (
                          <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#4ade80", textTransform: "uppercase", flexShrink: 0 }}>Refunded</span>
                        ) : isConfirming ? (
                          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                            <button
                              onClick={() => handleRefund(item.beat_id)}
                              disabled={isRefunding}
                              style={{ padding: "6px 12px", borderRadius: "3px", backgroundColor: "#ff6b6b", border: "none", color: "#000", fontSize: "0.68rem", fontFamily: "var(--font-mono)", cursor: isRefunding ? "not-allowed" : "pointer", fontWeight: 700 }}
                            >
                              {isRefunding ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmingBeatId(null)}
                              style={{ padding: "6px 12px", borderRadius: "3px", backgroundColor: "transparent", border: "1px solid var(--border-dim)", color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingBeatId(item.beat_id)}
                            style={{ padding: "6px 14px", borderRadius: "3px", backgroundColor: "transparent", border: "1px solid rgba(255,107,107,0.4)", color: "#ff6b6b", fontSize: "0.68rem", fontFamily: "var(--font-mono)", cursor: "pointer", flexShrink: 0 }}
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Totals */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="admin-order-total-label" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>Subtotal</span>
                  <span className="admin-order-total-value" style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>₦{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="admin-order-total-label" style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>Discount</span>
                    <span className="admin-order-total-value" style={{ color: "#4ade80", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>-₦{Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="admin-order-grand-label" style={{ color: "var(--text-primary)", fontSize: "0.98rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>Total</span>
                  <span className="admin-order-grand-value" style={{ color: "var(--gold)", fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>₦{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; padding: 20px 16px 80px !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-desktop-header { display: none !important; }
          .admin-mobile-revenue { display: block !important; }
          .admin-orders-desktop { display: none !important; }
          .admin-orders-mobile { display: flex !important; }

          .admin-mobile-title {
            font-size: 1.3rem !important;
          }
          .admin-filter-input,
          .admin-filter-select {
            font-size: 1rem !important;
            padding: 13px 14px !important;
          }

          .admin-order-amount {
            font-size: 1.05rem !important;
          }
          .admin-order-status {
            font-size: 0.75rem !important;
          }
          .admin-order-email {
            font-size: 0.9rem !important;
          }
          .admin-order-meta {
            font-size: 0.8rem !important;
          }

          .admin-order-modal {
            max-width: 100% !important;
            max-height: 90vh !important;
          }
          .admin-order-modal-header {
            padding: 16px 20px !important;
          }
          .admin-order-modal-title {
            font-size: 1.1rem !important;
          }
          .admin-order-modal-body {
            padding: 20px !important;
          }
          .admin-order-meta-label {
            font-size: 0.88rem !important;
          }
          .admin-order-meta-value {
            font-size: 0.92rem !important;
          }
          .admin-order-section-label {
            font-size: 0.75rem !important;
          }
          .admin-order-item-title {
            font-size: 1rem !important;
          }
          .admin-order-item-license {
            font-size: 0.78rem !important;
          }
          .admin-order-total-label,
          .admin-order-total-value {
            font-size: 0.92rem !important;
          }
          .admin-order-grand-label {
            font-size: 1.02rem !important;
          }
          .admin-order-grand-value {
            font-size: 1.2rem !important;
          }
        }
      `}</style>
    </main>
  )
}