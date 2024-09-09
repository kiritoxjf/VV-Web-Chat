import { create } from 'zustand'

type State = {
  counter: number
}

type Action = {
  increment: () => void
  decrement: () => void
}

export const useStore = create<State & Action>((set) => {
  return {
    counter: 0,
    increment: () => set((state) => ({ counter: state.counter + 1 })),
    decrement: () => set((state) => ({ counter: state.counter - 1 }))
  }
})
