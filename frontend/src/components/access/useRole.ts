import { useAuthStore } from '@/store/auth.store'

interface RoleHook {
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
}

export function useRole(): RoleHook {
  const user = useAuthStore((s) => s.user)

  const hasRole = (role: string): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return user.roles.includes(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return roles.some((r) => user.roles.includes(r))
  }

  const hasAllRoles = (roles: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return roles.every((r) => user.roles.includes(r))
  }

  return { hasRole, hasAnyRole, hasAllRoles }
}
