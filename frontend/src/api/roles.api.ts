import { apiClient } from './client'

export interface Permission {
  id: string
  name: string
  display_name: string
  group: string
}

export interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  permissions_count: number
  users_count: number
}

export interface RoleDetail {
  id: string
  name: string
  display_name: string
  description: string | null
  permissions: Permission[]
}

export interface RoleCreate {
  name: string
  display_name: string
}

export interface RoleUpdate {
  display_name?: string
}

export const rolesApi = {
  list: () => apiClient.get<Role[]>('/admin/roles').then(r => r.data),

  get: (id: string) => apiClient.get<RoleDetail>(`/admin/roles/${id}`).then(r => r.data),

  create: (data: RoleCreate) => apiClient.post<Role>('/admin/roles', data).then(r => r.data),

  update: (id: string, data: RoleUpdate) => apiClient.put<Role>(`/admin/roles/${id}`, data).then(r => r.data),

  delete: (id: string) => apiClient.delete(`/admin/roles/${id}`),

  listPermissions: () =>
    apiClient.get<{ group: string; permissions: Permission[] }[]>('/admin/permissions')
      .then(r => r.data.flatMap(g => g.permissions)),

  setPermissions: (roleId: string, permissionIds: string[]) =>
    apiClient.put(`/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds }).then(r => r.data),
}
