import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useMenuStore } from '@/store/menu.store'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { LogOut } from 'lucide-react'
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
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: isOpen ? `8px 16px 8px ${indent ? 28 : 16}px` : '8px 16px',
          textDecoration: 'none', fontSize: 14,
          color: active ? 'var(--brand-700)' : 'var(--gray-700)',
          background: active ? 'var(--brand-50)' : 'transparent',
          borderLeft: active ? '3px solid var(--brand-500)' : '3px solid transparent',
          fontWeight: active ? 500 : 400,
          marginBottom: 1,
          transition: 'background 0.1s',
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--gray-100)' }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        {icon && (
          <i
            className={`bi bi-${icon}`}
            style={{ fontSize: 15, width: 16, flexShrink: 0, textAlign: 'center' }}
          />
        )}
        {isOpen && (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
        )}
        {!isOpen && !icon && (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label[0]}
          </span>
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
            style={{
              display: 'flex', alignItems: 'center', width: '100%',
              padding: '6px 16px', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: 'var(--gray-500)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              textAlign: 'left', marginTop: 12,
            }}
          >
            {entry.icon && (
              <i className={`bi bi-${entry.icon}`} style={{ fontSize: 12, flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{entry.title}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: isGroupCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}>
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
      <div style={{
        height: 64, background: 'white', borderBottom: '1px solid var(--gray-200)',
        display: 'flex', alignItems: 'center',
        padding: isOpen ? '0 12px 0 16px' : '0 14px',
        gap: 10, flexShrink: 0,
      }}>
        <QuiverLogo size={28} />
        {isOpen && <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', flex: 1, whiteSpace: 'nowrap' }}>Quiver</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {items.map((entry, i) => <div key={i}>{renderEntry(entry)}</div>)}
      </nav>

      {/* Footer */}
      {user && (
        <div style={{
          borderTop: '1px solid var(--gray-200)',
          padding: isOpen ? '10px 12px' : '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'var(--brand-50)', color: 'var(--brand-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
          }}>
            {initials}
          </div>
          {isOpen && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.first_name} {user.last_name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, display: 'flex', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gray-700)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-400)')}
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
