import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/layout/AuthLayout'
import { authApi } from '@/api/auth.api'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'

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
            Enlace enviado
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '0 0 4px' }}>
            Si el email existe, recibirás un enlace en breve.
          </p>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 24px' }}>
            Revisa también tu carpeta de spam.
          </p>
          <Link to="/auth/login">
            <button style={{
              width: '100%', padding: '8px 16px', fontSize: 14, fontWeight: 500,
              background: 'white', color: 'var(--gray-800)',
              border: '1px solid var(--gray-300)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Volver al login
            </button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Link to="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--brand-500)', textDecoration: 'none', marginBottom: 20 }}>
        ← Volver al login
      </Link>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 4px' }}>
        Recuperar contraseña
      </h2>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '0 0 24px' }}>
        Introduce tu email y te enviaremos un enlace.
      </p>

      {status === 'error' && (
        <Alert type="error" message="Ha ocurrido un error. Inténtalo de nuevo." style={{ marginBottom: 16 }} />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@empresa.com"
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px 16px', fontSize: 14, fontWeight: 500,
            background: status === 'loading' ? 'var(--gray-300)' : 'var(--brand-500)',
            color: 'white', border: '1px solid transparent', borderRadius: 6,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {status === 'loading' && <Spinner size={14} color="white" />}
          {status === 'loading' ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
    </AuthLayout>
  )
}
