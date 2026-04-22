import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
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
  relatedMap?: Record<string, Record<string, string>>  // { colKey: { rawValue: displayLabel } }
}

function CellValue({ col, value, relatedMap }: { col: ColumnConfig; value: unknown; relatedMap?: Record<string, Record<string, string>> }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--gray-400)' }}>—</span>
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

  const th: React.CSSProperties = {
    padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)',
    textAlign: 'left', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)',
    whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    padding: '10px 12px', fontSize: 14, color: 'var(--gray-900)',
    borderBottom: '1px solid var(--gray-100)', verticalAlign: 'middle',
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr>
            {onSelect && (
              <th style={{ ...th, width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: 'var(--brand-500)' }} />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                style={{ ...th, cursor: col.sortable ? 'pointer' : 'default' }}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {col.sortable && sortBy === col.key && (
                  <span style={{ marginLeft: 4, color: 'var(--brand-500)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(SKELETON_ROWS)].map((_, i) => (
                <tr key={i}>
                  {onSelect && <td style={td}><div style={{ width: 16, height: 16, background: 'var(--gray-100)', borderRadius: 3, animation: 'pulse 1.5s ease-in-out infinite' }} /></td>}
                  {columns.map(col => (
                    <td key={col.key} style={td}>
                      <div style={{ height: 16, background: 'var(--gray-100)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', width: '80%' }} />
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
                      style={{
                        background: isSelected ? 'var(--brand-50)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--brand-500)' : '3px solid transparent',
                        cursor: onRowClick ? 'pointer' : 'default',
                      }}
                      onClick={() => onRowClick?.(row)}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--gray-50)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      {onSelect && (
                        <td style={td} onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            style={{ accentColor: 'var(--brand-500)' }}
                          />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} style={td}>
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
