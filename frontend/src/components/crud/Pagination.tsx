import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <div className="flex items-center justify-between py-3 text-md text-gray-600">
      <span>{from}–{to} de {total}</span>
      <div className="flex gap-1 items-center">
        <button
          className={cn(
            'inline-flex items-center gap-1 px-[10px] py-[5px] text-md bg-transparent border border-transparent rounded font-sans transition-colors',
            page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 cursor-pointer hover:bg-gray-100',
          )}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        <span className="px-[10px] py-[5px] text-md bg-brand-50 text-brand-700 rounded font-medium min-w-16 text-center">
          {page} / {totalPages}
        </span>

        <button
          className={cn(
            'inline-flex items-center gap-1 px-[10px] py-[5px] text-md bg-transparent border border-transparent rounded font-sans transition-colors',
            page >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 cursor-pointer hover:bg-gray-100',
          )}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
