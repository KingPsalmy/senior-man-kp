"use client"
import { mediaAssets } from "@/lib/media-assets"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Search,
  SlidersHorizontal,
  Pause,
  Play,
} from "lucide-react"
import HeroParticles from "@/components/ui/HeroParticles"
import Navbar from "@/components/layout/Navbar"
import {
  BeatCard,
  BeatSkeletons,
  type CatalogBeat,
} from "@/components/store/BeatCollection"
import { fetchCatalog } from "@/lib/catalog-client"
import { useFavoritesStore } from "@/store/favoritesStore"
import { usePlayerStore } from "@/store/playerStore"
const portraits = [
  mediaAssets["hero-pic-left"],
  mediaAssets["hero-pic-left-2"],
  mediaAssets["hero-pic-left-3"],
]
export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [beats, setBeats] = useState<CatalogBeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [portrait, setPortrait] = useState(0)
  const [motionPaused, setMotionPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener("change", update)
    return () => preference.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (motionPaused || reducedMotion) return
    const timer = window.setInterval(
      () => setPortrait((i) => (i + 1) % portraits.length),
      25000,
    )
    return () => window.clearInterval(timer)
  }, [motionPaused, reducedMotion])
  const lastPlayed = usePlayerStore((s) => s.lastPlayed)
  useEffect(() => {
    let active = true
    useFavoritesStore
      .getState()
      .load()
      .catch(() => {})
    usePlayerStore.getState().hydrateHistory()
    fetchCatalog({ limit: "12" })
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
  const latest = beats.slice(0, 4)
  const history = lastPlayed
    .map((stored) => beats.find((b) => String(b.id) === String(stored.id)))
    .filter((b): b is CatalogBeat => !!b)
    .slice(0, 4)
  return (
    <main className="kp-home">
      <Navbar />
      <section className="home-hero blended-hero">
        <div className="hero-studio-layer">
          <img
            src={mediaAssets["hero-pic"]}
            alt="Senior Man KP producing in the studio"
            fetchPriority="high"
          />
          <div className="studio-fade" />
          <div className="studio-floor" />
        </div>
        <div className="hero-portrait-layer">
          {portraits.map((src, i) => (
            <img
              key={src}
              src={src}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              alt={i === portrait ? "Portrait of Senior Man KP" : ""}
              className={portrait === i ? "portrait-active" : ""}
              aria-hidden={i !== portrait}
            />
          ))}
          <div className="portrait-fades" />
        </div>
        {!motionPaused && !reducedMotion && <HeroParticles />}
        <div className="hero-editorial">
<h1>
            <span className="hero-headline-line">YOUR NEXT BIGGEST RECORD</span>
            <em>STARTS HERE</em>
          </h1>
          <p className="hero-description">
            Beats with soul and space for your voice
            <br />
            Find the sound that brings your next idea to life
          </p>
          <div className="hero-buttons">
            <Link href="/beatstore/beats" className="button primary">
              Explore the beats <ArrowUpRight size={20} />
            </Link>
            <Link href="/licensing" className="text-link">
              Find your license <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="blend-caption">
          <span className="eyebrow">SENIOR MAN KP / ORIGINALS</span>
          <div className="portrait-controls">
            {portraits.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPortrait(i)
                  setMotionPaused(true)
                }}
                aria-label={"Show portrait " + (i + 1)}
                aria-pressed={portrait === i}
              />
            ))}
            {!reducedMotion && (
              <button
                className="motion-toggle"
                onClick={() => setMotionPaused((p) => !p)}
                aria-label={
                  motionPaused ? "Resume hero motion" : "Pause hero motion"
                }
              >
                {motionPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="discovery-band">
        <div className="container">
          <span className="eyebrow">
            Find your frequency <ArrowDown size={15} />
          </span>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              router.push("/beatstore/beats?search=" + encodeURIComponent(search.trim()))
            }}
            className="discovery-search"
          >
            <Search size={21} />
            <input
              aria-label="Search beats"
              placeholder="A title, a mood, a sound…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="Search the catalog">
              <ArrowRight size={22} />
            </button>
          </form>
          <div className="discovery-genres">
            {["Afrobeat", "Afro Fusion", "Amapiano", "R&B"].map((genre) => (
              <Link
                href={"/beatstore/beats?genre=" + encodeURIComponent(genre)}
                key={genre}
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <section className="section container" id="latest">
        <div className="section-heading">
          <div>
            <h2>The latest works</h2>
          </div>
          <Link href="/beatstore/beats" className="text-link">
            Full catalog <ArrowUpRight size={18} />
          </Link>
        </div>
        {loading ? (
          <BeatSkeletons />
        ) : error ? (
          <div className="empty-panel">
            <h3>The catalog needs a moment</h3>
            <p>We couldn’t load the beats Give it another try</p>
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
        ) : latest.length ? (
          <div className="catalog-grid">
            {latest.map((beat) => (
              <BeatCard beat={beat} queue={latest} key={beat.id} />
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <Headphones size={32} />
            <h3>New sounds are on the way</h3>
            <p>Check back soon for the next drop</p>
          </div>
        )}
      </section>
      <section className="bundle-banner container">
        <div className="bundle-mark">
          2<span>+1</span>
        </div>
        <div>
          <p className="eyebrow">More room to create</p>
          <h2>Build your next project</h2>
          <p>
            Choose three beats in the same license tier The lowest-priced one is
            on us
          </p>
        </div>
        <Link href="/beatstore/beats" className="button primary">
          Build your bundle <ArrowRight size={18} />
        </Link>
      </section>
      {history.length > 0 && (
        <section className="section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pick up where you left off</p>
              <h2>Still on your mind</h2>
            </div>
          </div>
          <div className="catalog-grid">
            {history.map((beat) => (
              <BeatCard beat={beat} queue={history} key={beat.id} />
            ))}
          </div>
        </section>
      )}
      <section className="section process-section container">
        <div className="section-heading">
          <div>
            <h2>
              From first listen
              <br />
              to your next release
            </h2>
          </div>
        </div>
        <div className="process-grid">
          {[
            {
              icon: Headphones,
              title: "Find the feeling",
              text: "Listen, explore and save the beats that speak to you",
              link: "/beatstore/beats",
              cta: "Explore the catalog",
            },
            {
              icon: SlidersHorizontal,
              title: "Make it your own",
              text: "Pick a license that matches the way you want to release",
              link: "/licensing",
              cta: "Compare licenses",
            },
            {
              icon: ArrowDown,
              title: "Download & create",
              text: "Pay securely and open your private download link from your email",
              link: "/my-downloads",
              cta: "Access your downloads",
            },
          ].map((item, i) => (
            <article key={item.title}>
              <div className="process-top">
                <item.icon size={26} />
                <span>0{i + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={item.link}>
                {item.cta}
                <ArrowUpRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
