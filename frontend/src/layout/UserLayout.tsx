import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { cn } from '@/lib/utils'

export function UserLayout() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const location = useLocation()

  const isAdmin = user?.is_superuser || user?.roles.includes('admin')
  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const navLinkClass = (path: string) => cn(
    'inline-flex items-center px-[10px] py-[5px] rounded text-base no-underline border border-transparent transition-colors',
    location.pathname === path || location.pathname.startsWith(path + '/')
      ? 'text-brand-600 bg-brand-50'
      : 'text-gray-700 bg-transparent hover:bg-gray-100',
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-[60px] shrink-0 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-[100]">
        <Link to="/portal" className="flex items-center gap-2 no-underline">
          <QuiverLogo size={26} />
          <span className="text-base font-semibold text-gray-900">{t('nav.portal')}</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Link to="/portal/perfil" className={navLinkClass('/portal/perfil')}>{t('nav.myProfile')}</Link>
        </nav>

        <div className="flex-1" />

        {isAdmin && (
          <Link to="/admin" className="text-md text-brand-500 no-underline">
            {t('nav.adminPanel')}
          </Link>
        )}

        <LanguageSwitcher />

        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full shrink-0 bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          {user && (
            <span className="text-md text-gray-800">
              {user.first_name} {user.last_name}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 px-8 py-[14px] flex justify-between items-center shrink-0">
        <span className="text-sm text-gray-400">© {new Date().getFullYear()} {t('nav.companyName')}</span>
        <span className="text-xs text-gray-400 font-mono">Quiver v0.1.0</span>
      </footer>
    </div>
  )
}
