import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layout/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
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
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 4px' }}>
        Bienvenido
      </h2>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '0 0 24px' }}>
        Accede a tu cuenta
      </p>

      {status === 'error' && <Alert type="error" message={errorMsg} style={{ marginBottom: 16 }} />}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        <button
          type="submit"
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px 16px', fontSize: 14, fontWeight: 500,
            background: isLoading ? 'var(--gray-300)' : 'var(--brand-500)',
            color: 'white', border: '1px solid transparent', borderRadius: 6,
            cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {isLoading && <Spinner size={14} color="white" />}
          {isLoading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a
          href="/auth/forgot-password"
          style={{ fontSize: 13, color: 'var(--brand-500)', textDecoration: 'none' }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {import.meta.env.DEV && (
        <div style={{
          marginTop: 20, background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
          borderRadius: 6, padding: '10px 12px', fontSize: 12, color: 'var(--gray-600)',
        }}>
          <strong style={{ color: 'var(--gray-700)' }}>Demo:</strong> usa las credenciales del superusuario creado en el setup.
        </div>
      )}
    </AuthLayout>
  )
}
