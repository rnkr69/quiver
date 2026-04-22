import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalApi, type PortalProfile } from '@/api/portal.api'
import { useToast } from '@/components/ui/Toast'
import { BackLink } from '@/components/ui/BackLink'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
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
        <div style={{ height: 24, width: 180, background: 'var(--gray-100)', borderRadius: 4 }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <BackLink to="/portal/perfil" label="Mi perfil" />
      <PageHeader title="Editar perfil" />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label="Apellidos" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>

          <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: 20, paddingTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 16 }}>
              Cambiar contraseña{' '}
              <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(opcional)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PasswordInput label="Contraseña actual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <PasswordInput label="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <PasswordInput label="Confirmar nueva contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {error && <Alert type="error" message={error} style={{ marginTop: 16 }} />}
        </Card>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/portal/perfil')}
            style={{
              padding: '8px 16px', fontSize: 14, fontWeight: 500,
              background: 'white', color: 'var(--gray-800)',
              border: '1px solid var(--gray-300)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '8px 16px', fontSize: 14, fontWeight: 500,
              background: saving ? 'var(--gray-300)' : 'var(--brand-500)',
              color: 'white', border: '1px solid transparent', borderRadius: 6,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
