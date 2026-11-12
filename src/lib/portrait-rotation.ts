export type PortraitState = {
  active: number
  requested: number[]
  loaded: number[]
  failed: number[]
  pending: number | null
}

export const initialPortraitState: PortraitState = {
  active: 0, requested: [0], loaded: [], failed: [], pending: null,
}

type Action = { type: "request" | "select" | "loaded" | "failed"; index: number }
const include = (values: number[], index: number) => values.includes(index) ? values : [...values, index]

export function portraitReducer(state: PortraitState, { type, index }: Action): PortraitState {
  switch (type) {
    case "request":
      return state.requested.includes(index) ? state : { ...state, requested: include(state.requested, index) }
    case "select":
      if (state.failed.includes(index)) return state
      return {
        ...state,
        requested: include(state.requested, index),
        active: state.loaded.includes(index) ? index : state.active,
        pending: state.loaded.includes(index) ? null : index,
      }
    case "loaded":
      if (state.loaded.includes(index) && state.pending !== index) return state
      return {
        ...state,
        loaded: include(state.loaded, index),
        active: state.pending === index ? index : state.active,
        pending: state.pending === index ? null : state.pending,
      }
    case "failed":
      return { ...state, failed: include(state.failed, index), pending: state.pending === index ? null : state.pending }
  }
}

export function nextPortrait(state: PortraitState, count: number) {
  for (let offset = 1; offset < count; offset++) {
    const index = (state.active + offset) % count
    if (!state.failed.includes(index)) return index
  }
  return state.active
}
