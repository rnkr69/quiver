import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
import { BackLink } from '@/components/ui/BackLink'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'

export function ShowPage() {
  const { t } = useTranslation()
  const { resource, id } = useParams<{ resource: string; id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['crud-config', resource],
    queryFn: () => crudApi.getConfig(resource!),
    staleTime: 1000 * 60 * 5,
    enabled: !!resource,
  })

  const { data: item, isLoading: itemLoading, isError } = useQuery({
    queryKey: ['crud-item', resource, id],
    queryFn: () => crudApi.get(resource!, id!),
    enabled: !!resource && !!id,
  })

  const remove = useMutation({
    mutationFn: () => crudApi.remove(resource!, id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crud-list', resource] })
      toast(t('crud.recordDeleted'))
      navigate(`/admin/${resource}`)
    },
    onError: () => toast(t('crud.recordDeleteError'), 'error'),
  })

  if (configLoading || itemLoading) return <div className="text-gray-700 text-base">{t('common.loading')}</div>
  if (!config) return null
  if (isError || !item) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 mb-4">{t('crud.notFound')}</p>
        <Button variant="link" onClick={() => navigate(`/admin/${resource}`)}>← {t('common.backToList')}</Button>
      </div>
    )
  }

  const canUpdate = config.permissions?.update !== false
  const canDelete = config.permissions?.delete !== false

  return (
    <div>
      <div className="flex items-start mb-5 gap-3">
        <div className="flex-1">
          <BackLink to={`/admin/${resource}`} label={t('common.backToList')} />
          <h1 className="text-3xl font-semibold text-gray-900 mt-2">{config.title ?? resource}</h1>
        </div>
        <div className="flex gap-2 pt-6">
          {canUpdate && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/${resource}/${id}/edit`)}>
              {t('common.edit')}
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <CrudForm
          fields={config.fields}
          initialValues={item}
          mode="show"
        />
      </Card>

      <Modal
        open={deleteModalOpen}
        title={t('crud.deleteRecordTitle')}
        confirmLabel={t('common.delete')}
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleteModalOpen(false)}
      >
        {t('crud.deleteRecordConfirm')}
      </Modal>
    </div>
  )
}
