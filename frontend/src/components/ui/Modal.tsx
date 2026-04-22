import { ReactNode, useEffect } from 'react'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function Modal({
  open, title, children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl p-6 w-full max-w-[440px] shadow-modal"
      >
        <div className="text-xl font-semibold text-gray-900 mb-2">{title}</div>
        <div className="text-base text-gray-700 mb-6">{children}</div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
