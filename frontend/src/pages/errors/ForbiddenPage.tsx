import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isAdmin = user?.is_superuser || user?.roles.includes('admin')
  const target = isAdmin ? '/admin' : '/portal'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="text-[64px] font-bold text-brand-500 leading-none mb-3">403</div>
      <div className="text-xl font-semibold text-gray-900 mb-2">Acceso denegado</div>
      <div className="text-base text-gray-600 mb-7">No tienes permiso para ver esta página.</div>
      <Button variant="primary" onClick={() => navigate(target, { replace: true })}>
        <ArrowLeft size={14} />
        Volver al inicio
      </Button>
    </div>
  )
}
