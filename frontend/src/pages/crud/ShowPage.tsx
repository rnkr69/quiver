import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CrudForm } from '@/components/crud/CrudForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { crudApi } from '@/api/crud.api'

export function ShowPage() {
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
      toast('Registro eliminado correctamente')
      navigate(`/admin/${resource}`)
    },
    onError: () => toast('Error al eliminar el registro', 'error'),
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

  const canUpdate = config.permissions?.update !== false
  const canDelete = config.permissions?.delete !== false

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => navigate(`/admin/${resource}`)}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#009ca6', cursor: 'pointer', padding: 0 }}
          >
            ← Volver al listado
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginTop: 8 }}>
            {config.title ?? resource}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 24 }}>
          {canUpdate && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/${resource}/${id}/edit`)}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 8, padding: 24 }}>
        <CrudForm
          fields={config.fields}
          initialValues={item}
          mode="show"
        />
      </div>

      <Modal
        open={deleteModalOpen}
        title="Eliminar registro"
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleteModalOpen(false)}
      >
        ¿Eliminar este registro? Esta acción no se puede deshacer.
      </Modal>
    </div>
  )
}
