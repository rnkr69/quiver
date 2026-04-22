// Quiver — Layouts
const { useState, useContext } = React;
const { NavigationContext, Btn, Icon, Avatar, QuiverLogo } = window;

const NAV_ITEMS = [
  { group: 'Principal' },
  { icon: 'layout-dashboard', label: 'Dashboard', path: '/admin' },
  { group: 'Catálogo' },
  { icon: 'package', label: 'Productos', path: '/admin/productos' },
  { icon: 'tag', label: 'Categorías', path: '/admin/categorias' },
  { group: 'Usuarios' },
  { icon: 'users', label: 'Usuarios', path: '/admin/users' },
  { icon: 'shield', label: 'Roles', path: '/admin/roles' },
  { group: 'Sistema' },
  { icon: 'settings', label: 'Configuración', path: '/admin/config' },
];

// ─── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ collapsed, currentPath }) {
  const { navigate } = useContext(NavigationContext);
  const isActive = p => currentPath === p || (p !== '/admin' && currentPath.startsWith(p));
  return (
    <aside style={{ width: collapsed ? 56 : 240, minWidth: collapsed ? 56 : 240, height: '100vh', position: 'sticky', top: 0, background: 'var(--gray-50)', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, transition: 'width 0.2s, min-width 0.2s' }}>
      {/* Logo */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: collapsed ? '0 14px' : '0 20px', borderBottom: '1px solid var(--gray-200)', background: 'white', gap: 10, flexShrink: 0 }}>
        <QuiverLogo size={28} />
        {!collapsed && <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>Quiver</span>}
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item, i) => {
          if (item.group) {
            if (collapsed) return null;
            return <div key={i} style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 12px 4px' }}>{item.group}</div>;
          }
          const active = isActive(item.path);
          return (
            <div key={i} title={collapsed ? item.label : undefined} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '9px' : '8px 12px', borderRadius: 6, cursor: 'pointer', marginBottom: 1, justifyContent: collapsed ? 'center' : 'flex-start', background: active ? 'var(--brand-50)' : 'transparent', color: active ? 'var(--brand-700)' : 'var(--gray-700)', borderLeft: active ? '3px solid var(--brand-500)' : '3px solid transparent', fontWeight: active ? 500 : 400, fontSize: 14, transition: 'background 0.1s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--gray-100)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--brand-50)' : 'transparent'; }}>
              <Icon name={item.icon} size={18} color={active ? 'var(--brand-500)' : 'var(--gray-500)'} />
              {!collapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>
      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--gray-200)', padding: collapsed ? '12px 8px' : '12px 16px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar name="Ana Martínez" size={30} />
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ana Martínez</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ana@empresa.com</div>
            </div>
            <button onClick={() => navigate('/auth/login')} style={{ ...Btn.ghost, padding: 4 }} title="Cerrar sesión">
              <Icon name="log-out" size={15} color="var(--gray-400)" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────
function Topbar({ breadcrumbs, onToggleSidebar }) {
  const { navigate } = useContext(NavigationContext);
  return (
    <header style={{ height: 56, background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onToggleSidebar} style={{ ...Btn.ghost, padding: '5px', marginRight: 6 }}>
          <Icon name="panel-left" size={18} color="var(--gray-400)" />
        </button>
        {(breadcrumbs || []).map((b, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <Icon name="chevron-right" size={13} color="var(--gray-400)" />}
            {b.path
              ? <span onClick={() => navigate(b.path)} style={{ fontSize: 13, color: 'var(--brand-500)', cursor: 'pointer' }}>{b.label}</span>
              : <span style={{ fontSize: 13, color: 'var(--gray-800)', fontWeight: 500 }}>{b.label}</span>}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Ana Martínez</span>
        <Avatar name="Ana Martínez" size={30} />
      </div>
    </header>
  );
}

// ─── AdminLayout ───────────────────────────────────────────────────
function AdminLayout({ children, breadcrumbs, sidebarCollapsed, onToggleSidebar, currentPath }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={sidebarCollapsed} currentPath={currentPath || ''} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar breadcrumbs={breadcrumbs} onToggleSidebar={onToggleSidebar} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1200 }}>{children}</div>
        </main>
      </div>
    </div>
  );
}

// ─── AuthLayout ────────────────────────────────────────────────────
function AuthLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <QuiverLogo size={40} />
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>Quiver</span>
      </div>
      <div style={{ width: '100%', maxWidth: 400, background: 'white', borderRadius: 8, padding: 32, boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-200)' }}>
        {children}
      </div>
      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--gray-400)' }}>© 2025 Quiver. Todos los derechos reservados.</p>
    </div>
  );
}

// ─── UserLayout ────────────────────────────────────────────────────
function UserNavbar({ currentPath }) {
  const { navigate } = useContext(NavigationContext);
  return (
    <header style={{ height: 60, background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/portal')}>
        <QuiverLogo size={26} />
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>Portal</span>
      </div>
      <nav style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => navigate('/portal/perfil')} style={{ ...Btn.ghost, fontSize: 13, color: currentPath?.startsWith('/portal/perfil') ? 'var(--brand-600)' : 'var(--gray-700)' }}>
          Mi perfil
        </button>
      </nav>
      <Avatar name="María García" size={30} />
    </header>
  );
}

function UserLayout({ children, currentPath }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>
      <UserNavbar currentPath={currentPath} />
      <main style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '32px 32px' }}>
        {children}
      </main>
      <footer style={{ background: 'white', borderTop: '1px solid var(--gray-200)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>© 2025 Empresa S.L.</span>
        <span style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>Quiver v0.1.0</span>
      </footer>
    </div>
  );
}

Object.assign(window, { AdminLayout, AuthLayout, UserLayout });
