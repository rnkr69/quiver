import { apiClient } from './client'

export interface MenuItemEntry {
  type: 'item'
  label: string
  route: string
  icon?: string | null
}

export interface MenuGroupEntry {
  type: 'group'
  title: string
  icon?: string | null
  items: Array<{ label: string; route: string; icon?: string | null }>
}

export type MenuEntry = MenuItemEntry | MenuGroupEntry

export async function fetchMenuApi(): Promise<MenuEntry[]> {
  const res = await apiClient.get<MenuEntry[]>('/admin/menu')
  return res.data
}
