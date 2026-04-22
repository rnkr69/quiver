import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isAdmin = user?.is_superuser || user?.roles.includes('admin')
  const target = isAdmin ? '/admin' : '/portal'

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--brand-500)', lineHeight: 1, marginBottom: 12 }}>
        403
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 8 }}>
        Acceso denegado
      </div>
      <div style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 28 }}>
        No tienes permiso para ver esta página.
      </div>
      <button
        onClick={() => navigate(target, { replace: true })}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', fontSize: 14, fontWeight: 500,
          background: 'var(--brand-500)', color: 'white',
          border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <ArrowLeft size={14} />
        Volver al inicio
      </button>
    </div>
  )
}
