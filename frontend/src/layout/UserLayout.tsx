import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'

export function UserLayout() {
  const { user } = useAuthStore()
  const location = useLocation()

  const isAdmin = user?.is_superuser || user?.roles.includes('admin')
  const initials = user
    ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const navLinkStyle = (path: string) => ({
    display: 'inline-flex', alignItems: 'center',
    padding: '5px 10px', borderRadius: 4,
    fontSize: 14, textDecoration: 'none',
    border: '1px solid transparent',
    color: location.pathname === path || location.pathname.startsWith(path + '/')
      ? 'var(--brand-600)'
      : 'var(--gray-700)',
    background: location.pathname === path || location.pathname.startsWith(path + '/')
      ? 'var(--brand-50)'
      : 'transparent',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>
      <header style={{
        height: 60, flexShrink: 0,
        background: 'white', borderBottom: '1px solid var(--gray-200)',
        display: 'flex', alignItems: 'center',
        paddingInline: 24, gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/portal" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <QuiverLogo size={26} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>Portal</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
          <Link to="/portal/perfil" style={navLinkStyle('/portal/perfil')}>Mi perfil</Link>
        </nav>

        <div style={{ flex: 1 }} />

        {isAdmin && (
          <Link to="/admin" style={{ fontSize: 13, color: 'var(--brand-500)', textDecoration: 'none' }}>
            Panel de admin →
          </Link>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'var(--brand-50)', color: 'var(--brand-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
          }}>
            {initials}
          </div>
          {user && (
            <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>
              {user.first_name} {user.last_name}
            </span>
          )}
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: 32 }}>
        <Outlet />
      </main>

      <footer style={{
        background: 'white', borderTop: '1px solid var(--gray-200)',
        padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>© {new Date().getFullYear()} Empresa S.L.</span>
        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>Quiver v0.1.0</span>
      </footer>
    </div>
  )
}
