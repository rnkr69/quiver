import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Link2Off } from 'lucide-react'
import { AuthLayout } from '@/layout/AuthLayout'
import { authApi } from '@/api/auth.api'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { isAxiosError } from 'axios'

type Status = 'idle' | 'submitting' | 'success' | 'invalid' | 'expired' | 'used'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [matchError, setMatchError] = useState('')

  if (!token) {
    navigate('/auth/login', { replace: true })
    return null
  }

  if (status === 'success') {
    return (
      <AuthLayout>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-success-50 inline-flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-success-500" />
          </div>
          <h2 className="text-xl font-semibold text-success-500 mb-2">Contraseña actualizada</h2>
          <p className="text-base text-gray-600 mb-1">Tu contraseña se ha cambiado correctamente.</p>
          <p className="text-md text-gray-500 mb-6">Todas tus sesiones activas han sido cerradas por seguridad.</p>
          <Link
            to="/auth/login"
            className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
          >
            Ir al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'invalid' || status === 'expired' || status === 'used') {
    const messages = {
      invalid: 'El enlace de recuperación no es válido.',
      expired: 'El enlace de recuperación ha expirado.',
      used: 'Este enlace ya fue utilizado anteriormente.',
    }
    return (
      <AuthLayout>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-danger-50 inline-flex items-center justify-center mb-4">
            <Link2Off size={24} className="text-danger-500" />
          </div>
          <h2 className="text-xl font-semibold text-danger-500 mb-2">Enlace no válido</h2>
          <p className="text-base text-gray-600 mb-6">{messages[status]}</p>
          <Link
            to="/auth/forgot-password"
            className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setMatchError('Las contraseñas no coinciden.'); return }
    if (password.length < 8) { setMatchError('La contraseña debe tener al menos 8 caracteres.'); return }
    setMatchError('')
    setStatus('submitting')
    try {
      await authApi.resetPassword(token!, password)
      setStatus('success')
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.code
        if (code === 'QUIVER_TOKEN_EXPIRED') setStatus('expired')
        else if (code === 'QUIVER_TOKEN_USED') setStatus('used')
        else setStatus('invalid')
      } else {
        setStatus('invalid')
      }
    }
  }

  const isLoading = status === 'submitting'

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Nueva contraseña</h2>
      <p className="text-md text-gray-600 mb-6">Elige una contraseña segura para tu cuenta.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        <PasswordInput
          label="Confirmar contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          disabled={isLoading}
          error={matchError}
          required
        />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={isLoading} disabled={isLoading}>
          {isLoading ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </AuthLayout>
  )
}
