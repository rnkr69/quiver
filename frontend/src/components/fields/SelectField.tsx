import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/api/client'
import { cn } from '@/lib/utils'
import type { FieldProps } from './index'

interface Choice { value: string; label: string }

const baseSelect = 'w-full px-[10px] py-2 rounded border border-gray-200 text-base text-gray-900 font-sans outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed'
const errorSelect = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function SelectField({ field, value, onChange, error, readOnly }: FieldProps) {
  const { t } = useTranslation()
  const [choices, setChoices] = useState<Choice[]>(field.choices ?? [])
  const multiple = field.field_type === 'select_multiple'

  useEffect(() => {
    if (!field.choices_endpoint || field.choices?.length) return
    apiClient.get<Choice[]>(field.choices_endpoint)
      .then(r => setChoices(r.data))
      .catch(() => {})
  }, [field.choices_endpoint])

  const selectedValues: string[] = multiple
    ? (Array.isArray(value) ? (value as string[]) : [])
    : []

  return (
    <div className="flex flex-col gap-1">
      <label className="text-md font-medium text-gray-800">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {multiple ? (
        <select
          multiple
          value={selectedValues}
          onChange={e => onChange(Array.from(e.target.selectedOptions, o => o.value))}
          disabled={readOnly}
          className={cn(baseSelect, 'min-h-[100px]', error && errorSelect)}
        >
          {choices.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      ) : (
        <select
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value || null)}
          disabled={readOnly}
          className={cn(baseSelect, error && errorSelect)}
        >
          <option value="">{t('common.select')}</option>
          {choices.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      )}
      {error && <span className="text-xs text-danger-500">{error}</span>}
      {field.help_text && !error && (
        <span className="text-xs text-gray-500">{field.help_text}</span>
      )}
    </div>
  )
}
