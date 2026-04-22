import { cn } from '@/lib/utils'
import type { FieldProps } from './index'

export function CheckboxField({ field, value, onChange, readOnly }: FieldProps) {
  return (
    <label className={cn('flex items-center gap-2', readOnly ? 'cursor-default' : 'cursor-pointer')}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={e => onChange(e.target.checked)}
        disabled={readOnly}
        className="w-4 h-4"
      />
      <span className="text-base text-gray-900">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </span>
    </label>
  )
}
