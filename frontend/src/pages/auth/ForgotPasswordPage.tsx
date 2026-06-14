import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/layout/AuthLayout'
import { authApi } from '@/api/auth.api'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
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
          <h2 className="text-xl font-semibold text-success-500 mb-2">{t('auth.forgot.sentTitle')}</h2>
          <p className="text-base text-gray-600 mb-1">{t('auth.forgot.sentMessage')}</p>
          <p className="text-md text-gray-500 mb-6">{t('auth.forgot.sentSpamHint')}</p>
          <Link
            to="/auth/login"
            className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline"
          >
            {t('auth.forgot.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Link to="/auth/login" className="inline-flex items-center gap-1 text-md text-brand-500 hover:underline mb-5">
        ← {t('auth.forgot.backToLogin')}
      </Link>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('auth.forgot.title')}</h2>
      <p className="text-md text-gray-600 mb-6">{t('auth.forgot.subtitle')}</p>

      {status === 'error' && (
        <Alert type="error" message={t('common.genericError')} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t('auth.fields.email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('auth.fields.emailPlaceholder')}
          required
          disabled={status === 'loading'}
        />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={status === 'loading'} disabled={status === 'loading'}>
          {status === 'loading' ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}
