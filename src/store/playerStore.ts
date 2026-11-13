import { create } from "zustand"

export type PlayerBeat = {
  id: string | number
  title: string
  slug?: string
  genre: string
  bpm: number
  preview_url?: string | null
  cover_url?: string | null
  color?: string
}

const HISTORY_KEY = "kp_last_played"
const HISTORY_LIMIT = 12

function loadHistory(): PlayerBeat[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (beat): beat is PlayerBeat =>
              !!beat &&
              typeof beat === "object" &&
              (typeof beat.id === "string" || typeof beat.id === "number") &&
              typeof beat.title === "string",
          )
          .slice(0, HISTORY_LIMIT)
      : []
  } catch {
    return []
  }
}

function saveHistory(history: PlayerBeat[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {}
}

function recordPlay(beat: PlayerBeat, history: PlayerBeat[]) {
  const filtered = history.filter((b) => String(b.id) !== String(beat.id))
  const updated = [beat, ...filtered].slice(0, HISTORY_LIMIT)
  saveHistory(updated)
  return updated
}

function playableBeats(beats: PlayerBeat[]): PlayerBeat[] {
  return [
    ...new Map(
      beats.filter((b) => b.preview_url).map((b) => [String(b.id), b]),
    ).values(),
  ]
}

export function shuffleBeats(beats: PlayerBeat[]): PlayerBeat[] {
  const shuffled = playableBeats(beats)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export type RepeatMode = "off" | "all" | "one"

type PlayerStore = {
  currentBeat: PlayerBeat | null
  isPlaying: boolean
  autoplayBlocked: boolean
  playbackError: string | null
  startRadio: (beats: PlayerBeat[]) => void
  resume: () => void
  playbackBlocked: () => void
  playbackFailed: () => void
  queue: PlayerBeat[]
  orderedQueue: PlayerBeat[]
  shuffleEnabled: boolean
  toggleShuffle: () => void
  repeatMode: RepeatMode
  cycleRepeat: () => void
  finishTrack: () => "stop" | "advance" | "replay"
  currentIndex: number
  volume: number
  progress: number
  duration: number
  lastBeatId: string | number | null
  lastPlayed: PlayerBeat[]
  hasHydratedHistory: boolean
  setQueue: (beats: PlayerBeat[]) => void
  play: (beat: PlayerBeat) => void
  pause: () => void
  toggle: () => void
  restart: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  clearHistory: () => void
  removeFromHistory: (beatId: string | number) => void
  hydrateHistory: () => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentBeat: null,
  isPlaying: false,
  autoplayBlocked: false,
  playbackError: null,
  queue: [],
  orderedQueue: [],
  shuffleEnabled: true,
  repeatMode: "off",
  currentIndex: 0,
  volume: 0.8,
  progress: 0,
  duration: 0,
  lastBeatId: null,
  lastPlayed: [],
  hasHydratedHistory: false,

  startRadio: (beats) => {
    // A route transition, a repeated response, or an intentional pause must never
    // choose a new track or reset the current audio position.
    if (get().currentBeat) return
    const orderedQueue = playableBeats(beats)
    const queue = get().shuffleEnabled ? shuffleBeats(orderedQueue) : orderedQueue
    if (!queue.length) return
    set({
      queue,
      orderedQueue,
      currentIndex: 0,
      currentBeat: queue[0],
      isPlaying: true,
      autoplayBlocked: false,
      playbackError: null,
      progress: 0,
      lastPlayed: recordPlay(queue[0], get().lastPlayed),
    })
  },
  setQueue: (beats) => {
    const orderedQueue = playableBeats(beats)
    const queue = get().shuffleEnabled ? shuffleBeats(orderedQueue) : orderedQueue
    const index = queue.findIndex(
      (b) => String(b.id) === String(get().currentBeat?.id),
    )
    set({ queue, orderedQueue, currentIndex: index >= 0 ? index : -1 })
  },
  toggleShuffle: () => {
    const { shuffleEnabled, orderedQueue, currentBeat } = get()
    const enabled = !shuffleEnabled
    const queue = enabled ? shuffleBeats(orderedQueue) : [...orderedQueue]
    let currentIndex = queue.findIndex((beat) => String(beat.id) === String(currentBeat?.id))
    // A new shuffle cycle starts from the playing track, then visits the others.
    if (enabled && currentIndex >= 0) {
      queue.unshift(...queue.splice(currentIndex, 1))
      currentIndex = 0
    }
    // Preserve the exact currentBeat reference and all audio/playback state.
    set({ shuffleEnabled: enabled, queue, currentIndex })
  },
  cycleRepeat: () => {
    const mode = get().repeatMode
    set({ repeatMode: mode === "off" ? "all" : mode === "all" ? "one" : "off" })
  },
  finishTrack: () => {
    const { currentBeat, currentIndex, queue, repeatMode } = get()
    if (currentBeat && repeatMode === "one") {
      get().restart()
      return "replay"
    }
    if (!currentBeat || !queue.length ||
      (repeatMode === "off" && currentIndex + 1 >= queue.length)) {
      get().pause()
      return "stop"
    }
    // Manual skips remain independent of repeat; only natural endings stop.
    get().next()
    return get().currentBeat?.preview_url === currentBeat.preview_url ? "replay" : "advance"
  },
  resume: () => {
    if (get().currentBeat)
      set({ isPlaying: true, autoplayBlocked: false, playbackError: null })
  },
  playbackBlocked: () =>
    set({ isPlaying: false, autoplayBlocked: true, playbackError: null }),
  playbackFailed: () =>
    set({
      isPlaying: false,
      autoplayBlocked: false,
      playbackError: "This preview could not be loaded — try another beat",
    }),

  play: (beat) => {
    const { queue, currentBeat, lastPlayed } = get()
    if (
      String(currentBeat?.id) === String(beat.id) &&
      currentBeat?.preview_url === beat.preview_url
    ) {
      set({ isPlaying: true, autoplayBlocked: false, playbackError: null })
      return
    }
    const index = queue.findIndex((b) => String(b.id) === String(beat.id))
    set({
      currentBeat: beat,
      isPlaying: true,
      autoplayBlocked: false,
      playbackError: null,
      currentIndex: index >= 0 ? index : -1,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
      lastPlayed: recordPlay(beat, lastPlayed),
    })
  },

  pause: () => set({ isPlaying: false, autoplayBlocked: false }),

  toggle: () => {
    const { isPlaying } = get()
    if (isPlaying) get().pause()
    else get().resume()
  },

  restart: () =>
    set({
      progress: 0,
      isPlaying: true,
      autoplayBlocked: false,
      playbackError: null,
    }),

  next: () => {
    let { queue } = get()
    const { currentIndex, shuffleEnabled } = get()
    const { currentBeat, lastPlayed } = get()
    if (!queue.length) return
    let nextIndex = currentIndex + 1
    if (nextIndex >= queue.length) {
      if (shuffleEnabled) {
        queue = shuffleBeats(queue)
        if (queue.length > 1 && String(queue[0].id) === String(currentBeat?.id))
          [queue[0], queue[1]] = [queue[1], queue[0]]
      }
      nextIndex = 0
    }
    const nextBeat = queue[nextIndex]
    set({
      queue,
      autoplayBlocked: false,
      playbackError: null,
      currentIndex: nextIndex,
      currentBeat: nextBeat,
      isPlaying: true,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
      lastPlayed: recordPlay(nextBeat, lastPlayed),
    })
  },

  prev: () => {
    const {
      queue,
      currentIndex,
      currentBeat,
      progress,
      lastBeatId,
      lastPlayed,
      shuffleEnabled,
    } = get()
    if (!queue.length) return

    if (progress > 3) {
      get().restart()
      return
    }

    if (shuffleEnabled && lastBeatId !== null) {
      const lastIndex = queue.findIndex((b) => b.id === lastBeatId)
      if (lastIndex >= 0) {
        const targetBeat = queue[lastIndex]
        set({
          autoplayBlocked: false,
          playbackError: null,
          currentIndex: lastIndex,
          currentBeat: targetBeat,
          isPlaying: true,
          progress: 0,
          lastBeatId: currentBeat?.id ?? null,
          lastPlayed: recordPlay(targetBeat, lastPlayed),
        })
        return
      }
    }

    const prevIndex =
      (Math.max(0, currentIndex) - 1 + queue.length) % queue.length
    const prevBeat = queue[prevIndex]
    set({
      autoplayBlocked: false,
      playbackError: null,
      currentIndex: prevIndex,
      currentBeat: prevBeat,
      isPlaying: true,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
      lastPlayed: recordPlay(prevBeat, lastPlayed),
    })
  },

  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),

  clearHistory: () => {
    saveHistory([])
    set({ lastPlayed: [] })
  },

  // IDs are UUID strings at runtime, so compare as strings
  removeFromHistory: (beatId) => {
    const updated = get().lastPlayed.filter(
      (b) => String(b.id) !== String(beatId),
    )
    saveHistory(updated)
    set({ lastPlayed: updated })
  },

  hydrateHistory: () => {
    if (get().hasHydratedHistory) return
    set({ lastPlayed: loadHistory(), hasHydratedHistory: true })
  },
}))
