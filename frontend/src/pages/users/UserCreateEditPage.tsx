import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'
import { BackLink } from '@/components/ui/BackLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { usersApi } from '@/api/users.api'
import { rolesApi } from '@/api/roles.api'

interface Props {
  mode: 'create' | 'edit'
}

export function UserCreateEditPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [addingRole, setAddingRole] = useState(false)

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id!),
    enabled: mode === 'edit' && !!id,
  })

  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setIsSuperuser(user.is_superuser)
      setSelectedRoleIds(user.roles.map(r => r.id))
    }
  }, [user])

  const create = useMutation({
    mutationFn: () => usersApi.create({ email, password, first_name: firstName, last_name: lastName, is_superuser: isSuperuser, role_ids: selectedRoleIds }),
    onSuccess: (u) => { qc.invalidateQueries({ queryKey: ['users'] }); toast('Usuario creado correctamente'); navigate(`/admin/users/${u.id}`) },
    onError: () => toast('Error al crear el usuario', 'error'),
  })

  const update = useMutation({
    mutationFn: () => usersApi.update(id!, { email, first_name: firstName, last_name: lastName, is_superuser: isSuperuser, role_ids: selectedRoleIds, ...(password ? { password } : {}) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); qc.invalidateQueries({ queryKey: ['user', id] }); toast('Cambios guardados correctamente'); navigate(`/admin/users/${id}`) },
    onError: () => toast('Error al guardar los cambios', 'error'),
  })

  const loading = create.isPending || update.isPending

  if (mode === 'edit' && userLoading) return <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando...</div>

  const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.id))
  const availableRoles = roles.filter(r => !selectedRoleIds.includes(r.id))
  const backTo = mode === 'edit' ? `/admin/users/${id}` : '/admin/users'

  return (
    <div>
      <BackLink to={backTo} label={mode === 'edit' ? 'Volver al detalle' : 'Volver al listado'} />
      <PageHeader title={mode === 'create' ? 'Crear usuario' : 'Editar usuario'} />

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
          <Input label="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <Input label="Apellidos" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <PasswordInput
            label={mode === 'edit' ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'edit' ? '••••••••' : ''}
            required={mode === 'create'}
          />
        </div>

        {/* Roles */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Roles</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedRoles.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--brand-50)', color: 'var(--brand-700)',
                padding: '3px 8px 3px 10px', borderRadius: 4, fontSize: 13,
              }}>
                {r.display_name}
                <button
                  onClick={() => setSelectedRoleIds(ids => ids.filter(i => i !== r.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-500)', fontSize: 14, padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
            {availableRoles.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setAddingRole(o => !o)}
                  style={{
                    padding: '3px 10px', fontSize: 13, fontFamily: 'inherit',
                    background: 'transparent', color: 'var(--gray-600)',
                    border: '1px dashed var(--gray-300)', borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  + Agregar rol
                </button>
                {addingRole && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
                    background: 'white', border: '1px solid var(--gray-200)', borderRadius: 6,
                    boxShadow: 'var(--shadow-md)', minWidth: 160, padding: '4px 0',
                  }}>
                    {availableRoles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRoleIds(ids => [...ids, r.id]); setAddingRole(false) }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '7px 12px', background: 'none', border: 'none',
                          fontSize: 13, color: 'var(--gray-800)', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        {r.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Toggle
            checked={isSuperuser}
            onChange={setIsSuperuser}
            label="Superusuario (acceso total, sin restricciones de permiso)"
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => navigate(backTo)} disabled={loading}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={() => mode === 'create' ? create.mutate() : update.mutate()}>
            {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
