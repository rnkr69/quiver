import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layout/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { isAxiosError } from 'axios'

type Status = 'idle' | 'loading' | 'error'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = { email: '', password: '' }
    if (!email) errs.email = 'El email es obligatorio.'
    if (!password) errs.password = 'La contraseña es obligatoria.'
    if (errs.email || errs.password) { setFieldErrors(errs); return }

    setStatus('loading')
    setErrorMsg('')
    setFieldErrors({ email: '', password: '' })

    try {
      const data = await login(email, password)
      navigate(data.redirect_to ?? '/admin')
    } catch (err) {
      setStatus('error')
      if (isAxiosError(err)) {
        const code = err.response?.data?.code
        if (code === 'QUIVER_UNAUTHORIZED') {
          const detail = err.response?.data?.detail ?? ''
          setErrorMsg(detail.toLowerCase().includes('inactiv')
            ? 'Tu cuenta está desactivada. Contacta con el administrador.'
            : 'Email o contraseña incorrectos.')
        } else {
          setErrorMsg('Ha ocurrido un error. Inténtalo de nuevo.')
        }
      } else {
        setErrorMsg('Ha ocurrido un error. Inténtalo de nuevo.')
      }
    }
  }

  const isLoading = status === 'loading'

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Bienvenido</h2>
      <p className="text-md text-gray-600 mb-6">Accede a tu cuenta</p>

      {status === 'error' && <Alert type="error" message={errorMsg} className="mb-4" />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@empresa.com"
          disabled={isLoading}
          error={fieldErrors.email}
          required
        />
        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={isLoading} disabled={isLoading}>
          {isLoading ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <a href="/auth/forgot-password" className="text-md text-brand-500 hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-5 bg-gray-50 border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-600">
          <strong className="text-gray-700">Demo:</strong> usa las credenciales del superusuario creado en el setup.
        </div>
      )}
    </AuthLayout>
  )
}
