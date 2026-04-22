import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { apiClient } from '@/api/client'
import type { AuthUser } from '@/store/auth.store'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAccessToken, logout: storeLogout } = useAuthStore()

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    const meRes = await apiClient.get<AuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    })
    setAccessToken(res.data.access_token, meRes.data)
    return res.data
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    storeLogout()
  }

  return { user, isAuthenticated, isLoading, login, logout }
}
