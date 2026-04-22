import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn(
        'h-screen sticky top-0 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 transition-[width,min-width] duration-200 overflow-hidden',
        sidebarOpen ? 'w-60 min-w-60' : 'w-14 min-w-14',
      )}>
        <Sidebar isOpen={sidebarOpen} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
