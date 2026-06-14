import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getFieldComponent } from '@/components/fields'
import { Button } from '@/components/ui/Button'
import type { FieldConfig } from '@/api/crud.api'

interface Props {
  fields: FieldConfig[]
  initialValues?: Record<string, unknown>
  mode: 'create' | 'edit' | 'show'
  loading?: boolean
  onSubmit?: (values: Record<string, unknown>) => void
  onCancel?: () => void
}

function buildDefaults(fields: FieldConfig[], initial?: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.field_type === 'hidden') continue
    result[f.key] = initial?.[f.key] ?? f.default ?? null
  }
  return result
}

export function CrudForm({ fields, initialValues, mode, loading, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()
  const [values, setValues] = useState<Record<string, unknown>>(() => buildDefaults(fields, initialValues))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const readOnly = mode === 'show'
  const visibleFields = fields.filter(f => f.field_type !== 'hidden' && !(readOnly && f.read_only))

  function validate(): boolean {
    const errs: Record<string, string> = {}
    for (const f of fields) {
      if (f.required && (values[f.key] === null || values[f.key] === undefined || values[f.key] === '')) {
        errs[f.key] = t('crud.fieldRequired', { label: f.label })
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (readOnly) return
    if (!validate()) return
    const payload: Record<string, unknown> = {}
    for (const f of fields) {
      const v = values[f.key]
      if (f.field_type === 'password' && (v === null || v === '')) continue
      payload[f.key] = v
    }
    onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-4 mb-6">
        {visibleFields.map(field => {
          const Component = getFieldComponent(field.field_type)
          return (
            <Component
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={v => setValues(prev => ({ ...prev, [field.key]: v }))}
              error={errors[field.key]}
              readOnly={readOnly || field.read_only}
            />
          )
        })}
      </div>
      {!readOnly && (
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            {mode === 'create' ? t('common.create') : t('common.saveChanges')}
          </Button>
        </div>
      )}
    </form>
  )
}
