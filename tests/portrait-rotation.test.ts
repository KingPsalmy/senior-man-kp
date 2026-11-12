import test from "node:test"
import assert from "node:assert/strict"
import { initialPortraitState, nextPortrait, portraitReducer } from "../src/lib/portrait-rotation"

test("only the first portrait loads initially; switching waits for the next image", () => {
  assert.deepEqual(initialPortraitState.requested, [0])
  let state = portraitReducer(initialPortraitState, { type: "loaded", index: 0 })
  assert.equal(portraitReducer(state, { type: "loaded", index: 0 }), state)
  state = portraitReducer(state, { type: "request", index: 1 })
  assert.equal(state.active, 0)
  assert.deepEqual(state.requested, [0, 1])
  state = portraitReducer(state, { type: "select", index: 1 })
  assert.equal(state.active, 0)
  state = portraitReducer(state, { type: "loaded", index: 1 })
  assert.equal(state.active, 1)
  assert.equal(nextPortrait(state, 3), 2)
})

test("late image loads cannot override a newer manual choice", () => {
  let state = portraitReducer(initialPortraitState, { type: "loaded", index: 0 })
  state = portraitReducer(state, { type: "select", index: 1 })
  state = portraitReducer(state, { type: "select", index: 2 })
  state = portraitReducer(state, { type: "loaded", index: 1 })
  assert.equal(state.active, 0)
  state = portraitReducer(state, { type: "loaded", index: 2 })
  assert.equal(state.active, 2)
  assert.equal(nextPortrait(state, 3), 0)
})

test("failed portraits do not replace a visible picture or block the remaining ones", () => {
  let state = portraitReducer(initialPortraitState, { type: "loaded", index: 0 })
  state = portraitReducer(state, { type: "select", index: 1 })
  state = portraitReducer(state, { type: "failed", index: 1 })
  assert.equal(state.active, 0)
  assert.equal(state.pending, null)
  assert.equal(nextPortrait(state, 3), 2)
})
