import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useMenuStore } from '@/store/menu.store'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuEntry, MenuGroupEntry } from '@/api/menu.api'

const STORAGE_KEY = 'quiver_sidebar_groups'

function loadCollapsed(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

function saveCollapsed(state: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface Props {
  isOpen: boolean
}

export function Sidebar({ isOpen }: Props) {
  const { t } = useTranslation()
  const { items, isLoaded, fetchMenu } = useMenuStore()
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed)

  useEffect(() => {
    if (!isLoaded) fetchMenu()
  }, [isLoaded, fetchMenu])

  function toggleGroup(title: string) {
    setCollapsed(prev => {
      const next = { ...prev, [title]: !prev[title] }
      saveCollapsed(next)
      return next
    })
  }

  function isItemActive(route: string) {
    return location.pathname === route || location.pathname.startsWith(route + '/')
  }

  function renderNavItem(label: string, route: string, icon?: string | null, indent = false) {
    const active = isItemActive(route)
    return (
      <NavLink
        key={route}
        to={route}
        title={!isOpen ? label : undefined}
        className={cn(
          'flex items-center gap-2.5 text-base border-l-[3px] mb-px transition-colors duration-100 overflow-hidden whitespace-nowrap',
          isOpen ? `py-2 pr-4 ${indent ? 'pl-7' : 'pl-4'}` : 'py-2 px-4',
          active
            ? 'text-brand-700 bg-brand-50 border-l-brand-500 font-medium'
            : 'text-gray-700 bg-transparent border-l-transparent font-normal hover:bg-gray-100',
        )}
      >
        {icon && (
          <i className={`bi bi-${icon} text-[15px] w-4 shrink-0 text-center`} />
        )}
        {isOpen && (
          <span className="overflow-hidden text-ellipsis">{label}</span>
        )}
        {!isOpen && !icon && (
          <span className="overflow-hidden text-ellipsis">{label[0]}</span>
        )}
      </NavLink>
    )
  }

  function renderGroup(entry: MenuGroupEntry) {
    const isGroupCollapsed = collapsed[entry.title] ?? false

    return (
      <div key={entry.title}>
        {isOpen && (
          <button
            onClick={() => toggleGroup(entry.title)}
            className="flex items-center w-full px-4 py-1.5 gap-1.5 bg-transparent border-none cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-[0.06em] text-left mt-3"
          >
            {entry.icon && (
              <i className={`bi bi-${entry.icon} text-xs shrink-0`} />
            )}
            <span className="flex-1">{entry.title}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={cn('shrink-0 transition-transform duration-150', isGroupCollapsed && '-rotate-90')}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        {(!isGroupCollapsed || !isOpen) && (
          <div>
            {entry.items.map(i => renderNavItem(i.label, i.route, i.icon, isOpen))}
          </div>
        )}
      </div>
    )
  }

  function renderEntry(entry: MenuEntry) {
    if (entry.type === 'item') return renderNavItem(entry.label, entry.route, entry.icon)
    return renderGroup(entry)
  }

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <>
      {/* Header */}
      <div className={cn(
        'h-16 bg-white border-b border-gray-200 flex items-center gap-2.5 shrink-0',
        isOpen ? 'px-4' : 'px-[14px]',
      )}>
        <QuiverLogo size={28} />
        {isOpen && <span className="text-lg font-semibold text-gray-900 flex-1 whitespace-nowrap">Quiver</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {items.map((entry, i) => <div key={i}>{renderEntry(entry)}</div>)}
      </nav>

      {/* Footer */}
      {user && (
        <div className={cn(
          'border-t border-gray-200 flex items-center gap-2.5 shrink-0',
          isOpen ? 'px-3 py-[10px]' : 'px-[14px] py-[10px]',
        )}>
          <div className="w-[30px] h-[30px] rounded-full shrink-0 bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          {isOpen && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-md font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.email}
                </div>
              </div>
              <button
                onClick={logout}
                title={t('common.logout')}
                className="bg-transparent border-none cursor-pointer text-gray-400 p-1 flex shrink-0 hover:text-gray-700 transition-colors"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
