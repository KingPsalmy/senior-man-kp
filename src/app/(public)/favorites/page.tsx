"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import PageIntro from "@/components/ui/PageIntro"
import {
  BeatCard,
  BeatSkeletons,
  type CatalogBeat,
} from "@/components/store/BeatCollection"
import { getFavorites } from "@/lib/favorites"
import { useFavoritesStore } from "@/store/favoritesStore"
import { ArrowUpRight, Heart } from "lucide-react"
export default function FavoritesPage() {
  const [beats, setBeats] = useState<CatalogBeat[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("")
  const ids = useFavoritesStore((s) => s.favoritedIds)
  useEffect(() => {
    useFavoritesStore.getState().load()
    getFavorites()
      .then((data) =>
        setBeats(
          (data as unknown as { beats: CatalogBeat | null }[])
            .map((f) => f.beats)
            .filter((b): b is CatalogBeat => !!b),
        ),
      )
      .catch(() =>
        setError("Couldn’t load your saved beats Please refresh to try again"),
      )
      .finally(() => setLoading(false))
  }, [])
  const saved = beats.filter((b) => ids.has(b.id))
  return (
    <main>
      <Navbar />
      <PageIntro
        eyebrow="Keep the inspiration close"
        title="Your shortlist"
        description="The beats you keep coming back to Saved on this browser, ready for your next session"
      />
      <section className="container section">
        {error ? (
          <p className="notice error" role="alert">
            {error}
          </p>
        ) : loading ? (
          <BeatSkeletons />
        ) : saved.length ? (
          <div className="catalog-grid">
            {saved.map((beat) => (
              <BeatCard key={beat.id} beat={beat} queue={saved} />
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <Heart size={38} />
            <h2>Hear something you love?</h2>
            <p>Tap the heart on a beat to save it here</p>
            <Link className="button primary" href="/beatstore/beats">
              Find your sound
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
