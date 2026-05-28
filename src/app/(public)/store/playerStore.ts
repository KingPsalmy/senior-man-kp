import { create } from "zustand"

export type Beat = {
  id: number
  title: string
  genre: string
  bpm: number
  color: string
  preview_url?: string | null
  cover_url?: string | null
}

type PlayerStore = {
  currentBeat: Beat | null
  isPlaying: boolean
  queue: Beat[]
  currentIndex: number
  volume: number
  progress: number
  duration: number
  play: (beat: Beat) => void
  pause: () => void
  resume: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  setQueue: (beats: Beat[]) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentBeat: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  volume: 0.8,
  progress: 0,
  duration: 0,

  play: (beat) => {
    const { queue } = get()
    const index = queue.findIndex((b) => b.id === beat.id)
    set({
      currentBeat: beat,
      isPlaying: true,
      currentIndex: index >= 0 ? index : 0,
      progress: 0,
    })
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  toggle: () => {
    const { isPlaying } = get()
    set({ isPlaying: !isPlaying })
  },

  next: () => {
    const { queue, currentIndex } = get()
    if (!queue.length) return
    const nextIndex = (currentIndex + 1) % queue.length
    set({
      currentIndex: nextIndex,
      currentBeat: queue[nextIndex],
      isPlaying: true,
      progress: 0,
      duration: 0,
    })
  },

  prev: () => {
    const { queue, currentIndex } = get()
    if (!queue.length) return
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length
    set({
      currentIndex: prevIndex,
      currentBeat: queue[prevIndex],
      isPlaying: true,
      progress: 0,
      duration: 0,
    })
  },

  setQueue: (beats) => {
    const shuffled = [...beats].sort(() => Math.random() - 0.5)
    set({ queue: shuffled, currentBeat: shuffled[0], currentIndex: 0, isPlaying: true })
  },

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
}))