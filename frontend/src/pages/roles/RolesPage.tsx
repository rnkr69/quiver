import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Edit, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { RowMenu } from '@/components/ui/RowMenu'
import { useToast } from '@/components/ui/Toast'
import { rolesApi } from '@/api/roles.api'

const thClass = 'px-4 py-2.5 text-left text-md font-semibold text-gray-700 bg-gray-50 border-b border-gray-200'
const tdClass = 'px-4 py-3 text-base text-gray-900 border-b border-gray-100 align-middle'

export function RolesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')

  const { data: roles = [], isLoading } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })

  const deleteRole = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setDeleteId(null); toast('Rol eliminado correctamente') },
    onError: () => toast('Error al eliminar el rol', 'error'),
  })

  const createRole = useMutation({
    mutationFn: () => rolesApi.create({ name: newName, display_name: newDisplayName }),
    onSuccess: (role) => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      setCreating(false); setNewName(''); setNewDisplayName('')
      toast('Rol creado correctamente')
      navigate(`/admin/roles/${role.id}/edit`)
    },
    onError: () => toast('Error al crear el rol', 'error'),
  })

  return (
    <div>
      <PageHeader
        title="Roles"
        actions={<Button variant="primary" onClick={() => setCreating(true)}>+ Crear rol</Button>}
      />

      {isLoading ? (
        <div className="text-gray-500 text-base">Cargando...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Identificador</th>
                <th className={`${thClass} text-center`}>Permisos</th>
                <th className={`${thClass} w-10`}></th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState icon={<Shield size={40} />} title="No hay roles" description="Crea el primer rol para asignar permisos." />
                  </td>
                </tr>
              ) : roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className={`${tdClass} font-medium`}>{role.display_name}</td>
                  <td className={tdClass}>
                    <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{role.name}</code>
                  </td>
                  <td className={`${tdClass} text-center`}>
                    <Badge variant="active">{role.permissions_count} permisos</Badge>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <RowMenu items={[
                      { label: 'Editar', icon: <Edit size={14} />, action: () => navigate(`/admin/roles/${role.id}/edit`) },
                      'divider',
                      { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, action: () => setDeleteId(role.id) },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={creating}
        title="Crear rol"
        confirmLabel="Crear"
        variant="primary"
        loading={createRole.isPending}
        onConfirm={() => createRole.mutate()}
        onCancel={() => { setCreating(false); setNewName(''); setNewDisplayName('') }}
      >
        <div className="flex flex-col gap-3">
          <Input label="Nombre para mostrar" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="ej. Supervisor" required />
          <Input
            label="Identificador (slug)"
            value={newName}
            onChange={e => setNewName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder="ej. supervisor"
            required
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        title="Eliminar rol"
        confirmLabel="Eliminar"
        loading={deleteRole.isPending}
        onConfirm={() => deleteId && deleteRole.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      >
        ¿Eliminar este rol? Los usuarios asignados a este rol perderán sus permisos.
      </Modal>
    </div>
  )
}
