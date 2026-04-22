import type { ReactNode } from 'react'
import { useRole } from './useRole'

interface HasRoleProps {
  /** Single role required */
  role?: string
  /** At least one of these roles required */
  any?: string[]
  /** All of these roles required */
  all?: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function HasRole({ role, any, all, fallback = null, children }: HasRoleProps) {
  const { hasRole, hasAnyRole, hasAllRoles } = useRole()

  let allowed = false
  if (role !== undefined) {
    allowed = hasRole(role)
  } else if (any !== undefined) {
    allowed = hasAnyRole(any)
  } else if (all !== undefined) {
    allowed = hasAllRoles(all)
  } else {
    allowed = true
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{allowed ? children : fallback}</>
}
