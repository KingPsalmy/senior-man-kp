"use client"
import CoverImage from "@/components/ui/CoverImage"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Trash2, ShoppingBag, Music2 } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import PageIntro from "@/components/ui/PageIntro"
import {
  money,
  tiers,
  type CatalogBeat,
} from "@/components/store/BeatCollection"
import {
  getCart,
  removeFromCart,
  updateCartLicense,
  type LicenseType,
} from "@/lib/cart"
import { calculateDiscount, itemPrice } from "@/lib/discount"
type Entry = { beat_id: string; license_type: LicenseType; beats: CatalogBeat }
export default function CartPage() {
  const [items, setItems] = useState<Entry[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState<string | null>(null)
  useEffect(() => {
    getCart()
      .then((data) => setItems(data as unknown as Entry[]))
      .catch(() =>
        setError("Your cart could not be loaded Please refresh to try again"),
      )
      .finally(() => setLoading(false))
  }, [])
  async function change(id: string, license?: LicenseType) {
    setBusy(id)
    setError("")
    try {
      const result = license
        ? await updateCartLicense(id, license)
        : await removeFromCart(id)
      if (result.error) throw Error(result.error)
      setItems((prev) =>
        license
          ? prev.map((i) =>
              i.beat_id === id ? { ...i, license_type: license } : i,
            )
          : prev.filter((i) => i.beat_id !== id),
      )
    } catch {
      setError("We couldn’t update your cart Please try again")
    } finally {
      setBusy(null)
    }
  }
  const { subtotal, discount, total, freeItems } = calculateDiscount(items)
  return (
    <main>
      <Navbar />
      <PageIntro
        eyebrow="Your selection"
        title="Good music starts here"
        description="Choose your licenses, check your selection, and make it yours"
      />
      <div className="container section">
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <div className="empty-panel" role="status">
            Loading your selection…
          </div>
        ) : !items.length ? (
          <div className="empty-panel">
            <ShoppingBag size={38} />
            <h2>A little quiet in here</h2>
            <p>Find a beat that sounds like your next release</p>
            <Link className="button primary" href="/beatstore/beats">
              Explore beats
              <ArrowUpRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="order-layout">
            <section className="cart-lines">
              {items.map((item) => (
                <article className="cart-line" key={item.beat_id}>
                  <Link
                    href={item.beats ? "/beatstore/" + item.beats.slug : "/beatstore/beats"}
                    className="cart-art"
                  >
                    {item.beats?.cover_url ? (
                      <CoverImage sizes="80px" src={item.beats.cover_url} alt="" />
                    ) : (
                      <Music2 />
                    )}
                  </Link>
                  <div className="cart-line-body">
                    <span className="eyebrow">
                      {item.beats?.genre || "Beat"}
                    </span>
                    <h2>{item.beats?.title || "Unavailable beat"}</h2>
                    <label className="sr-only" htmlFor={item.beat_id}>
                      License for {item.beats?.title}
                    </label>
                    <select
                      id={item.beat_id}
                      value={item.license_type}
                      disabled={busy !== null}
                      onChange={(e) =>
                        change(item.beat_id, e.target.value as LicenseType)
                      }
                    >
                      {tiers.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                          {item.beats
                            ? " · " +
                              money(
                                item.beats[
                                  (t.value + "_price") as keyof CatalogBeat
                                ] as number,
                              )
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="cart-line-end">
                    <strong>
                      {freeItems.includes(item.beat_id)
                        ? "FREE"
                        : money(itemPrice(item))}
                    </strong>
                    <button
                      className="icon-button"
                      disabled={busy !== null}
                      onClick={() => change(item.beat_id)}
                      aria-label={"Remove " + item.beats?.title}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
              <Link href="/beatstore/beats" className="text-link">
                Keep exploring
                <ArrowUpRight size={16} />
              </Link>
              <p className="notice">
                Build a bundle: every 3 beats in the same license tier include
                the lowest-priced beat free Applied automatically
              </p>
            </section>
            <aside className="surface-panel order-summary">
              <span className="eyebrow">Almost yours</span>
              <h2>Order summary</h2>
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="savings">
                    <dt>Bundle savings</dt>
                    <dd>−{money(discount)}</dd>
                  </div>
                )}
                <div className="order-total">
                  <dt>Total</dt>
                  <dd>{money(total)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                className={
                  "button primary full-width" + (busy ? " disabled" : "")
                }
                aria-disabled={!!busy}
                onClick={(e) => {
                  if (busy) e.preventDefault()
                }}
              >
                Continue to checkout
                <ArrowUpRight size={18} />
              </Link>
              <p className="muted">
                Secure payment via Paystack Your download link arrives by email
              </p>
              <Link href="/licensing" className="text-link">
                Compare license terms
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
