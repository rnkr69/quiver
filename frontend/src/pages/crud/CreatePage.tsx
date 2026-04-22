import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'

export function CreatePage() {
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
      toast('Registro creado correctamente')
      navigate(`/admin/${resource}/${(row as Record<string, unknown>).id}`)
    },
    onError: () => toast('Error al crear el registro', 'error'),
  })

  if (isLoading) return <div style={{ padding: 24, color: '#6b6b6b' }}>Cargando...</div>
  if (!config) return null

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/admin/${resource}`)}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#009ca6', cursor: 'pointer', padding: 0 }}
        >
          ← Volver al listado
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginTop: 8 }}>
          Crear {config.title ?? resource}
        </h1>
      </div>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 8, padding: 24 }}>
        <CrudForm
          fields={config.fields}
          mode="create"
          loading={create.isPending}
          onSubmit={values => create.mutate(values)}
          onCancel={() => navigate(`/admin/${resource}`)}
        />
      </div>
    </div>
  )
}
