"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/playerStore"
import Link from "next/link"

const mockBeats = [
  { id: 1, title: "Midnight Drive", genre: "Afrobeat", bpm: 98, color: "#1a0a2e", preview_url: null, cover_url: null },
  { id: 2, title: "Higher", genre: "Afro Fusion", bpm: 104, color: "#0a1a2e", preview_url: null, cover_url: null },
  { id: 3, title: "No Limit", genre: "Trap", bpm: 120, color: "#2e0a0a", preview_url: null, cover_url: null },
  { id: 4, title: "Timeless", genre: "R&B", bpm: 90, color: "#0a2e1a", preview_url: null, cover_url: null },
  { id: 5, title: "Sauce", genre: "Trap", bpm: 140, color: "#2e1a0a", preview_url: null, cover_url: null },
  { id: 6, title: "Paradise", genre: "Afro Fusion", bpm: 96, color: "#0a2e2e", preview_url: null, cover_url: null },
]

export default function FloatingPlayer() {
  const {
    currentBeat, isPlaying, volume, progress, duration,
    queue, toggle, next, prev, setVolume, setProgress, setDuration, setQueue, play,
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isShuffle, setIsShuffle] = useState(true)
  const [isRepeat, setIsRepeat] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize queue on mount
  useEffect(() => {
    setMounted(true)
    setQueue(mockBeats)
  }, [])

  // Sync audio with state
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentBeat])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  function handleTimeUpdate() {
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime)
    setDuration(audioRef.current.duration || 0)
  }

  function handleEnded() {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      next()
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
    setProgress(ratio * duration)
  }

  function formatTime(s: number) {
    if (!s || isNaN(s)) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  if (!mounted || !currentBeat) return null

  const progressPercent = duration ? (progress / duration) * 100 : 0

  return (
    <>
      {/* Hidden audio element */}
      {currentBeat.preview_url && (
        <audio
          ref={audioRef}
          src={currentBeat.preview_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* Player bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
        backgroundColor: "rgba(6,6,6,0.97)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(201,168,76,0.25)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.8)",
        height: "72px",
        display: "flex", alignItems: "center",
        padding: "0 24px",
        gap: "20px",
      }}>

        {/* Cover + Beat Info */}
        <div className="player-info" style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px", flex: "0 0 220px" }}>
          <Link href={`/beat/${currentBeat.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
              background: `linear-gradient(135deg, ${currentBeat.color || "#1a0a2e"}, #0a0a0a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {currentBeat.cover_url ? (
                <img src={currentBeat.cover_url} alt={currentBeat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.55rem", fontFamily: "var(--font-mono)", textAlign: "center", padding: "2px" }}>
                  {currentBeat.title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentBeat.title}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>
              {currentBeat.genre} • {currentBeat.bpm} BPM
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", marginLeft: "4px", flexShrink: 0 }}>♡</button>
        </div>

        {/* Controls + Progress */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: isShuffle ? "var(--gold)" : "var(--text-muted)", transition: "color 0.2s" }}
              title="Shuffle"
            >
              ⇄
            </button>
            <button
              onClick={prev}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}
              title="Previous"
            >
              ⏮
            </button>
            <button
              onClick={toggle}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: "var(--gold)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 0 16px rgba(201,168,76,0.3)",
              }}
            >
              <span style={{ color: "#000", fontSize: "0.85rem", marginLeft: isPlaying ? "0" : "2px" }}>
                {isPlaying ? "⏸" : "▶"}
              </span>
            </button>
            <button
              onClick={next}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}
              title="Next"
            >
              ⏭
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: isRepeat ? "var(--gold)" : "var(--text-muted)", transition: "color 0.2s" }}
              title="Repeat"
            >
              ↺
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "560px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "32px", textAlign: "right" }}>
              {formatTime(progress)}
            </span>
            <div
              onClick={handleProgressClick}
              style={{ flex: 1, height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px", cursor: "pointer", position: "relative" }}
            >
              <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "var(--gold)", borderRadius: "2px", transition: "width 0.1s linear" }} />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "32px" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume + License */}
        <div className="player-volume" style={{ display: "flex", alignItems: "center", gap: "12px", flex: "0 0 200px", justifyContent: "flex-end" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>🔊</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              setVolume(Math.max(0, Math.min(1, ratio)))
            }}
            style={{ width: "80px", height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px", cursor: "pointer", position: "relative" }}
          >
            <div style={{ width: `${volume * 100}%`, height: "100%", backgroundColor: "var(--text-muted)", borderRadius: "2px" }} />
          </div>
          <Link href={`/beat/${currentBeat.id}`} style={{
            backgroundColor: "var(--gold)", border: "none",
            borderRadius: "3px", padding: "8px 14px",
            color: "#000", fontSize: "0.62rem", fontWeight: 700,
            fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer",
            textDecoration: "none",
          }}>
            License
          </Link>
        </div>

      </div>
    </>
  )
}