import { create } from "zustand"

type CartStore = {
  count: number
  setCount: (count: number) => void
}

export const useCartStore = create<CartStore>((set) => ({
  count: 0,
  setCount: (count: number) => set({ count }),
}))