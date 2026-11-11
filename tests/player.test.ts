import test from "node:test"
import assert from "node:assert/strict"
import {
  shuffleBeats,
  usePlayerStore,
  type PlayerBeat,
} from "../src/store/playerStore"
const beats: PlayerBeat[] = ["one", "two", "three", "four"].map((id) => ({
  id,
  title: id,
  genre: "Afrobeat",
  bpm: 100,
  preview_url: `https://example.com/${id}.mp3`,
}))
function reset() {
  usePlayerStore.setState(usePlayerStore.getInitialState())
}

test("radio starts a shuffled playable queue and visits every beat before repeating", () => {
  reset()
  const original = Math.random
  Math.random = () => 0
  try {
    const queue = shuffleBeats([
      ...beats,
      beats[0],
      { ...beats[0], id: "unplayable", preview_url: null },
    ])
    assert.equal(queue.length, 4)
    assert.notDeepEqual(
      queue.map((b) => b.id),
      beats.map((b) => b.id),
    )
    usePlayerStore.getState().startRadio(beats)
    const visited = []
    for (let i = 0; i < 4; i++) {
      visited.push(usePlayerStore.getState().currentBeat!.id)
      if (i < 3) usePlayerStore.getState().next()
    }
    assert.equal(new Set(visited).size, 4)
    const previous = usePlayerStore.getState().currentBeat!.id
    usePlayerStore.getState().next()
    assert.notEqual(usePlayerStore.getState().currentBeat!.id, previous)
  } finally {
    Math.random = original
  }
})
test("re-entering home/store and replaying the current selection preserve playback position", () => {
  reset()
  usePlayerStore.getState().startRadio(beats)
  const current = usePlayerStore.getState().currentBeat!
  usePlayerStore.getState().setProgress(27)
  usePlayerStore.getState().startRadio([...beats].reverse())
  assert.equal(usePlayerStore.getState().currentBeat, current)
  assert.equal(usePlayerStore.getState().progress, 27)
  usePlayerStore.getState().setQueue(beats)
  usePlayerStore.getState().play({ ...current })
  assert.equal(usePlayerStore.getState().progress, 27)
  assert.equal(usePlayerStore.getState().currentBeat, current)
})
test("browser autoplay rejection is recoverable, while deliberate pause survives navigation", () => {
  reset()
  usePlayerStore.getState().startRadio(beats)
  usePlayerStore.getState().playbackBlocked()
  assert.equal(usePlayerStore.getState().isPlaying, false)
  assert.equal(usePlayerStore.getState().autoplayBlocked, true)
  usePlayerStore.getState().resume()
  usePlayerStore.getState().setProgress(12)
  usePlayerStore.getState().pause()
  usePlayerStore.getState().startRadio(beats)
  assert.equal(usePlayerStore.getState().isPlaying, false)
  assert.equal(usePlayerStore.getState().autoplayBlocked, false)
  assert.equal(usePlayerStore.getState().progress, 12)
})
