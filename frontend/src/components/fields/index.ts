import type { ComponentType } from 'react'
import type { FieldConfig } from '@/api/crud.api'

export interface FieldProps {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  readOnly?: boolean
}

import { TextField } from './TextField'
import { SelectField } from './SelectField'
import { DateField } from './DateField'
import { CheckboxField } from './CheckboxField'
import { NumberField } from './NumberField'
import { TextareaField } from './TextareaField'
import { HiddenField } from './HiddenField'

const registry = new Map<string, ComponentType<FieldProps>>([
  ['text',             TextField],
  ['email',            TextField],
  ['password',         TextField],
  ['number',           NumberField],
  ['textarea',         TextareaField],
  ['select',           SelectField],
  ['select_multiple',  SelectField],
  ['checkbox',         CheckboxField],
  ['date',             DateField],
  ['datetime',         DateField],
  ['hidden',           HiddenField],
])

export function getFieldComponent(type: string): ComponentType<FieldProps> {
  return registry.get(type) ?? TextField
}

export { TextField, SelectField, DateField, CheckboxField, NumberField, TextareaField, HiddenField }
