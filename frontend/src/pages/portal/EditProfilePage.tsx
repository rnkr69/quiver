import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { portalApi, type PortalProfile } from '@/api/portal.api'
import { useToast } from '@/components/ui/Toast'
import { BackLink } from '@/components/ui/BackLink'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [profile, setProfile] = useState<PortalProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    portalApi.getProfile().then((res) => {
      setProfile(res.data)
      setFirstName(res.data.first_name)
      setLastName(res.data.last_name)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword && newPassword !== confirmPassword) {
      setError(t('portal.editProfile.passwordMismatch'))
      return
    }
    if (newPassword && !currentPassword) {
      setError(t('portal.editProfile.currentPasswordRequired'))
      return
    }
    setSaving(true)
    try {
      await portalApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        ...(newPassword ? { current_password: currentPassword, new_password: newPassword } : {}),
      })
      toast(t('portal.editProfile.updateSuccess'), 'success')
      navigate('/portal/perfil')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        t('portal.editProfile.updateError')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div>
        <div className="h-6 w-[180px] bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-[600px]">
      <BackLink to="/portal/perfil" label={t('portal.profile.title')} />
      <PageHeader title={t('portal.editProfile.title')} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('portal.profile.firstName')} value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label={t('portal.profile.lastName')} value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>

          <div className="border-t border-gray-100 mt-5 pt-5">
            <div className="text-md font-medium text-gray-700 mb-4">
              {t('portal.editProfile.changePassword')}{' '}
              <span className="font-normal text-gray-400">({t('common.optional').toLowerCase()})</span>
            </div>
            <div className="flex flex-col gap-3">
              <PasswordInput label={t('portal.editProfile.currentPassword')} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <PasswordInput label={t('portal.editProfile.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <PasswordInput label={t('portal.editProfile.confirmNewPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mt-4" />}
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/portal/perfil')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={saving}>
            {saving ? t('common.saving') : t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  )
}
