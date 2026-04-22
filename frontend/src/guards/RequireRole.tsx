import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  roles: string[]
  children: ReactNode
}

export function RequireRole({ roles, children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null

  // Superusers bypass all role checks
  if (user?.is_superuser) return <>{children}</>

  const hasRole = user?.roles.some(r => roles.includes(r)) ?? false
  if (!hasRole) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
