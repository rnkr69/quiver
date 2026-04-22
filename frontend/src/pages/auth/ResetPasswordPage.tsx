import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Link2Off } from 'lucide-react'
import { AuthLayout } from '@/layout/AuthLayout'
import { authApi } from '@/api/auth.api'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Spinner } from '@/components/ui/Spinner'
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
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--success-50)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <CheckCircle size={24} color="var(--success-500)" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--success-500)', margin: '0 0 8px' }}>
            Contraseña actualizada
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '0 0 4px' }}>
            Tu contraseña se ha cambiado correctamente.
          </p>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 24px' }}>
            Todas tus sesiones activas han sido cerradas por seguridad.
          </p>
          <Link to="/auth/login" style={{
            display: 'block', width: '100%', padding: '8px 16px', fontSize: 14, fontWeight: 500,
            background: 'white', color: 'var(--gray-800)',
            border: '1px solid var(--gray-300)', borderRadius: 6, cursor: 'pointer',
            textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box',
          }}>
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
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--danger-50)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Link2Off size={24} color="var(--danger-500)" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--danger-500)', margin: '0 0 8px' }}>
            Enlace no válido
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '0 0 24px' }}>
            {messages[status]}
          </p>
          <Link to="/auth/forgot-password" style={{
            display: 'block', padding: '8px 16px', fontSize: 14, fontWeight: 500,
            background: 'white', color: 'var(--gray-800)',
            border: '1px solid var(--gray-300)', borderRadius: 6,
            textDecoration: 'none', textAlign: 'center',
          }}>
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
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 4px' }}>
        Nueva contraseña
      </h2>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '0 0 24px' }}>
        Elige una contraseña segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          {isLoading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthLayout>
  )
}
