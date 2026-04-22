import { apiClient } from './client'
import type { Role } from './roles.api'

export interface UserListItem {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superuser: boolean
  last_login_at: string | null
  roles: Role[]
}

export interface UserDetail extends UserListItem {
  created_at: string
}

export interface UserCreate {
  email: string
  password: string
  first_name: string
  last_name: string
  is_superuser: boolean
  role_ids: string[]
}

export interface UserUpdate {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  is_superuser?: boolean
  role_ids?: string[]
}

export const usersApi = {
  list: () => apiClient.get<UserListItem[]>('/admin/users').then(r => r.data),

  get: (id: string) => apiClient.get<UserDetail>(`/admin/users/${id}`).then(r => r.data),

  create: (data: UserCreate) => apiClient.post<UserDetail>('/admin/users', data).then(r => r.data),

  update: (id: string, data: UserUpdate) => apiClient.put<UserDetail>(`/admin/users/${id}`, data).then(r => r.data),

  deactivate: (id: string) => apiClient.delete(`/admin/users/${id}`),
}
