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

test("shuffle defaults on; turning it off preserves playback and follows catalog order", () => {
  reset()
  const player = usePlayerStore.getState()
  assert.equal(player.shuffleEnabled, true)
  player.startRadio(beats)
  player.play(beats[1])
  player.setProgress(27)
  player.setDuration(180)
  player.setVolume(0.4)
  const before = usePlayerStore.getState()
  player.toggleShuffle()
  const after = usePlayerStore.getState()
  assert.equal(after.shuffleEnabled, false)
  assert.equal(after.currentBeat, before.currentBeat)
  assert.equal(after.progress, 27)
  assert.equal(after.duration, 180)
  assert.equal(after.volume, 0.4)
  assert.equal(after.isPlaying, true)
  assert.equal(after.lastPlayed, before.lastPlayed)
  assert.deepEqual(after.queue.map(b => b.id), beats.map(b => b.id))
  for (const id of ["three", "four", "one", "two"]) {
    player.next()
    assert.equal(usePlayerStore.getState().currentBeat?.id, id)
  }
  // Previous follows the ordered queue, not a jump from playback history.
  player.play(beats[3])
  player.play(beats[1])
  player.prev()
  assert.equal(usePlayerStore.getState().currentBeat?.id, "one")
})

test("turning shuffle back on anchors the current beat and visits the rest before repeating", () => {
  reset()
  const original = Math.random
  Math.random = () => 0
  try {
    const player = usePlayerStore.getState()
    player.toggleShuffle()
    player.startRadio(beats)
    player.play(beats[2])
    player.setProgress(19)
    const current = usePlayerStore.getState().currentBeat
    player.toggleShuffle()
    assert.equal(usePlayerStore.getState().currentBeat, current)
    assert.equal(usePlayerStore.getState().progress, 19)
    assert.equal(usePlayerStore.getState().currentIndex, 0)
    const visited = [current!.id]
    for (let i = 1; i < beats.length; i++) {
      player.next()
      visited.push(usePlayerStore.getState().currentBeat!.id)
    }
    assert.equal(new Set(visited).size, beats.length)
    const last = usePlayerStore.getState().currentBeat
    player.next()
    assert.notEqual(usePlayerStore.getState().currentBeat?.id, last?.id)
  } finally { Math.random = original }
})

test("shuffle choice survives new queues and navigation without resuming paused or blocked audio", () => {
  reset()
  const player = usePlayerStore.getState()
  player.startRadio(beats)
  player.setProgress(12)
  player.pause()
  const current = usePlayerStore.getState().currentBeat
  player.toggleShuffle()
  player.startRadio(beats)
  player.setQueue([...beats].reverse())
  assert.equal(usePlayerStore.getState().shuffleEnabled, false)
  assert.equal(usePlayerStore.getState().isPlaying, false)
  assert.equal(usePlayerStore.getState().progress, 12)
  assert.equal(usePlayerStore.getState().currentBeat, current)
  assert.deepEqual(usePlayerStore.getState().queue.map(b => b.id), [...beats].reverse().map(b => b.id))
  player.playbackBlocked()
  player.toggleShuffle()
  assert.equal(usePlayerStore.getState().isPlaying, false)
  assert.equal(usePlayerStore.getState().autoplayBlocked, true)
})

test("both modes handle empty queues, duplicate IDs, unavailable previews and an out-of-queue track", () => {
  reset()
  const player = usePlayerStore.getState()
  player.toggleShuffle()
  player.next()
  player.prev()
  assert.equal(usePlayerStore.getState().currentBeat, null)
  player.startRadio([beats[0], beats[0], { ...beats[1], preview_url: null }])
  assert.deepEqual(usePlayerStore.getState().queue.map(b => b.id), ["one"])
  player.next()
  assert.equal(usePlayerStore.getState().currentBeat?.id, "one")
  player.setQueue([beats[2], beats[3]])
  assert.equal(usePlayerStore.getState().currentIndex, -1)
  player.toggleShuffle()
  player.toggleShuffle()
  assert.equal(usePlayerStore.getState().currentBeat?.id, "one")
  player.next()
  assert.equal(usePlayerStore.getState().currentBeat?.id, "three")
})
