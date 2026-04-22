import { create } from 'zustand'
import type { MenuEntry } from '@/api/menu.api'

interface MenuState {
  items: MenuEntry[]
  isLoaded: boolean
}

interface MenuActions {
  fetchMenu: () => Promise<void>
  reset: () => void
}

export const useMenuStore = create<MenuState & MenuActions>((set) => ({
  items: [],
  isLoaded: false,

  fetchMenu: async () => {
    try {
      const { fetchMenuApi } = await import('@/api/menu.api')
      const items = await fetchMenuApi()
      set({ items, isLoaded: true })
    } catch {
      set({ items: [], isLoaded: false })
    }
  },

  reset: () => set({ items: [], isLoaded: false }),
}))
