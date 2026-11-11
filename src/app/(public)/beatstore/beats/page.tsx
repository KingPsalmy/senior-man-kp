"use client"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowUpRight,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import PageIntro from "@/components/ui/PageIntro"
import {
  BeatCard,
  BeatSkeletons,
  type CatalogBeat,
} from "@/components/store/BeatCollection"
import { fetchCatalog } from "@/lib/catalog-client"
import { useFavoritesStore } from "@/store/favoritesStore"
function Catalog({ initial }: { initial: Record<string, string> }) {
  const [beats, setBeats] = useState<CatalogBeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState(initial.search || "")
  const [genre, setGenre] = useState(initial.genre || "")
  const [mood, setMood] = useState(initial.mood || "")
  const [bpm, setBpm] = useState(initial.bpm || "")
  const [musicalKey, setKey] = useState(initial.key || "")
  const [sort, setSort] = useState("newest")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [filtersOpen, setFiltersOpen] = useState(false)
  useEffect(() => {
    let active = true
    useFavoritesStore
      .getState()
      .load()
      .catch(() => {})
    fetchCatalog()
      .then(({ data, error }) => {
        if (active) {
          setBeats((data ?? []) as CatalogBeat[])
          setError(!!error)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [retry])
  const genres = [...new Set(beats.map((b) => b.genre))].sort()
  const moods = [
    ...new Set(beats.map((b) => b.mood).filter((s): s is string => !!s)),
  ].sort()
  const keys = [...new Set(beats.map((b) => b.key).filter(Boolean))].sort()
  const filtered = useMemo(
    () =>
      beats
        .filter((b) => {
          const text = [b.title, b.genre, b.mood].join(" ").toLowerCase()
          return (
            text.includes(search.toLowerCase()) &&
            (!genre || b.genre === genre) &&
            (!mood || b.mood === mood) &&
            (!musicalKey || b.key === musicalKey) &&
            (!bpm ||
              (bpm === "slow"
                ? b.bpm < 90
                : bpm === "mid"
                  ? b.bpm >= 90 && b.bpm <= 120
                  : bpm === "fast"
                    ? b.bpm > 120
                    : Math.abs(b.bpm - Number(bpm)) <= 5))
          )
        })
        .sort((a, b) =>
          sort === "price_low"
            ? a.basic_price - b.basic_price
            : sort === "price_high"
              ? b.basic_price - a.basic_price
              : sort === "popular"
                ? (b.play_count || 0) - (a.play_count || 0)
                : sort === "oldest"
                  ? (a.created_at || "").localeCompare(b.created_at || "")
                  : (b.created_at || "").localeCompare(a.created_at || ""),
        ),
    [beats, search, genre, mood, musicalKey, bpm, sort],
  )
  const filters = [
    { label: genre, clear: () => setGenre("") },
    { label: mood, clear: () => setMood("") },
    { label: musicalKey, clear: () => setKey("") },
    {
      label: bpm
        ? bpm === "slow"
          ? "Under 90 BPM"
          : bpm === "mid"
            ? "90–120 BPM"
            : bpm === "fast"
              ? "Over 120 BPM"
              : bpm + " BPM"
        : "",
      clear: () => setBpm(""),
    },
  ].filter((f) => f.label)
  function reset() {
    setSearch("")
    setGenre("")
    setMood("")
    setKey("")
    setBpm("")
  }
  return (
    <main className="kp-page">
      <Navbar />
      <PageIntro
        eyebrow="The catalog"
        title="Find your next sound"
        description="Preview original beats and find the sound for your next release"
      >
        <Link href="/licensing" className="intro-note">
          <span>YOUR SOUND · YOUR LICENSE</span>
          <strong>Not sure which license?</strong>
          <small>
            Find your fit <ArrowUpRight size={14} />
          </small>
        </Link>
      </PageIntro>
      <div className="container catalog-layout">
        <aside
          className={"filter-panel " + (filtersOpen ? "filters-open" : "")}
        >
          <button
            className="filter-heading"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
          >
            <SlidersHorizontal size={18} />
            <strong>Refine your sound</strong>
            <span>{filters.length || "+"}</span>
          </button>
          <div id="catalog-filters" className="filter-body">
            <fieldset>
              <legend>Genre</legend>
              <button
                className={"genre-choice " + (!genre ? "active" : "")}
                onClick={() => setGenre("")}
              >
                All sounds <span>{beats.length}</span>
              </button>
              {[...new Set([...(genre ? [genre] : []), ...genres])].map((g) => (
                <button
                  className={"genre-choice " + (genre === g ? "active" : "")}
                  key={g}
                  onClick={() => setGenre(g)}
                >
                  {g}
                  <span>{beats.filter((b) => b.genre === g).length}</span>
                </button>
              ))}
            </fieldset>
            <label>
              Mood
              <select value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="">Every feeling</option>
                {[...new Set([...(mood ? [mood] : []), ...moods])].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Tempo
              <select value={bpm} onChange={(e) => setBpm(e.target.value)}>
                <option value="">Any tempo</option>
                <option value="slow">Under 90 BPM</option>
                <option value="mid">90–120 BPM</option>
                <option value="fast">Over 120 BPM</option>
                {bpm && !["slow", "mid", "fast"].includes(bpm) && (
                  <option value={bpm}>{bpm} BPM ± 5</option>
                )}
              </select>
            </label>
            <label>
              Musical key
              <select
                value={musicalKey}
                onChange={(e) => setKey(e.target.value)}
              >
                <option value="">Any key</option>
                {[
                  ...new Set([...(musicalKey ? [musicalKey] : []), ...keys]),
                ].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <button className="text-link" onClick={reset}>
              Reset filters <X size={14} />
            </button>
          </div>
        </aside>
        <section className="catalog-results" aria-label="Beat results">
          <div className="catalog-search">
            <Search size={20} />
            <input
              aria-label="Search the catalog"
              placeholder="Search titles, genres or moods"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <div className="results-toolbar">
            <p aria-live="polite">
              {loading
                ? "Finding your sound…"
                : filtered.length +
                  " beat" +
                  (filtered.length === 1 ? "" : "s") +
                  " to explore"}
            </p>
            <div>
              <select
                aria-label="Sort beats"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="popular">Most played</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
              </select>
              <div className="view-switch">
                <button
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 size={17} />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={19} />
                </button>
              </div>
            </div>
          </div>
          {filters.length > 0 && (
            <div className="active-filters">
              {filters.map((f) => (
                <button key={f.label} onClick={f.clear}>
                  {f.label}
                  <X size={13} />
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <BeatSkeletons count={6} />
          ) : error ? (
            <div className="empty-panel">
              <h2>We couldn’t load the catalog</h2>
              <p>Please check your connection and try again</p>
              <button
                className="button"
                onClick={() => {
                  setLoading(true)
                  setRetry((v) => v + 1)
                }}
              >
                Try again
              </button>
            </div>
          ) : filtered.length ? (
            <div className={view === "grid" ? "catalog-grid" : "catalog-list"}>
              {filtered.map((beat) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  queue={filtered}
                  compact={view === "list"}
                />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <Search size={32} />
              <h2>A different search might hit</h2>
              <p>Try another mood or clear your filters to hear more sounds</p>
              <button className="button primary" onClick={reset}>
                Explore all beats
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
function StoreContent() {
  const params = useSearchParams()
  return (
    <Catalog
      key={params.toString()}
      initial={Object.fromEntries(params.entries())}
    />
  )
}
export default function StorePage() {
  return (
    <Suspense
      fallback={
        <main className="kp-page">
          <Navbar />
          <PageIntro
            eyebrow="The catalog"
            title="Find your next sound"
            description="Loading the catalog…"
          />
          <div className="container">
            <BeatSkeletons />
          </div>
        </main>
      }
    >
      <StoreContent />
    </Suspense>
  )
}
