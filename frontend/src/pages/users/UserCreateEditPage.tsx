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

  if (mode === 'edit' && userLoading) return <div className="text-gray-500 text-base">Cargando...</div>

  const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.id))
  const availableRoles = roles.filter(r => !selectedRoleIds.includes(r.id))
  const backTo = mode === 'edit' ? `/admin/users/${id}` : '/admin/users'

  return (
    <div>
      <BackLink to={backTo} label={mode === 'edit' ? 'Volver al detalle' : 'Volver al listado'} />
      <PageHeader title={mode === 'create' ? 'Crear usuario' : 'Editar usuario'} />

      <Card className="p-6">
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-4 mb-5">
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

        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">Roles</label>
          <div className="flex gap-1.5 flex-wrap items-center">
            {selectedRoles.map(r => (
              <div key={r.id} className="flex items-center gap-1 bg-brand-50 text-brand-700 py-0.5 pr-2 pl-2.5 rounded text-md">
                {r.display_name}
                <button
                  onClick={() => setSelectedRoleIds(ids => ids.filter(i => i !== r.id))}
                  className="bg-transparent border-none cursor-pointer text-brand-500 text-base p-0 leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            {availableRoles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setAddingRole(o => !o)}
                  className="px-2.5 py-0.5 text-md font-sans bg-transparent text-gray-600 border border-dashed border-gray-300 rounded cursor-pointer"
                >
                  + Agregar rol
                </button>
                {addingRole && (
                  <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-md shadow-md min-w-[160px] py-1">
                    {availableRoles.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRoleIds(ids => [...ids, r.id]); setAddingRole(false) }}
                        className="block w-full text-left px-3 py-1.5 bg-transparent border-none text-md text-gray-800 cursor-pointer font-sans hover:bg-gray-50"
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

        <div className="mb-6">
          <Toggle
            checked={isSuperuser}
            onChange={setIsSuperuser}
            label="Superusuario (acceso total, sin restricciones de permiso)"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => navigate(backTo)} disabled={loading}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={() => mode === 'create' ? create.mutate() : update.mutate()}>
            {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
