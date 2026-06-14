import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = { email: '', password: '' }
    if (!email) errs.email = t('auth.login.emailRequired')
    if (!password) errs.password = t('auth.login.passwordRequired')
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
            ? t('auth.login.accountDisabled')
            : t('auth.login.invalidCredentials'))
        } else {
          setErrorMsg(t('common.genericError'))
        }
      } else {
        setErrorMsg(t('common.genericError'))
      }
    }
  }

  const isLoading = status === 'loading'

  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('auth.login.title')}</h2>
      <p className="text-md text-gray-600 mb-6">{t('auth.login.subtitle')}</p>

      {status === 'error' && <Alert type="error" message={errorMsg} className="mb-4" />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t('auth.fields.email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('auth.fields.emailPlaceholder')}
          disabled={isLoading}
          error={fieldErrors.email}
          required
        />
        <PasswordInput
          label={t('auth.fields.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={isLoading} disabled={isLoading}>
          {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>

      <div className="text-center mt-4">
        <a href="/auth/forgot-password" className="text-md text-brand-500 hover:underline">
          {t('auth.login.forgotPassword')}
        </a>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-5 bg-gray-50 border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-600">
          <strong className="text-gray-700">{t('auth.login.demoLabel')}</strong> {t('auth.login.demoHint')}
        </div>
      )}
    </AuthLayout>
  )
}
