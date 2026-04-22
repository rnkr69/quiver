import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 24px', textAlign: 'center',
    }}>
      {icon && (
        <div style={{ color: 'var(--gray-300)', marginBottom: 16, display: 'flex' }}>
          {icon}
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-700)', margin: '0 0 6px' }}>{title}</p>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 20px', maxWidth: 320 }}>{description}</p>
      )}
      {action}
    </div>
  )
}
