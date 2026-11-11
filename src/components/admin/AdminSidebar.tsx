"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Disc3,
  CreditCard,
  Users,
  Settings2,
  LogOut,
  ArrowUpRight,
  Music2,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
const links = [
  { label: "Overview", path: "", Icon: LayoutDashboard },
  { label: "Beat library", path: "/beats", Icon: Music2 },
  { label: "Purchases", path: "/purchases", Icon: CreditCard },
  { label: "Sold beats", path: "/sold-beats", Icon: Disc3 },
  { label: "Customers", path: "/customers", Icon: Users },
  { label: "Settings", path: "/settings", Icon: Settings2 },
]
export default function AdminSidebar() {
  const pathname = usePathname(),
    router = useRouter()
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  async function logout() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError("Couldn’t sign out. Please try again.")
      setBusy(false)
      return
    }
    router.replace("/admin/login")
    router.refresh()
  }
  return (
    <aside className="studio-sidebar">
      <Link href="/admin/dashboard" className="studio-brand">
        <span>
          KP<span>.</span>
        </span>
        <div>
          SENIOR MAN KP<small>STUDIO MANAGER</small>
        </div>
      </Link>
      <p className="studio-nav-label">Your workspace</p>
      <nav aria-label="Admin navigation">
        {links.map(({ label, path, Icon }) => (
          <Link
            href={"/admin/dashboard" + path}
            key={path}
            aria-current={
              pathname === "/admin/dashboard" + path ? "page" : undefined
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="studio-bottom">
        <Link href="/beatstore" target="_blank" rel="noopener noreferrer">
          View storefront
          <ArrowUpRight size={17} />
        </Link>
        <button onClick={logout} disabled={busy}>
          <LogOut size={17} />
          {busy ? "Signing out…" : "Sign out"}
        </button>
        {error && <p role="alert">{error}</p>}
        <small>THE BUSINESS BEHIND THE MUSIC.</small>
      </div>
    </aside>
  )
}
