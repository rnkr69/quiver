import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BackLink } from '@/components/ui/BackLink'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { rolesApi } from '@/api/roles.api'
import type { Permission, RoleDetail } from '@/api/roles.api'

function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const p of permissions) {
    if (!groups[p.group]) groups[p.group] = []
    groups[p.group].push(p)
  }
  return groups
}

export function RoleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: role, isLoading: roleLoading } = useQuery<RoleDetail>({ queryKey: ['role', id], queryFn: () => rolesApi.get(id!), enabled: !!id })
  const { data: allPermissions = [], isLoading: permsLoading } = useQuery({ queryKey: ['permissions'], queryFn: rolesApi.listPermissions })
  const [checkedMap, setCheckedMap] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    if (role) {
      const m = new Map<string, boolean>()
      for (const p of allPermissions) m.set(p.id, false)
      for (const p of role.permissions) m.set(p.id, true)
      setCheckedMap(m)
    }
  }, [role, allPermissions])

  const savePermissions = useMutation({
    mutationFn: () => {
      const ids = [...checkedMap.entries()].filter(([, v]) => v).map(([k]) => k)
      return rolesApi.setPermissions(id!, ids)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['role', id] }); qc.invalidateQueries({ queryKey: ['roles'] }); toast('Permisos guardados correctamente') },
    onError: () => toast('Error al guardar permisos', 'error'),
  })

  function togglePermission(permId: string) {
    setCheckedMap(prev => new Map(prev).set(permId, !prev.get(permId)))
  }

  function toggleGroup(group: Permission[]) {
    const allChecked = group.every(p => checkedMap.get(p.id))
    setCheckedMap(prev => {
      const next = new Map(prev)
      for (const p of group) next.set(p.id, !allChecked)
      return next
    })
  }

  if (roleLoading || permsLoading) return <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando...</div>
  if (!role) return null

  const groups = groupPermissions(allPermissions)
  const checkedCount = [...checkedMap.values()].filter(Boolean).length

  return (
    <div>
      <BackLink to="/admin/roles" label="Volver a roles" />
      <PageHeader title={`Editar rol: ${role.display_name}`} />

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>
            Permisos — {checkedCount} de {allPermissions.length} activos
          </h2>
          <button
            onClick={() => {
              const allChecked = allPermissions.every(p => checkedMap.get(p.id))
              setCheckedMap(prev => {
                const next = new Map(prev)
                for (const p of allPermissions) next.set(p.id, !allChecked)
                return next
              })
            }}
            style={{ fontSize: 13, color: 'var(--brand-500)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {allPermissions.every(p => checkedMap.get(p.id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(groups).map(([groupName, groupPerms]) => {
            const allChecked = groupPerms.every(p => checkedMap.get(p.id))
            const someChecked = groupPerms.some(p => checkedMap.get(p.id))

            return (
              <div key={groupName} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                    onChange={() => toggleGroup(groupPerms)}
                    style={{ width: 15, height: 15, accentColor: 'var(--brand-500)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {groupName}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 6 }}>
                  {groupPerms.map(perm => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checkedMap.get(perm.id) ?? false}
                        onChange={() => togglePermission(perm.id)}
                        style={{ width: 14, height: 14, accentColor: 'var(--brand-500)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--gray-800)' }}>{perm.display_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          marginTop: 20, background: 'var(--warning-50)', border: '1px solid var(--warning-500)',
          borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'var(--warning-500)',
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        }}>
          <Clock size={14} />
          Los cambios pueden tardar hasta 15 minutos en reflejarse en sesiones activas.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => navigate('/admin/roles')}>Cancelar</Button>
          <Button variant="primary" loading={savePermissions.isPending} onClick={() => savePermissions.mutate()}>
            Guardar permisos
          </Button>
        </div>
      </Card>
    </div>
  )
}
