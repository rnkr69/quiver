import type { FieldProps } from './index'

export function HiddenField({ field, value }: FieldProps) {
  return <input type="hidden" name={field.key} value={String(value ?? '')} />
}
