import { apiClient } from './client'

export interface ColumnConfig {
  key: string
  label: string
  col_type: string
  sortable?: boolean
  badge_map?: Record<string, string | [string, string]>  // string = color-only, [label, color] = full
  choices_endpoint?: string  // for col_type="related"
}

export interface FieldConfig {
  key: string
  label: string
  field_type: string
  required?: boolean
  help_text?: string
  read_only?: boolean
  default?: unknown
  choices?: Array<{ value: string; label: string }>
  choices_endpoint?: string
  min?: number
  max?: number
  step?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: string
  choices?: Array<{ value: string; label: string }>
}

export interface CrudConfig {
  resource: string
  title?: string
  columns: ColumnConfig[]
  fields: FieldConfig[]
  filters: FilterConfig[]
  permissions: Record<string, boolean>
  order_by?: string
  page_size?: number
  bulk_actions?: string[]
}

export interface ListResponse<T = Record<string, unknown>> {
  items: T[]
  total: number
  page: number
  page_size: number
}

const BASE = (resource: string) => `/admin/${resource}`

export const crudApi = {
  getConfig: (resource: string) =>
    apiClient.get<CrudConfig>(`${BASE(resource)}/config`).then(r => r.data),

  list: (resource: string, params?: Record<string, unknown>) =>
    apiClient.get<ListResponse>(`${BASE(resource)}/`, { params }).then(r => r.data),

  get: (resource: string, id: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE(resource)}/${id}`).then(r => r.data),

  create: (resource: string, data: unknown) =>
    apiClient.post<Record<string, unknown>>(`${BASE(resource)}/`, data).then(r => r.data),

  update: (resource: string, id: string, data: unknown) =>
    apiClient.put<Record<string, unknown>>(`${BASE(resource)}/${id}`, data).then(r => r.data),

  remove: (resource: string, id: string) =>
    apiClient.delete(`${BASE(resource)}/${id}`),

  bulkRemove: (resource: string, ids: string[]) =>
    apiClient.delete(`${BASE(resource)}/`, { data: { ids } }),

  getChoices: (resource: string, field: string) =>
    apiClient.get<Array<{ value: string; label: string }>>(`${BASE(resource)}/choices`, { params: { field } }).then(r => r.data),
}
