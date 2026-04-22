import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'active' | 'inactive' | 'success' | 'danger' | 'warning' | 'admin' | 'client'
  | 'green' | 'red' | 'gray' | 'amber' | 'blue'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  active:   'bg-brand-50 text-brand-700 border border-brand-100',
  inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
  success:  'bg-success-50 text-success-500 border border-[#c3e6d7]',
  danger:   'bg-danger-50 text-danger-500 border border-[#f5c6c6]',
  warning:  'bg-warning-50 text-warning-500 border border-[#f0d9a0]',
  admin:    'bg-[#1a1a2e] text-white',
  client:   'bg-brand-50 text-brand-700 border border-brand-100',
  green:    'bg-success-50 text-success-500 border border-[#c3e6d7]',
  red:      'bg-danger-50 text-danger-500 border border-[#f5c6c6]',
  gray:     'bg-gray-100 text-gray-600 border border-gray-200',
  amber:    'bg-warning-50 text-warning-500 border border-[#f0d9a0]',
  blue:     'bg-brand-50 text-brand-700 border border-brand-100',
}

interface BadgeProps {
  variant?: BadgeVariant
  color?: BadgeVariant
  children?: ReactNode
  value?: string
}

export function Badge({ variant, color, children, value }: BadgeProps) {
  const v = variant ?? color ?? 'inactive'
  return (
    <span className={cn(
      'text-sm font-medium leading-snug px-2 py-0.5 rounded whitespace-nowrap inline-block',
      VARIANT_CLASSES[v] ?? VARIANT_CLASSES.inactive,
    )}>
      {children ?? value}
    </span>
  )
}
