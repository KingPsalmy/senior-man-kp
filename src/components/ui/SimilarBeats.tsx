"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Props = {
  beatId: string
  title?: string
}

export default function SimilarBeats({ beatId, title }: Props) {
  const [beats, setBeats] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/beats/similar?beat_id=${beatId}`)
      .then((r) => r.json())
      .then((d) => setBeats(d.similar ?? []))
  }, [beatId])

  if (!beats.length) return null

  const genreColor: Record<string, string> = {
    "Afrobeat": "#1a0a2e", "Afro Fusion": "#0a1a2e",
    "Trap": "#2e0a0a", "R&B": "#0a2e1a",
    "Amapiano": "#2e1a0a", "Drill": "#1a1a2e",
  }

  return (
    <div style={{ marginTop: "48px" }}>
      <div style={{ marginBottom: "20px" }}>
        <span style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {title ?? "Similar Beats"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {beats.map((beat) => (
          <Link key={beat.id} href={`/beat/${beat.slug}`} style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px", overflow: "hidden",
            }}>
              <div style={{
                aspectRatio: "1",
                background: beat.cover_url ? "none" : `linear-gradient(135deg, ${genreColor[beat.genre] ?? "#111"} 0%, #0a0a0a 100%)`,
                backgroundColor: "#0a0a0a",
                position: "relative",
              }}>
                {beat.cover_url && (
                  <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "2px" }}>
                  {beat.title}
                </div>
                <div style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-ui)" }}>
                  {beat.genre} • {beat.bpm} BPM
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginTop: "6px" }}>
                  from ₦{Number(beat.basic_price).toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}