import { create } from "zustand"

export type PlayerBeat = {
  id: number
  title: string
  genre: string
  bpm: number
  preview_url?: string | null
  cover_url?: string | null
  color?: string
}

type PlayerStore = {
  currentBeat: PlayerBeat | null
  isPlaying: boolean
  queue: PlayerBeat[]
  currentIndex: number
  volume: number
  progress: number
  duration: number
  lastBeatId: number | null        // track previous beat for double-prev
  setQueue: (beats: PlayerBeat[]) => void
  play: (beat: PlayerBeat) => void
  pause: () => void
  toggle: () => void
  restart: () => void              // restart current beat from beginning
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentBeat: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  volume: 0.8,
  progress: 0,
  duration: 0,
  lastBeatId: null,

  setQueue: (beats) => {
    const shuffled = [...beats].sort(() => Math.random() - 0.5)
    set({ queue: shuffled, currentIndex: 0, currentBeat: shuffled[0] })
  },

  play: (beat) => {
    const { queue, currentBeat } = get()
    const index = queue.findIndex((b) => b.id === beat.id)
    // If clicking the same beat that's already loaded, restart from beginning
    set({
      currentBeat: beat,
      isPlaying: true,
      currentIndex: index >= 0 ? index : 0,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
    })
  },

  pause: () => set({ isPlaying: false }),

  toggle: () => {
    const { isPlaying } = get()
    set({ isPlaying: !isPlaying })
  },

  restart: () => set({ progress: 0, isPlaying: true }),

  next: () => {
    const { queue, currentIndex, currentBeat } = get()
    if (!queue.length) return
    const nextIndex = (currentIndex + 1) % queue.length
    set({
      currentIndex: nextIndex,
      currentBeat: queue[nextIndex],
      isPlaying: true,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
    })
  },

  prev: () => {
    const { queue, currentIndex, currentBeat, progress, lastBeatId } = get()
    if (!queue.length) return

    // If more than 3 seconds in, restart current beat
    if (progress > 3) {
      set({ progress: 0, isPlaying: true })
      return
    }

    // If within first 3 seconds and we have a lastBeatId, go to that beat
    if (lastBeatId !== null) {
      const lastIndex = queue.findIndex((b) => b.id === lastBeatId)
      if (lastIndex >= 0) {
        set({
          currentIndex: lastIndex,
          currentBeat: queue[lastIndex],
          isPlaying: true,
          progress: 0,
          lastBeatId: currentBeat?.id ?? null,
        })
        return
      }
    }

    // Fallback: go to previous in queue
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length
    set({
      currentIndex: prevIndex,
      currentBeat: queue[prevIndex],
      isPlaying: true,
      progress: 0,
      lastBeatId: currentBeat?.id ?? null,
    })
  },

  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
}))
