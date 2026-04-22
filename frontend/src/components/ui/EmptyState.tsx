import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-gray-300 mb-4 flex">{icon}</div>}
      <p className="text-lg font-medium text-gray-700 m-0 mb-1.5">{title}</p>
      {description && (
        <p className="text-md text-gray-500 m-0 mb-5 max-w-[320px]">{description}</p>
      )}
      {action}
    </div>
  )
}
