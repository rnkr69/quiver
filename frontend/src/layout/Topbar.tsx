import { PanelLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

interface Props {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: Props) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const portalRoles = (import.meta.env.VITE_PORTAL_ROLES as string | undefined)?.split(',').map(r => r.trim()) ?? []
  const hasPortalAccess = user?.is_superuser || user?.roles.some(r => portalRoles.includes(r))

  return (
    <div className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-[100]">
      <button
        onClick={onMenuToggle}
        className="bg-transparent border-none cursor-pointer p-1.5 text-gray-500 flex items-center rounded hover:bg-gray-100 transition-colors"
        aria-label={t('nav.toggleSidebar')}
      >
        <PanelLeft size={18} />
      </button>

      <div className="flex-1" />

      {hasPortalAccess && (
        <a href="/portal" className="text-md text-brand-500">
          {t('nav.viewPortal')}
        </a>
      )}

      <LanguageSwitcher />

      {user && (
        <span className="text-md text-gray-700">
          {user.first_name} {user.last_name}
        </span>
      )}

      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
        {initials}
      </div>
    </div>
  )
}
