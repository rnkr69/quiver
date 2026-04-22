import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 m-0 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-md text-gray-600 mt-[3px] mb-0">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  )
}
