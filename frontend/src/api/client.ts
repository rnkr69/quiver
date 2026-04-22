import axios, { AxiosRequestConfig } from 'axios'
import { getAccessToken } from '@/store/auth.store'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/quiver/v1'

export const apiClient = axios.create({ baseURL: BASE_URL, withCredentials: true })

// Attach access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Queue pattern: if token expires while multiple requests are in flight,
// only one refresh call is made and all queued requests retry with the new token.
let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)))
  queue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
            resolve(apiClient(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const res = await apiClient.post<{ access_token: string }>('/auth/refresh')
      const newToken = res.data.access_token

      // Update the in-memory token via the store action
      const { useAuthStore } = await import('@/store/auth.store')
      const meRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      })
      useAuthStore.getState().setAccessToken(newToken, meRes.data)

      processQueue(null, newToken)
      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      const { useAuthStore } = await import('@/store/auth.store')
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
