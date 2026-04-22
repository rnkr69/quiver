import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
import { BackLink } from '@/components/ui/BackLink'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'

export function EditPage() {
  const { resource, id } = useParams<{ resource: string; id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()

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

  const update = useMutation({
    mutationFn: (data: unknown) => crudApi.update(resource!, id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crud-list', resource] })
      qc.invalidateQueries({ queryKey: ['crud-item', resource, id] })
      toast('Cambios guardados correctamente')
      navigate(`/admin/${resource}/${id}`)
    },
    onError: () => toast('Error al guardar los cambios', 'error'),
  })

  if (configLoading || itemLoading) return <div className="text-gray-700 text-base">Cargando...</div>
  if (!config) return null
  if (isError || !item) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-700 mb-4">No se encontró el registro.</p>
        <Button variant="link" onClick={() => navigate(`/admin/${resource}`)}>← Volver al listado</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <BackLink to={`/admin/${resource}/${id}`} label="Volver al detalle" />
        <h1 className="text-3xl font-semibold text-gray-900 mt-2">Editar {config.title ?? resource}</h1>
      </div>
      <Card className="p-6">
        <CrudForm
          fields={config.fields}
          initialValues={item}
          mode="edit"
          loading={update.isPending}
          onSubmit={values => update.mutate(values)}
          onCancel={() => navigate(`/admin/${resource}/${id}`)}
        />
      </Card>
    </div>
  )
}
