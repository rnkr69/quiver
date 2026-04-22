import { cn } from '@/lib/utils'
import type { FieldProps } from './index'

const baseInput = 'w-full px-[10px] py-2 rounded border border-gray-200 text-base text-gray-900 font-sans outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow read-only:bg-gray-50'
const errorInput = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function NumberField({ field, value, onChange, error, readOnly }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-md font-medium text-gray-800">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <input
        type="number"
        value={value === null || value === undefined ? '' : String(value)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        readOnly={readOnly}
        className={cn(baseInput, error && errorInput)}
      />
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </div>
  )
}
