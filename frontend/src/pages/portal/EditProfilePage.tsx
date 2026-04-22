import { useEffect, useState } from 'react'
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
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (newPassword && !currentPassword) {
      setError('Debes ingresar tu contraseña actual para establecer una nueva.')
      return
    }
    setSaving(true)
    try {
      await portalApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        ...(newPassword ? { current_password: currentPassword, new_password: newPassword } : {}),
      })
      toast('Perfil actualizado correctamente.', 'success')
      navigate('/portal/perfil')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'No se pudo actualizar el perfil.'
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
      <BackLink to="/portal/perfil" label="Mi perfil" />
      <PageHeader title="Editar perfil" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label="Apellidos" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>

          <div className="border-t border-gray-100 mt-5 pt-5">
            <div className="text-md font-medium text-gray-700 mb-4">
              Cambiar contraseña{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </div>
            <div className="flex flex-col gap-3">
              <PasswordInput label="Contraseña actual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <PasswordInput label="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <PasswordInput label="Confirmar nueva contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <Alert type="error" message={error} className="mt-4" />}
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/portal/perfil')}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
