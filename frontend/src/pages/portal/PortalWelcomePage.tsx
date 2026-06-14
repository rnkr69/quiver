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
      <div className="text-center py-20 px-6">
        <QuiverLogo size={52} />
        <h1 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">Bienvenido</h1>
        <p className="text-base text-gray-600 mb-6">
          {data?.message ?? 'Esta sección estará disponible próximamente.'}
        </p>
        <a
          href="https://github.com/rnkr69/quiver"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
        >
          <BookOpen size={15} />
          Ver documentación de Quiver
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="bg-brand-50 border border-brand-100 rounded px-3.5 py-2.5 mb-8 flex gap-2.5 items-start text-md text-brand-700">
        <Wrench size={15} className="mt-px shrink-0 text-brand-500" />
        <div>
          <strong>Estás viendo la página de bienvenida por defecto.</strong>
          {' '}Edita <code className="bg-brand-100 px-1 py-px rounded text-sm">src/pages/portal/PortalWelcomePage.tsx</code> para personalizarla.
        </div>
      </div>

      <div className="text-center mb-8">
        <QuiverLogo size={52} />
        <h1 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">Portal activo</h1>
        <p className="text-base text-gray-600">Esta es la zona de usuario.</p>
      </div>

      <Card className="p-5 max-w-[420px] mx-auto mb-6 font-mono text-md">
        <div className="flex flex-col gap-2.5 text-gray-800">
          <div className="flex gap-2 items-center">
            <span className="text-gray-500 min-w-[80px]">Usuario:</span>
            <span>{user?.email ?? '—'}</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-gray-500 min-w-[80px]">Roles:</span>
            <div className="flex flex-wrap gap-1">
              {user?.roles.map(r => <Badge key={r} variant="client">{r}</Badge>)}
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 min-w-[80px]">Entorno:</span>
            <span>{data?.env ?? 'development'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 min-w-[80px]">Versión:</span>
            <span>{data?.version ?? 'Quiver 0.1.0'}</span>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <a
          href="https://github.com/rnkr69/quiver"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
        >
          <BookOpen size={15} />
          Ver documentación de Quiver
        </a>
      </div>
    </div>
  )
}
