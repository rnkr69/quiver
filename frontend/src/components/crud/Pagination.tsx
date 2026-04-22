import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', fontSize: 13, fontFamily: 'inherit',
    background: disabled ? 'transparent' : 'transparent',
    color: disabled ? 'var(--gray-300)' : 'var(--gray-700)',
    border: '1px solid transparent', borderRadius: 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', fontSize: 13, color: 'var(--gray-600)',
    }}>
      <span>{from}–{to} de {total}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          style={btnStyle(page <= 1)}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          onMouseEnter={e => { if (page > 1) e.currentTarget.style.background = 'var(--gray-100)' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <span style={{
          padding: '5px 10px', fontSize: 13,
          background: 'var(--brand-50)', color: 'var(--brand-700)',
          borderRadius: 4, fontWeight: 500, minWidth: 64, textAlign: 'center',
        }}>
          {page} / {totalPages}
        </span>

        <button
          style={btnStyle(page >= totalPages)}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          onMouseEnter={e => { if (page < totalPages) e.currentTarget.style.background = 'var(--gray-100)' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
