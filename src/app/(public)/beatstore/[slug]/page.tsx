"use client"
import CoverImage from "@/components/ui/CoverImage"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Music2,
  Play,
  Pause,
} from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import {
  BeatCard,
  BeatSkeletons,
  LicenseDialog,
  money,
  tiers,
  type CatalogBeat,
} from "@/components/store/BeatCollection"
import { fetchCatalog } from "@/lib/catalog-client"
import { usePlayerStore } from "@/store/playerStore"
import { useFavoritesStore } from "@/store/favoritesStore"
export default function BeatDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [beat, setBeat] = useState<CatalogBeat | null>(null),
    [related, setRelated] = useState<CatalogBeat[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [license, setLicense] = useState(false)
  const current = usePlayerStore((s) => s.currentBeat),
    playing = usePlayerStore((s) => s.isPlaying),
    saved = useFavoritesStore((s) =>
      beat ? s.favoritedIds.has(beat.id) : false,
    )
  useEffect(() => {
    let active = true
    useFavoritesStore.getState().load()
    async function load() {
      try {
        const { data: matches, error } = await fetchCatalog({ slug, limit: "1" })
        const data = matches?.[0] ?? null
        if (error) throw error
        if (!active) return
        setBeat(data as CatalogBeat | null)
        if (data) {
          const result = await fetchCatalog({ genre: data.genre, exclude: data.id, limit: "4" })
          if (active) setRelated((result.data ?? []) as CatalogBeat[])
        }
      } catch {
        if (active)
          setError("We couldn’t load this beat Please refresh to try again")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [slug])
  const isPlaying = !!beat && String(current?.id) === beat.id && playing
  function preview() {
    if (!beat) return
    const player = usePlayerStore.getState()
    if (isPlaying) {
      player.pause()
      return
    }
    player.setQueue([beat, ...related])
    player.play(beat)
    fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beat_id: beat.id }),
    }).catch(() => {})
  }
  return (
    <main>
      <Navbar />
      <div className="container section">
        <Link href="/beatstore/beats" className="text-link">
          <ArrowLeft size={16} />
          Back to the beats
        </Link>
        {loading ? (
          <BeatSkeletons count={1} />
        ) : error || !beat ? (
          <div className="empty-panel">
            <h1>{error || "This beat isn’t available"}</h1>
            <Link href="/beatstore/beats" className="button">
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            <section className="beat-detail-layout">
              <div className="detail-art">
                {beat.cover_url ? (
                  <CoverImage sizes="(max-width: 800px) 100vw, 560px" loading="eager"
                    src={beat.cover_url}
                    alt={beat.title + " cover artwork"}
                  />
                ) : (
                  <Music2 size={80} />
                )}
                <span className="art-label">
                  Original production / Senior Man KP
                </span>
              </div>
              <div className="detail-copy">
                <p className="eyebrow">
                  {beat.genre} · {beat.mood || "Instrumental"}
                </p>
                <h1>{beat.title}</h1>
                <p className="muted">Produced by Senior Man KP</p>
                <div className="detail-meta">
                  <span>
                    {beat.bpm}
                    <small>BPM</small>
                  </span>
                  <span>
                    {beat.key || "—"}
                    <small>KEY</small>
                  </span>
                  <span>
                    WAV<small>FORMAT</small>
                  </span>
                </div>
                {beat.description && (
                  <p className="detail-description">{beat.description}</p>
                )}
                <div className="detail-actions">
                  <button
                    className="button"
                    disabled={!beat.preview_url || beat.is_exclusive_sold}
                    onClick={preview}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}{" "}
                    {isPlaying ? "Pause preview" : "Listen to preview"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label={saved ? "Unsave beat" : "Save beat"}
                    aria-pressed={saved}
                    onClick={() => useFavoritesStore.getState().toggle(beat.id)}
                  >
                    <Heart fill={saved ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="detail-license">
                  <div>
                    <small className="muted">Licenses from</small>
                    <strong>{money(beat.basic_price)}</strong>
                  </div>
                  <button
                    className="button primary"
                    disabled={beat.is_exclusive_sold}
                    onClick={() => setLicense(true)}
                  >
                    {beat.is_exclusive_sold
                      ? "Sold exclusively"
                      : "Choose your license"}
                    <ArrowUpRight size={18} />
                  </button>
                </div>
                <p className="muted">
                  {beat.is_exclusive_sold
                    ? "Existing buyers can still access their purchases in My Downloads"
                    : "No account needed Your download link is delivered by email"}
                </p>
              </div>
            </section>
            <section className="detail-terms">
              <h2>A license for every stage</h2>
              <div>
                {tiers.map((t) => (
                  <Link href="/licensing" key={t.value}>
                    <span className="eyebrow">{t.label}</span>
                    <strong>
                      {money(
                        beat[
                          (t.value + "_price") as keyof CatalogBeat
                        ] as number,
                      )}
                    </strong>
                    <p>{t.detail}</p>
                    <span className="text-link">
                      See terms
                      <ArrowUpRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            {related.length > 0 && (
              <section className="section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Stay in the pocket</span>
                    <h2>More in this sound</h2>
                  </div>
                  <Link
                    href={"/beatstore/beats?genre=" + encodeURIComponent(beat.genre)}
                    className="text-link"
                  >
                    Explore {beat.genre}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="catalog-grid">
                  {related.map((b) => (
                    <BeatCard beat={b} key={b.id} queue={related} />
                  ))}
                </div>
              </section>
            )}
            {license && (
              <LicenseDialog beat={beat} onClose={() => setLicense(false)} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
