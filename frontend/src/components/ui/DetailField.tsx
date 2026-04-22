import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DetailFieldProps {
  label: string
  value?: ReactNode
  className?: string
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn('flex flex-col gap-[3px]', className)}>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-base text-gray-900">{value ?? '—'}</span>
    </div>
  )
}
