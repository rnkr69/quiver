import { useEffect, useState } from 'react'
import { Wrench, BookOpen } from 'lucide-react'
import { portalApi, type PortalWelcomeResponse } from '@/api/portal.api'
import { useAuthStore } from '@/store/auth.store'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

const isDev = (import.meta.env.VITE_QUIVER_ENV as string | undefined) !== 'production'

export function PortalWelcomePage() {
  const [data, setData] = useState<PortalWelcomeResponse | null>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    portalApi.getWelcome().then((res) => setData(res.data)).catch(() => {})
  }, [])

  if (!isDev) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <QuiverLogo size={52} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', margin: '16px 0 8px' }}>
          Bienvenido
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 24 }}>
          {data?.message ?? 'Esta sección estará disponible próximamente.'}
        </p>
        <a
          href="https://github.com/your-org/quiver"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 14, fontWeight: 500,
            background: 'white', color: 'var(--gray-800)',
            border: '1px solid var(--gray-300)', borderRadius: 6, textDecoration: 'none',
          }}
        >
          <BookOpen size={15} />
          Ver documentación de Quiver
        </a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{
        background: 'var(--brand-50)', border: '1px solid var(--brand-100)',
        borderRadius: 6, padding: '10px 14px', marginBottom: 32,
        display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--brand-700)',
      }}>
        <Wrench size={15} style={{ marginTop: 1, flexShrink: 0, color: 'var(--brand-500)' }} />
        <div>
          <strong>Estás viendo la página de bienvenida por defecto.</strong>
          {' '}Edita <code style={{ background: 'var(--brand-100)', padding: '1px 4px', borderRadius: 3, fontSize: 12 }}>src/pages/portal/PortalWelcomePage.tsx</code> para personalizarla.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <QuiverLogo size={52} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)', margin: '16px 0 8px' }}>
          Portal activo
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: 0 }}>
          Esta es la zona de usuario.
        </p>
      </div>

      <Card style={{ padding: 20, maxWidth: 420, margin: '0 auto 24px', fontFamily: 'monospace', fontSize: 13 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--gray-800)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--gray-500)', minWidth: 80 }}>Usuario:</span>
            <span>{user?.email ?? '—'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--gray-500)', minWidth: 80 }}>Roles:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {user?.roles.map(r => <Badge key={r} variant="client">{r}</Badge>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--gray-500)', minWidth: 80 }}>Entorno:</span>
            <span>{data?.env ?? 'development'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--gray-500)', minWidth: 80 }}>Versión:</span>
            <span>{data?.version ?? 'Quiver 0.1.0'}</span>
          </div>
        </div>
      </Card>

      <div style={{ textAlign: 'center' }}>
        <a
          href="https://github.com/your-org/quiver"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 14, fontWeight: 500,
            background: 'white', color: 'var(--gray-800)',
            border: '1px solid var(--gray-300)', borderRadius: 6, textDecoration: 'none',
          }}
        >
          <BookOpen size={15} />
          Ver documentación de Quiver
        </a>
      </div>
    </div>
  )
}
