"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronUp, Heart, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react"
import CoverImage from "@/components/ui/CoverImage"
import { useFavorite } from "@/hooks/useFavorites"
import { usePlayerStore, type PlayerBeat } from "@/store/playerStore"
import "./mobile-player.css"

function time(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00"
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`
}

export default function MobilePlayer({ beat, onToggle, onSeek }: {
  beat: PlayerBeat
  onToggle: () => void
  onSeek: (seconds: number) => void
}) {
  const { isPlaying, next, prev, shuffleEnabled, toggleShuffle, repeatMode,
    cycleRepeat, progress, duration, autoplayBlocked, playbackError } = usePlayerStore()
  const { favorited, toggle: toggleFavorite } = useFavorite(String(beat.id))
  const [expanded, setExpanded] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const expandButton = useRef<HTMLButtonElement>(null)
  const repeatLabel = `Repeat ${repeatMode} — switch to ${repeatMode === "off" ? "repeat all" : repeatMode === "all" ? "repeat one" : "repeat off"}`
  const playableDuration = Number.isFinite(duration) && duration > 0 ? duration : 0

  useEffect(() => {
    if (!expanded) return
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setExpanded(false)
    }
    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [expanded])

  return (
    <div className="mobile-player" ref={root} onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        event.stopPropagation()
        setExpanded(false)
        expandButton.current?.focus()
      }
    }}>
      <div id="mobile-player-options" className="mp-panel" hidden={!expanded}
        role="region" aria-label="Playback options"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          // Settings must not activate the document's blocked-autoplay retry.
          if (event.key === "Enter" || event.key === " ") event.stopPropagation()
        }}>
        <div className="mp-panel-heading">
          <span>Playback</span>
          <Link href={beat.slug ? `/beatstore/${beat.slug}` : "/beatstore/beats"}
            className="fp-license" onClick={() => setExpanded(false)}>License beat</Link>
        </div>
        <div className="mp-seek-row">
          <span>{time(progress)}</span>
          <input type="range" min={0} max={playableDuration || 1} step={0.1}
            value={Math.min(playableDuration, Math.max(0, progress || 0))}
            disabled={!playableDuration} aria-label="Playback position"
            aria-valuetext={`${time(progress)} of ${time(duration)}`}
            onChange={(event) => onSeek(Number(event.target.value))} />
          <span>{time(duration)}</span>
        </div>
        <div className="mp-options">
          <button type="button" onClick={toggleShuffle} aria-label="Shuffle"
            aria-pressed={shuffleEnabled} title={shuffleEnabled ? "Turn shuffle off" : "Turn shuffle on"}>
            <Shuffle size={19} aria-hidden="true" /><span>Shuffle</span>
          </button>
          <button type="button" onClick={prev} aria-label="Previous beat">
            <SkipBack size={19} aria-hidden="true" /><span>Previous</span>
          </button>
          <button type="button" onClick={cycleRepeat} aria-label={repeatLabel}
            title={repeatLabel} data-active={repeatMode !== "off"}>
            {repeatMode === "one" ? <Repeat1 size={19} aria-hidden="true" /> : <Repeat size={19} aria-hidden="true" />}
            <span>Repeat {repeatMode}</span>
          </button>
          <button type="button" onClick={toggleFavorite} aria-label="Favorite"
            aria-pressed={favorited}>
            <Heart size={19} fill={favorited ? "currentColor" : "none"} aria-hidden="true" /><span>Favorite</span>
          </button>
        </div>
      </div>

      <div className="mp-bar">
        <div className="mp-info">
          <div className="mp-cover">
            {beat.cover_url ? <CoverImage src={beat.cover_url} sizes="40px" alt="" /> : <span>♪</span>}
          </div>
          <div className="mp-text">
            <div className="mp-title" title={beat.title}>{beat.title}</div>
            <div className="mp-sub" role={autoplayBlocked || playbackError ? "status" : undefined}>
              {playbackError || (autoplayBlocked ? "Tap play to start" : `${beat.genre} · ${beat.bpm} BPM`)}
            </div>
          </div>
        </div>
        <button type="button" className="mp-control mp-play" onClick={onToggle}
          aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={19} fill="currentColor" aria-hidden="true" /> : <Play size={19} fill="currentColor" aria-hidden="true" />}
        </button>
        <button type="button" className="mp-control" onClick={next} aria-label="Next beat">
          <SkipForward size={20} aria-hidden="true" />
        </button>
        <button type="button" className="mp-control mp-expand" ref={expandButton}
          aria-label={expanded ? "Collapse player controls" : "Expand player controls"}
          aria-expanded={expanded} aria-controls="mobile-player-options"
          onClick={(event) => { event.stopPropagation(); setExpanded(!expanded) }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") event.stopPropagation()
          }}>
          <ChevronUp size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
