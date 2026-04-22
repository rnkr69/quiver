import { PanelLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: Props) {
  const { user } = useAuthStore()

  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const portalRoles = (import.meta.env.VITE_PORTAL_ROLES as string | undefined)?.split(',').map(r => r.trim()) ?? []
  const hasPortalAccess = user?.is_superuser || user?.roles.some(r => portalRoles.includes(r))

  return (
    <div style={{
      height: 56, flexShrink: 0,
      background: 'white',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex', alignItems: 'center',
      paddingInline: 16, gap: 12,
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <button
        onClick={onMenuToggle}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 6,
          color: 'var(--gray-500)', display: 'flex', alignItems: 'center', borderRadius: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-100)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={18} />
      </button>

      <div style={{ flex: 1 }} />

      {hasPortalAccess && (
        <a href="/portal" style={{ fontSize: 13, color: 'var(--brand-500)', textDecoration: 'none' }}>
          Ver portal →
        </a>
      )}

      {user && (
        <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>
          {user.first_name} {user.last_name}
        </span>
      )}

      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--brand-50)', color: 'var(--brand-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600, flexShrink: 0,
      }}>
        {initials}
      </div>
    </div>
  )
}
