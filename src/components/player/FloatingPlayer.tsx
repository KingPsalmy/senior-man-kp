"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useFavorite } from "@/hooks/useFavorites"
import Link from "next/link"

function HeartButton({ beatId }: { beatId: string }) {
  const { favorited, toggle } = useFavorite(beatId)
  return (
    <button
      onClick={toggle}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: favorited ? "var(--gold)" : "var(--text-muted)",
        fontSize: "1.1rem", padding: "4px",
        transition: "color 0.2s ease",
        flexShrink: 0,
      }}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      {favorited ? "♥" : "♡"}
    </button>
  )
}

export default function FloatingPlayer() {
  const {
    currentBeat, isPlaying, queue,
    play, pause, toggle, next, prev,
    volume, setVolume,
    progress, setProgress,
    duration, setDuration,
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isSeeking, setIsSeeking] = useState(false)
  const isSeekingRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, currentBeat])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || isSeeking) return
    if (progress === 0 && audio.currentTime > 0.5) {
      audio.currentTime = 0
    }
  }, [progress])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio || isSeeking) return
    setProgress(audio.currentTime)
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration)
  }

  function handleEnded() {
    next()
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
    setProgress(ratio * duration)
  }

  function seekFromClientX(clientX: number, el: HTMLElement) {
    if (!duration) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const newTime = ratio * duration
    setProgress(newTime)
    if (audioRef.current) audioRef.current.currentTime = newTime
  }

  function handleMobileSeekPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    isSeekingRef.current = true
    setIsSeeking(true)
    seekFromClientX(e.clientX, target)
  }

  function handleMobileSeekPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isSeekingRef.current) return
    seekFromClientX(e.clientX, e.currentTarget)
  }

  function handleMobileSeekPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isSeekingRef.current) return
    seekFromClientX(e.clientX, e.currentTarget)
    isSeekingRef.current = false
    setIsSeeking(false)
  }

  function formatTime(s: number) {
    if (!s || isNaN(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  if (!currentBeat) return null

  const beat = currentBeat
  const progressPercent = duration ? (progress / duration) * 100 : 0

  return (
    <>
      {beat.preview_url && (
        <audio
          ref={audioRef}
          src={beat.preview_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      <div className="floating-player-outer" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
        backgroundColor: "rgba(6,6,6,0.97)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(201,168,76,0.25)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
      }}>

        <div className="floating-player-bar" style={{
          height: "72px",
          display: "flex", alignItems: "center",
          padding: "0 24px",
          gap: "20px",
        }}>

          {/* Beat info */}
          <div className="floating-player-info" style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "220px", flex: "0 0 220px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0, overflow: "hidden", backgroundColor: "var(--bg-elevated)" }}>
              {beat.cover_url
                ? <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>♪</div>
              }
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--text-primary)", fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}>
                  {beat.title}
                </span>
                {isPlaying && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "14px", flexShrink: 0 }}>
                    {[1, 2, 3, 4].map((b) => (
                      <div
                        key={b}
                        className={`wave-bar-${b}`}
                        style={{
                          width: "2px", height: "12px",
                          backgroundColor: "var(--gold)",
                          borderRadius: "2px",
                          transformOrigin: "bottom",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {beat.genre} · {beat.bpm} BPM
              </div>
            </div>

            <HeartButton beatId={String(beat.id)} />
          </div>

          {/* Controls + progress */}
          <div className="floating-player-middle" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div className="floating-player-buttons" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "4px", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4" />
                  <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <button
                onClick={toggle}
                style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isPlaying
                  ? <svg width="14" height="14" viewBox="0 0 12 12" fill="#000"><rect x="1" y="0" width="4" height="12" rx="1" /><rect x="7" y="0" width="4" height="12" rx="1" /></svg>
                  : <span style={{ color: "#000", fontSize: "0.85rem", marginLeft: "2px" }}>▶</span>
                }
              </button>

              <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "4px", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="floating-player-progress" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", maxWidth: "480px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {formatTime(progress)}
              </span>
              <div
                onClick={handleProgressClick}
                style={{ flex: 1, height: "3px", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "2px", cursor: "pointer", position: "relative" }}
              >
                <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "var(--gold)", borderRadius: "2px", transition: "width 0.1s linear" }} />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right — volume + license button */}
          <div className="floating-player-right" style={{ display: "flex", alignItems: "center", gap: "16px", flex: "0 0 220px", justifyContent: "flex-end" }}>
            <div className="floating-player-volume" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
                {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
              </svg>
              <input
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: "80px", accentColor: "var(--gold)", cursor: "pointer" }}
              />
            </div>

            <Link href={`/beat/${(beat as any).slug || ""}`} className="floating-player-license" style={{
              padding: "9px 20px",
              background: "linear-gradient(135deg, #C9A84C, #F5D98B)",
              color: "#000", textDecoration: "none", borderRadius: "4px",
              fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--font-ui)",
              letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              License
            </Link>
          </div>
        </div>

        {/* Mobile-only full-width seek bar */}
        <div
          className="mobile-seek-wrap"
          onPointerDown={handleMobileSeekPointerDown}
          onPointerMove={handleMobileSeekPointerMove}
          onPointerUp={handleMobileSeekPointerUp}
          onPointerCancel={handleMobileSeekPointerUp}
        >
          <div className="mobile-seek-track">
            <div className="mobile-seek-fill" style={{ width: `${progressPercent}%` }} />
            {isSeeking && (
              <div className="mobile-seek-thumb" style={{ left: `${progressPercent}%` }} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}