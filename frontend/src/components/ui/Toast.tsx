import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const TYPE_CFG: Record<ToastType, { containerClass: string; iconClass: string; icon: typeof CheckCircle }> = {
  success: { containerClass: 'bg-success-50 border-l-success-500', iconClass: 'text-success-500', icon: CheckCircle },
  error:   { containerClass: 'bg-danger-50 border-l-danger-500',   iconClass: 'text-danger-500',  icon: XCircle },
  warning: { containerClass: 'bg-warning-50 border-l-warning-500', iconClass: 'text-warning-500', icon: AlertTriangle },
  info:    { containerClass: 'bg-brand-50 border-l-brand-500',     iconClass: 'text-brand-500',   icon: Info },
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
      <div className="fixed top-4 right-4 z-[9000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const cfg = TYPE_CFG[t.type]
          const IconComp = cfg.icon
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-center gap-2.5 pointer-events-auto',
                'border-l-[3px] rounded-md px-[14px] py-[10px]',
                'shadow-md min-w-[280px] max-w-[380px] text-md text-gray-800',
                'animate-slideIn',
                cfg.containerClass,
              )}
            >
              <IconComp size={16} className={cn('shrink-0', cfg.iconClass)} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="bg-transparent border-none cursor-pointer text-gray-400 p-0 flex shrink-0"
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
