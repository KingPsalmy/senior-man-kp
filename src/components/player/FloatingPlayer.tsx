"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/playerStore"
import Link from "next/link"

export default function FloatingPlayer() {
  const {
    currentBeat, isPlaying, volume, progress, duration,
    toggle, next, prev, setVolume, setProgress, setDuration,
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isShuffle, setIsShuffle] = useState(true)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

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
        <div className="floating-player-info" style={{
          display: "flex", alignItems: "center", gap: "12px",
          flex: isMobile ? "1" : "0 0 220px",
          minWidth: 0,
        }}>
          <Link href={`/beat/${beat.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "4px", flexShrink: 0,
              background: `linear-gradient(135deg, ${beat.color || "#1a0a2e"}, #0a0a0a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {beat.cover_url ? (
                <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.55rem", fontFamily: "var(--font-mono)" }}>
                  {beat.title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {beat.title}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>
              {beat.genre} • {beat.bpm} BPM
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem", flexShrink: 0 }}>♡</button>

          {/* Mobile-only play button */}
          {isMobile && (
            <button
              onClick={toggle}
              style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: "var(--gold)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <span style={{ color: "#000", fontSize: "0.85rem", marginLeft: isPlaying ? "0" : "2px" }}>
                {isPlaying ? "⏸" : "▶"}
              </span>
            </button>
          )}
        </div>

        {/* Controls + Progress — desktop only */}
        {!isMobile && (
          <div className="floating-player-controls" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setIsShuffle(!isShuffle)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: isShuffle ? "var(--gold)" : "var(--text-muted)" }}>⇄</button>
              <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}>⏮</button>
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
              <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--text-secondary)" }}>⏭</button>
              <button onClick={() => setIsRepeat(!isRepeat)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: isRepeat ? "var(--gold)" : "var(--text-muted)" }}>↺</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "560px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "32px", textAlign: "right" }}>
                {formatTime(progress)}
              </span>
              <div onClick={handleProgressClick} style={{ flex: 1, height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px", cursor: "pointer" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "var(--gold)", borderRadius: "2px", transition: "width 0.1s linear" }} />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", flexShrink: 0, minWidth: "32px" }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Volume + License — desktop only */}
        {!isMobile && (
          <div className="floating-player-volume" style={{ display: "flex", alignItems: "center", gap: "12px", flex: "0 0 200px", justifyContent: "flex-end" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>🔊</span>
            <div
              style={{ width: "80px", height: "3px", backgroundColor: "var(--bg-elevated)", borderRadius: "2px", cursor: "pointer", position: "relative" }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const updateVol = (clientX: number) => {
                  const ratio = (clientX - rect.left) / rect.width
                  setVolume(Math.max(0, Math.min(1, ratio)))
                }
                updateVol(e.clientX)
                const onMove = (me: MouseEvent) => updateVol(me.clientX)
                const onUp = () => {
                  window.removeEventListener("mousemove", onMove)
                  window.removeEventListener("mouseup", onUp)
                }
                window.addEventListener("mousemove", onMove)
                window.addEventListener("mouseup", onUp)
              }}
            >
              <div style={{ width: `${volume * 100}%`, height: "100%", backgroundColor: "var(--text-muted)", borderRadius: "2px" }} />
            </div>
            <Link href={`/beat/${ beat.id}`} style={{
              backgroundColor: "var(--gold)", border: "none",
              borderRadius: "3px", padding: "8px 14px",
              color: "#000", fontSize: "0.62rem", fontWeight: 700,
              fontFamily: "var(--font-ui)", letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
            }}>
              License
            </Link>
          </div>
        )}

      </div>
    </>
  )
}