import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

const TYPE_CFG: Record<ToastType, { bg: string; border: string; icon: typeof CheckCircle; iconColor: string }> = {
  success: { bg: 'var(--success-50)', border: 'var(--success-500)', icon: CheckCircle,    iconColor: 'var(--success-500)' },
  error:   { bg: 'var(--danger-50)',  border: 'var(--danger-500)',  icon: XCircle,        iconColor: 'var(--danger-500)' },
  warning: { bg: 'var(--warning-50)', border: 'var(--warning-500)', icon: AlertTriangle,  iconColor: 'var(--warning-500)' },
  info:    { bg: 'var(--brand-50)',   border: 'var(--brand-500)',   icon: Info,           iconColor: 'var(--brand-500)' },
}

let _counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_counter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const cfg = TYPE_CFG[t.type]
          const IconComp = cfg.icon
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'all',
                background: cfg.bg,
                borderLeft: `3px solid ${cfg.border}`,
                borderRadius: 6, padding: '10px 14px',
                boxShadow: 'var(--shadow-md)',
                minWidth: 280, maxWidth: 380,
                fontSize: 13, color: 'var(--gray-800)',
                animation: 'slideIn 0.2s ease',
              }}
            >
              <IconComp size={16} color={cfg.iconColor} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0, display: 'flex', flexShrink: 0 }}
              >
                <X size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
