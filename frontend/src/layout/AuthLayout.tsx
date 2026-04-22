import type { ReactNode } from 'react'
import { QuiverLogo } from '@/components/ui/QuiverLogo'

interface Props {
  children: ReactNode
}

export function AuthLayout({ children }: Props) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gray-50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <QuiverLogo size={40} />
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)' }}>Quiver</span>
      </div>

      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--gray-200)',
      }}>
        {children}
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: 'var(--gray-400)' }}>
        © {new Date().getFullYear()} Quiver
      </div>
    </div>
  )
}
