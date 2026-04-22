import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
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

  if (configLoading || itemLoading) return <div style={{ padding: 24, color: '#6b6b6b' }}>Cargando...</div>
  if (!config) return null
  if (isError || !item) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: '#6b6b6b', marginBottom: 16 }}>No se encontró el registro.</p>
        <button onClick={() => navigate(`/admin/${resource}`)} style={{ color: '#009ca6', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/admin/${resource}/${id}`)}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#009ca6', cursor: 'pointer', padding: 0 }}
        >
          ← Volver al detalle
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginTop: 8 }}>
          Editar {config.title ?? resource}
        </h1>
      </div>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 8, padding: 24 }}>
        <CrudForm
          fields={config.fields}
          initialValues={item}
          mode="edit"
          loading={update.isPending}
          onSubmit={values => update.mutate(values)}
          onCancel={() => navigate(`/admin/${resource}/${id}`)}
        />
      </div>
    </div>
  )
}
