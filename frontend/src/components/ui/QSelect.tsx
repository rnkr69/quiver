import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string | number
  label: string
}

interface QSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  error?: string
  options?: (SelectOption | string)[]
  className?: string
}

const baseSelect = 'w-full px-3 py-2 text-base text-gray-900 font-sans border border-gray-300 rounded outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow duration-150 cursor-pointer'
const errorSelect = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function QSelect({ label, required, error, options = [], className, ...props }: QSelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        {...props}
        className={cn(baseSelect, error && errorSelect)}
      >
        {options.map(o => {
          const val = typeof o === 'string' ? o : String(o.value)
          const lbl = typeof o === 'string' ? o : o.label
          return <option key={val} value={val}>{lbl}</option>
        })}
        {props.children}
      </select>
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </div>
  )
}
