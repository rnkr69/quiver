import type { ReactNode } from 'react'
import { usePermission } from './usePermission'

interface CanProps {
  /** Single permission required */
  do?: string
  /** At least one of these permissions required */
  any?: string[]
  /** All of these permissions required */
  all?: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function Can({ do: perm, any, all, fallback = null, children }: CanProps) {
  const { can, canAny, canAll } = usePermission()

  let allowed = false
  if (perm !== undefined) {
    allowed = can(perm)
  } else if (any !== undefined) {
    allowed = canAny(any)
  } else if (all !== undefined) {
    allowed = canAll(all)
  } else {
    allowed = true
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{allowed ? children : fallback}</>
}
