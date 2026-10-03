"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useFavorite } from "@/hooks/useFavorites"
import Link from "next/link"

function HeartButton({ beatId }: { beatId: string }) {
  const { favorited, toggle } = useFavorite(beatId)
  return (
    <button
      className="fp-heart"
      onClick={toggle}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
      style={{ color: favorited ? "var(--gold)" : "var(--text-muted)" }}
    >
      {favorited ? "♥" : "♡"}
    </button>
  )
}

export default function FloatingPlayer() {
  const {
    currentBeat, isPlaying,
    pause, toggle, next, prev,
    volume, setVolume,
    progress, setProgress,
    duration, setDuration,
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isSeeking, setIsSeeking] = useState(false)
  const isSeekingRef = useRef(false)
  const lastVolume = useRef(0.8)

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

  // Desktop: click anywhere on the progress bar
  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
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

  // Mobile: drag along the thin line on the top edge of the player
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

  // Click the speaker to mute, click again to restore the old volume
  function toggleMute() {
    if (volume > 0) {
      lastVolume.current = volume
      setVolume(0)
    } else {
      setVolume(lastVolume.current || 0.8)
    }
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

      <div className="fp">

        {/* Mobile seek line (hidden on desktop) */}
        <div
          className="fp-seek"
          onPointerDown={handleMobileSeekPointerDown}
          onPointerMove={handleMobileSeekPointerMove}
          onPointerUp={handleMobileSeekPointerUp}
          onPointerCancel={handleMobileSeekPointerUp}
        >
          <div className="fp-seek-track">
            <div className="fp-seek-fill" style={{ width: `${progressPercent}%` }} />
            {isSeeking && <div className="fp-seek-thumb" style={{ left: `${progressPercent}%` }} />}
          </div>
        </div>

        <div className="fp-bar">

          {/* Left: beat info */}
          <div className="fp-info">
            <div className="fp-cover">
              {beat.cover_url
                ? <img src={beat.cover_url} alt={beat.title} />
                : <span>♪</span>
              }
            </div>

            <div className="fp-text">
              <div className="fp-title-row">
                <span className="fp-title">{beat.title}</span>
                {isPlaying && (
                  <div className="fp-wave">
                    {[1, 2, 3, 4].map((b) => (
                      <div key={b} className={`wave-bar-${b}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="fp-sub">{beat.genre} · {beat.bpm} BPM</div>
            </div>

            <HeartButton beatId={String(beat.id)} />
          </div>

          {/* Center: controls + progress */}
          <div className="fp-center">
            <div className="fp-buttons">
              <button className="fp-skip" onClick={prev} aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4" />
                  <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <button className="fp-play" onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying
                  ? <svg width="13" height="13" viewBox="0 0 12 12" fill="#000"><rect x="1" y="0" width="4" height="12" rx="1" /><rect x="7" y="0" width="4" height="12" rx="1" /></svg>
                  : <span style={{ color: "#000", fontSize: "0.8rem", marginLeft: "2px" }}>▶</span>
                }
              </button>

              <button className="fp-skip" onClick={next} aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20" />
                  <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="fp-progress">
              <span className="fp-time fp-time-left">{formatTime(progress)}</span>
              <div className="fp-track-hit" onClick={handleProgressClick}>
                <div className="fp-track">
                  <div className="fp-track-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <span className="fp-time">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: volume + license */}
          <div className="fp-right">
            <div className="fp-volume">
              <button className="fp-mute" onClick={toggleMute} aria-label="Mute">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
                  {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
                </svg>
              </button>
              <input
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="fp-range"
                aria-label="Volume"
              />
            </div>

            <Link href={`/beat/${(beat as any).slug || ""}`} className="fp-license">
              License
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .fp {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 60;
          background-color: rgba(6,6,6,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(201,168,76,0.25);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.8);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* ── Desktop: three columns, centre column truly centred ── */
        .fp-bar {
          height: 72px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 560px) minmax(0, 1fr);
          align-items: center;
          gap: 28px;
          padding: 0 28px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .fp-info { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .fp-cover {
          width: 46px; height: 46px; border-radius: 6px; flex-shrink: 0; overflow: hidden;
          background-color: var(--bg-elevated);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); font-size: 0.8rem;
        }
        .fp-cover img { width: 100%; height: 100%; object-fit: cover; }
        .fp-text { min-width: 0; }
        .fp-title-row { display: flex; align-items: center; gap: 8px; }
        .fp-title {
          color: var(--text-primary);
          font-family: var(--font-ui); font-size: 0.9rem; font-weight: 700;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 190px;
        }
        .fp-wave { display: flex; align-items: flex-end; gap: 2px; height: 14px; flex-shrink: 0; }
        .fp-wave div {
          width: 2px; height: 12px; background-color: var(--gold);
          border-radius: 2px; transform-origin: bottom;
        }
        .fp-sub {
          color: var(--text-muted);
          font-family: var(--font-ui); font-size: 0.74rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fp-heart {
          background: none; border: none; cursor: pointer;
          font-size: 1.1rem; padding: 4px; flex-shrink: 0; line-height: 1;
          transition: color 0.2s ease;
        }

        .fp-center { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
        .fp-buttons { display: flex; align-items: center; gap: 18px; }
        .fp-skip {
          background: none; border: none; cursor: pointer;
          color: rgba(245,240,232,0.55);
          padding: 4px; display: flex; align-items: center;
          transition: color 0.2s ease;
        }
        .fp-skip:hover { color: var(--text-primary); }
        .fp-play {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #C9A84C, #F5D98B);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }
        .fp-play:hover { transform: scale(1.06); box-shadow: 0 0 18px rgba(201,168,76,0.35); }

        .fp-progress { display: flex; align-items: center; gap: 10px; width: 100%; }
        .fp-time {
          color: var(--text-muted);
          font-family: var(--font-mono); font-size: 0.65rem;
          flex-shrink: 0; min-width: 32px;
        }
        .fp-time-left { text-align: right; }
        /* the hit area is taller than the visible line so it's easy to click */
        .fp-track-hit { flex: 1; height: 16px; display: flex; align-items: center; cursor: pointer; }
        .fp-track {
          width: 100%; height: 4px; border-radius: 2px;
          background-color: rgba(255,255,255,0.12);
          overflow: hidden; transition: height 0.15s ease;
        }
        .fp-track-hit:hover .fp-track { height: 6px; }
        .fp-track-fill {
          height: 100%; background-color: var(--gold);
          border-radius: 2px; transition: width 0.1s linear;
        }

        .fp-right { display: flex; align-items: center; justify-content: flex-end; gap: 18px; min-width: 0; }
        .fp-volume { display: flex; align-items: center; gap: 8px; }
        .fp-mute {
          background: none; border: none; cursor: pointer;
          color: rgba(245,240,232,0.55);
          padding: 4px; display: flex; align-items: center;
          transition: color 0.2s ease;
        }
        .fp-mute:hover { color: var(--text-primary); }
        .fp-range { width: 90px; accent-color: var(--gold); cursor: pointer; }
        .fp-license {
          padding: 9px 20px;
          background: linear-gradient(135deg, #C9A84C, #F5D98B);
          color: #000; text-decoration: none; border-radius: 6px;
          font-family: var(--font-ui); font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;
        }

        /* Mobile seek line: hidden on desktop */
        .fp-seek { display: none; }

        /* ═════════ MOBILE ═════════ */
        @media (max-width: 768px) {
          .fp-bar {
            display: flex;
            height: 56px;
            gap: 10px;
            padding: 0 12px;
          }
          .fp-info { flex: 1 1 auto; gap: 10px; }
          .fp-cover { width: 38px; height: 38px; border-radius: 5px; }
          .fp-title { font-size: 0.84rem; max-width: 150px; }
          .fp-sub { font-size: 0.68rem; }
          .fp-heart { font-size: 1rem; padding: 2px; }

          .fp-center { flex: 0 0 auto; }
          .fp-skip { display: none; }
          .fp-progress { display: none; }
          .fp-play { width: 36px; height: 36px; }

          .fp-right { flex: 0 0 auto; gap: 0; }
          .fp-volume { display: none; }
          .fp-license { padding: 8px 13px; font-size: 0.64rem; border-radius: 5px; }

          /* seek line sits ON the top border: no extra height */
          .fp-seek {
            display: block;
            position: absolute; left: 0; right: 0; top: -9px;
            height: 18px;
            touch-action: none; cursor: pointer;
          }
          .fp-seek-track {
            position: absolute; left: 0; right: 0; top: 8px;
            height: 3px; background: rgba(255,255,255,0.14);
          }
          .fp-seek-fill { height: 100%; background: var(--gold); transition: width 0.1s linear; }
          .fp-seek-thumb {
            position: absolute; top: -4px;
            width: 11px; height: 11px; border-radius: 50%;
            background: var(--gold); transform: translateX(-50%);
            box-shadow: 0 0 8px rgba(0,0,0,0.6);
            pointer-events: none;
          }
        }
      `}</style>
    </>
  )
}