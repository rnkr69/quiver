import { apiClient } from './client'

export interface PortalWelcomeResponse {
  message: string
  version?: string
  env?: string
  user?: {
    name: string
    roles: string[]
  }
}

export interface PortalProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  created_at: string
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  current_password?: string
  new_password?: string
}

export const portalApi = {
  getWelcome: () => apiClient.get<PortalWelcomeResponse>('/portal/'),

  getProfile: () => apiClient.get<PortalProfile>('/portal/me'),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<PortalProfile>('/portal/me', data),
}
