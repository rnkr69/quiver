import type { ReactNode } from 'react'
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertType = 'error' | 'success' | 'info' | 'warning'

const CFG: Record<AlertType, { containerClass: string; iconClass: string; icon: typeof XCircle }> = {
  error:   { containerClass: 'bg-danger-50 border-danger-500',   iconClass: 'text-danger-500',   icon: XCircle },
  success: { containerClass: 'bg-success-50 border-success-500', iconClass: 'text-success-500',  icon: CheckCircle },
  info:    { containerClass: 'bg-brand-50 border-brand-500',     iconClass: 'text-brand-500',    icon: Info },
  warning: { containerClass: 'bg-warning-50 border-warning-500', iconClass: 'text-warning-500',  icon: AlertTriangle },
}

interface AlertProps {
  type?: AlertType
  message?: string
  children?: ReactNode
  className?: string
}

export function Alert({ type = 'error', message, children, className }: AlertProps) {
  const { containerClass, iconClass, icon: IconComp } = CFG[type]
  return (
    <div className={cn(
      'flex items-start gap-2.5 border rounded-md px-[14px] py-[10px] text-md text-gray-800',
      containerClass,
      className,
    )}>
      <IconComp size={16} className={cn('mt-px shrink-0', iconClass)} />
      <span>{message ?? children}</span>
    </div>
  )
}
