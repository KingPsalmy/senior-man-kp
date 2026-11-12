"use client"

import { useCallback, useEffect, useReducer } from "react"
import { initialPortraitState, nextPortrait, portraitReducer } from "@/lib/portrait-rotation"

export function usePortraitRotation(count: number, running: boolean) {
  const [state, dispatch] = useReducer(portraitReducer, initialPortraitState)
  const selectPortrait = useCallback((index: number) => dispatch({ type: "select", index }), [])
  const onPortraitLoad = useCallback((index: number) => dispatch({ type: "loaded", index }), [])
  const onPortraitError = useCallback((index: number) => dispatch({ type: "failed", index }), [])
  const activeReady = state.loaded.includes(state.active)
  const activeFailed = state.failed.includes(state.active)
  const next = nextPortrait(state, count)

  useEffect(() => {
    if (activeFailed && next !== state.active) {
      // Recover from a failed first picture without waiting for a rotation.
      const recovery = window.setTimeout(() => selectPortrait(next), 0)
      return () => window.clearTimeout(recovery)
    }
    if (!running || !activeReady || next === state.active) return
    // Give the visible page a head start, then warm just the next portrait.
    const preload = window.setTimeout(() => dispatch({ type: "request", index: next }), 5000)
    const rotate = window.setTimeout(() => selectPortrait(next), 25000)
    return () => { window.clearTimeout(preload); window.clearTimeout(rotate) }
  }, [running, activeReady, activeFailed, state.active, next, selectPortrait])

  return { portrait: state.active, requestedPortraits: state.requested, selectPortrait, onPortraitLoad, onPortraitError }
}
