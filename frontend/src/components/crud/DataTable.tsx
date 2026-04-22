import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { ColumnConfig } from '@/api/crud.api'

interface Props {
  columns: ColumnConfig[]
  data: Record<string, unknown>[]
  isLoading?: boolean
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  selectedIds?: string[]
  onSort?: (key: string) => void
  onSelect?: (ids: string[]) => void
  onRowClick?: (row: Record<string, unknown>) => void
  relatedMap?: Record<string, Record<string, string>>
}

function CellValue({ col, value, relatedMap }: { col: ColumnConfig; value: unknown; relatedMap?: Record<string, Record<string, string>> }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>
  }
  if (col.col_type === 'related') {
    const label = relatedMap?.[col.key]?.[String(value)]
    return <span>{label ?? String(value)}</span>
  }
  if (col.col_type === 'badge' && col.badge_map) {
    const str = String(value)
    const entry = col.badge_map[str]
    if (Array.isArray(entry)) {
      const [label, color] = entry as [string, string]
      return <Badge value={label} color={color as Parameters<typeof Badge>[0]['color'] ?? 'gray'} />
    }
    return <Badge value={str} color={(entry ?? 'gray') as Parameters<typeof Badge>[0]['color']} />
  }
  if (col.col_type === 'boolean') {
    return <Badge value={value ? 'Sí' : 'No'} color={value ? 'green' : 'gray'} />
  }
  if (col.col_type === 'date' || col.col_type === 'datetime') {
    const d = new Date(String(value))
    if (isNaN(d.getTime())) return <span>{String(value)}</span>
    return <span>{col.col_type === 'datetime' ? d.toLocaleString('es') : d.toLocaleDateString('es')}</span>
  }
  if (col.col_type === 'currency') {
    const n = Number(value)
    return <span>{isNaN(n) ? String(value) : n.toLocaleString('es', { style: 'currency', currency: 'EUR' })}</span>
  }
  return <span>{String(value)}</span>
}

const SKELETON_ROWS = 8

export function DataTable({ columns, data, isLoading, sortBy, sortDir, selectedIds = [], onSort, onSelect, onRowClick, relatedMap }: Props) {
  const allIds = data.map(r => String(r.id))
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))

  function toggleAll() {
    if (!onSelect) return
    onSelect(allSelected ? [] : allIds)
  }

  function toggleRow(id: string) {
    if (!onSelect) return
    onSelect(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  const thClass = 'px-3 py-[10px] text-md font-semibold text-gray-700 text-left bg-gray-50 border-b border-gray-200 whitespace-nowrap'
  const tdClass = 'px-3 py-[10px] text-base text-gray-900 border-b border-gray-100 align-middle'

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr>
            {onSelect && (
              <th className={cn(thClass, 'w-10')}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(thClass, col.sortable && 'cursor-pointer')}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {col.sortable && sortBy === col.key && (
                  <span className="ml-1 text-brand-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(SKELETON_ROWS)].map((_, i) => (
                <tr key={i}>
                  {onSelect && <td className={tdClass}><div className="w-4 h-4 bg-gray-100 rounded animate-pulse" /></td>}
                  {columns.map(col => (
                    <td key={col.key} className={tdClass}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length + (onSelect ? 1 : 0)}>
                    <EmptyState title="Sin resultados" description="No hay registros que coincidan con tu búsqueda." />
                  </td>
                </tr>
              )
              : data.map((row, i) => {
                  const id = String(row.id)
                  const isSelected = selectedIds.includes(id)
                  return (
                    <tr
                      key={id ?? i}
                      className={cn(
                        'border-l-[3px] transition-colors',
                        isSelected
                          ? 'bg-brand-50 border-l-brand-500'
                          : 'bg-transparent border-l-transparent hover:bg-gray-50',
                        onRowClick && 'cursor-pointer',
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {onSelect && (
                        <td className={tdClass} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleRow(id)} />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} className={tdClass}>
                          <CellValue col={col} value={row[col.key]} relatedMap={relatedMap} />
                        </td>
                      ))}
                    </tr>
                  )
                })
          }
        </tbody>
      </table>
    </div>
  )
}
