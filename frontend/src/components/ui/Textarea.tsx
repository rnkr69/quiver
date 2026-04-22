import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
}

const baseTextarea = 'w-full px-3 py-2 text-base text-gray-900 font-sans border border-gray-300 rounded outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 disabled:bg-gray-50 transition-shadow duration-150 min-h-[90px] resize-y'
const errorTextarea = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function Textarea({ label, required, error, hint, className, ...props }: TextareaProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 leading-snug">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={cn(baseTextarea, error && errorTextarea)}
      />
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </div>
  )
}
