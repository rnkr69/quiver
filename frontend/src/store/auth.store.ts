import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  permissions: string[]
  is_superuser: boolean
}

// accessToken lives outside Zustand state — never serialized, never logged
let _accessToken: string | null = null

export function getAccessToken(): string | null {
  return _accessToken
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setAccessToken: (token: string, user: AuthUser) => void
  logout: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAccessToken: (token, user) => {
    _accessToken = token
    set({ user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    _accessToken = null
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  hydrate: async () => {
    try {
      const { apiClient } = await import('@/api/client')
      const res = await apiClient.post<{ access_token: string }>('/auth/refresh')
      const meRes = await apiClient.get<AuthUser>('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      })
      _accessToken = res.data.access_token
      set({ user: meRes.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
