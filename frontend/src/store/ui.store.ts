import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface UiState {
  toasts: Toast[]
  sidebarOpen: boolean
}

interface UiActions {
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  toasts: [],
  sidebarOpen: true,

  addToast: (message, variant = 'info') => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
