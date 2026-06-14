import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['role', id] }); qc.invalidateQueries({ queryKey: ['roles'] }); toast(t('roles.permissionsSaveSuccess')) },
    onError: () => toast(t('roles.permissionsSaveError'), 'error'),
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

  if (roleLoading || permsLoading) return <div className="text-gray-500 text-base">{t('common.loading')}</div>
  if (!role) return null

  const groups = groupPermissions(allPermissions)
  const checkedCount = [...checkedMap.values()].filter(Boolean).length

  return (
    <div>
      <BackLink to="/admin/roles" label={t('roles.backToRoles')} />
      <PageHeader title={t('roles.editTitle', { name: role.display_name })} />

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('roles.permissionsActive', { count: checkedCount, total: allPermissions.length })}
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
            className="text-md text-brand-500 bg-transparent border-none cursor-pointer font-sans"
          >
            {allPermissions.every(p => checkedMap.get(p.id)) ? t('roles.deselectAll') : t('roles.selectAll')}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {Object.entries(groups).map(([groupName, groupPerms]) => {
            const allChecked = groupPerms.every(p => checkedMap.get(p.id))
            const someChecked = groupPerms.some(p => checkedMap.get(p.id))

            return (
              <div key={groupName} className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked }}
                    onChange={() => toggleGroup(groupPerms)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-[0.06em]">
                    {groupName}
                  </span>
                </div>
                <div className="grid [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] gap-1.5">
                  {groupPerms.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedMap.get(perm.id) ?? false}
                        onChange={() => togglePermission(perm.id)}
                        className="cursor-pointer"
                      />
                      <span className="text-md text-gray-800">{perm.display_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mt-5 mb-4 bg-warning-50 border border-warning-500 rounded px-3.5 py-2.5 text-sm text-warning-500">
          <Clock size={14} />
          {t('roles.propagationWarning')}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin/roles')}>{t('common.cancel')}</Button>
          <Button variant="primary" loading={savePermissions.isPending} onClick={() => savePermissions.mutate()}>
            {t('roles.savePermissions')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
