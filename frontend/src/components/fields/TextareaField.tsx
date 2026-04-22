import { cn } from '@/lib/utils'
import type { FieldProps } from './index'

const baseTextarea = 'w-full px-[10px] py-2 rounded border border-gray-200 text-base text-gray-900 font-sans outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow read-only:bg-gray-50 resize-y'
const errorTextarea = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function TextareaField({ field, value, onChange, error, readOnly }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-md font-medium text-gray-800">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <textarea
        value={String(value ?? '')}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        rows={4}
        className={cn(baseTextarea, error && errorTextarea)}
        placeholder={field.help_text ?? ''}
      />
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </div>
  )
}
