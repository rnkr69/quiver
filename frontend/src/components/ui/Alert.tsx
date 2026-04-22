import type { ReactNode, CSSProperties } from 'react'
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

type AlertType = 'error' | 'success' | 'info' | 'warning'

const CFG: Record<AlertType, { bg: string; border: string; icon: typeof XCircle; iconColor: string }> = {
  error:   { bg: 'var(--danger-50)',  border: 'var(--danger-500)',  icon: XCircle,       iconColor: 'var(--danger-500)' },
  success: { bg: 'var(--success-50)', border: 'var(--success-500)', icon: CheckCircle,   iconColor: 'var(--success-500)' },
  info:    { bg: 'var(--brand-50)',   border: 'var(--brand-500)',   icon: Info,          iconColor: 'var(--brand-500)' },
  warning: { bg: 'var(--warning-50)', border: 'var(--warning-500)', icon: AlertTriangle, iconColor: 'var(--warning-500)' },
}

interface AlertProps {
  type?: AlertType
  message?: string
  children?: ReactNode
  style?: CSSProperties
}

export function Alert({ type = 'error', message, children, style }: AlertProps) {
  const { bg, border, icon: IconComp, iconColor } = CFG[type]
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 6, padding: '10px 14px',
      fontSize: 13, color: 'var(--gray-800)',
      ...style,
    }}>
      <IconComp size={16} color={iconColor} style={{ marginTop: 1, flexShrink: 0 }} />
      <span>{message ?? children}</span>
    </div>
  )
}
