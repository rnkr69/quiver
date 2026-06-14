import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
import { BackLink } from '@/components/ui/BackLink'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'

export function CreatePage() {
  const { t } = useTranslation()
  const { resource } = useParams<{ resource: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['crud-config', resource],
    queryFn: () => crudApi.getConfig(resource!),
    staleTime: 1000 * 60 * 5,
    enabled: !!resource,
  })

  const create = useMutation({
    mutationFn: (data: unknown) => crudApi.create(resource!, data),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ['crud-list', resource] })
      toast(t('crud.recordCreated'))
      navigate(`/admin/${resource}/${(row as Record<string, unknown>).id}`)
    },
    onError: () => toast(t('crud.recordCreateError'), 'error'),
  })

  if (isLoading) return <div className="text-gray-700 text-base">{t('common.loading')}</div>
  if (!config) return null

  return (
    <div>
      <div className="mb-5">
        <BackLink to={`/admin/${resource}`} label={t('common.backToList')} />
        <h1 className="text-3xl font-semibold text-gray-900 mt-2">{t('crud.createTitle', { name: config.title ?? resource })}</h1>
      </div>
      <Card className="p-6">
        <CrudForm
          fields={config.fields}
          mode="create"
          loading={create.isPending}
          onSubmit={values => create.mutate(values)}
          onCancel={() => navigate(`/admin/${resource}`)}
        />
      </Card>
    </div>
  )
}
