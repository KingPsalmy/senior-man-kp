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
  setQueue: (beats: PlayerBeat[]) => void
  play: (beat: PlayerBeat) => void
  pause: () => void
  toggle: () => void
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

  setQueue: (beats) => {
    const shuffled = [...beats].sort(() => Math.random() - 0.5)
    set({ queue: shuffled, currentIndex: 0, currentBeat: shuffled[0] })
  },

  play: (beat) => {
    const { queue } = get()
    const index = queue.findIndex((b) => b.id === beat.id)
    set({ currentBeat: beat, isPlaying: true, currentIndex: index >= 0 ? index : 0, progress: 0 })
  },

  pause: () => set({ isPlaying: false }),

  toggle: () => {
    const { isPlaying } = get()
    set({ isPlaying: !isPlaying })
  },

  next: () => {
    const { queue, currentIndex } = get()
    if (!queue.length) return
    const nextIndex = (currentIndex + 1) % queue.length
    set({ currentIndex: nextIndex, currentBeat: queue[nextIndex], isPlaying: true, progress: 0 })
  },

  prev: () => {
    const { queue, currentIndex } = get()
    if (!queue.length) return
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length
    set({ currentIndex: prevIndex, currentBeat: queue[prevIndex], isPlaying: true, progress: 0 })
  },

  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
}))