import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/layout/AuthLayout'
import { authApi } from '@/api/auth.api'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await authApi.forgotPassword(email)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <AuthLayout>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-success-50 inline-flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-success-500" />
          </div>
          <h2 className="text-xl font-semibold text-success-500 mb-2">Enlace enviado</h2>
          <p className="text-base text-gray-600 mb-1">Si el email existe, recibirás un enlace en breve.</p>
          <p className="text-md text-gray-500 mb-6">Revisa también tu carpeta de spam.</p>
          <Link
            to="/auth/login"
            className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
          >
            Volver al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Link to="/auth/login" className="inline-flex items-center gap-1 text-md text-brand-500 hover:underline mb-5">
        ← Volver al login
      </Link>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">Recuperar contraseña</h2>
      <p className="text-md text-gray-600 mb-6">Introduce tu email y te enviaremos un enlace.</p>

      {status === 'error' && (
        <Alert type="error" message="Ha ocurrido un error. Inténtalo de nuevo." className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@empresa.com"
          required
          disabled={status === 'loading'}
        />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={status === 'loading'} disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando…' : 'Enviar enlace'}
        </Button>
      </form>
    </AuthLayout>
  )
}
