import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { BackLink } from '@/components/ui/BackLink'
import { DetailField } from '@/components/ui/DetailField'
import { useToast } from '@/components/ui/Toast'
import { usersApi } from '@/api/users.api'

export function UserDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  })

  const deactivate = useMutation({
    mutationFn: () => usersApi.deactivate(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user', id] })
      setDeactivateOpen(false)
      toast(t('users.deactivateSuccess'))
    },
    onError: () => toast(t('users.deactivateError'), 'error'),
  })

  if (isLoading) return <div className="text-gray-500 text-base">{t('common.loading')}</div>
  if (isError || !user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">{t('users.notFound')}</p>
        <BackLink to="/admin/users" label={t('common.backToList')} />
      </div>
    )
  }

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div>
      <BackLink to="/admin/users" label={t('common.backToList')} />

      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-lg font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-0.5">{user.first_name} {user.last_name}</h1>
              <span className="text-md text-gray-500">{user.email}</span>
              <div className="flex gap-1 flex-wrap mt-1.5">
                {user.is_superuser && <Badge variant="warning">Superuser</Badge>}
                {user.roles.map(r => <Badge key={r.id} variant="active">{r.display_name}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/users/${id}/edit`)}>
              {t('common.edit')}
            </Button>
            {user.is_active && (
              <Button variant="danger" size="sm" onClick={() => setDeactivateOpen(true)}>
                {t('users.deactivate')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-x-6 gap-y-4">
          <DetailField label={t('users.fieldFirstName')} value={user.first_name} />
          <DetailField label={t('users.fieldLastName')} value={user.last_name} />
          <DetailField label={t('users.fieldEmail')} value={user.email} />
          <DetailField label={t('users.colStatus')} value={
            <Badge variant={user.is_active ? 'success' : 'inactive'}>
              {user.is_active ? t('common.active') : t('common.inactive')}
            </Badge>
          } />
          <DetailField label={t('users.memberSince')} value={new Date(user.created_at).toLocaleDateString('es')} />
          <DetailField
            label={t('users.colLastLogin')}
            value={user.last_login_at ? new Date(user.last_login_at).toLocaleString('es') : '—'}
          />
        </div>
      </Card>

      <Modal
        open={deactivateOpen}
        title={t('users.deactivateTitle')}
        confirmLabel={t('users.deactivate')}
        loading={deactivate.isPending}
        onConfirm={() => deactivate.mutate()}
        onCancel={() => setDeactivateOpen(false)}
      >
        {t('users.deactivateConfirmNamed', { name: `${user.first_name} ${user.last_name}` })}
      </Modal>
    </div>
  )
}
