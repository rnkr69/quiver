import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: sidebarOpen ? 240 : 56,
        minWidth: sidebarOpen ? 240 : 56,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--gray-50)',
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s, min-width 0.2s',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <Sidebar isOpen={sidebarOpen} />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1600 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
