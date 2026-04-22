import { useAuthStore } from '@/store/auth.store'

interface PermissionHook {
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean
  canAll: (permissions: string[]) => boolean
}

export function usePermission(): PermissionHook {
  const user = useAuthStore((s) => s.user)

  const can = (permission: string): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return user.permissions.includes(permission)
  }

  const canAny = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return permissions.some((p) => user.permissions.includes(p))
  }

  const canAll = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return permissions.every((p) => user.permissions.includes(p))
  }

  return { can, canAny, canAll }
}
