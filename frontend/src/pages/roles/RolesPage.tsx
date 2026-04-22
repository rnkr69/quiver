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

  const th: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left',
    fontSize: 13, fontWeight: 600, color: 'var(--gray-700)',
    background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)',
  }
  const td: React.CSSProperties = {
    padding: '12px 16px', fontSize: 14, color: 'var(--gray-900)',
    borderBottom: '1px solid var(--gray-100)', verticalAlign: 'middle',
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        actions={<Button variant="primary" onClick={() => setCreating(true)}>+ Crear rol</Button>}
      />

      {isLoading ? (
        <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}>Identificador</th>
                <th style={{ ...th, textAlign: 'center' }}>Permisos</th>
                <th style={{ ...th, width: 40 }}></th>
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
                <tr
                  key={role.id}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, fontWeight: 500 }}>{role.display_name}</td>
                  <td style={td}>
                    <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, color: 'var(--gray-600)' }}>
                      {role.name}
                    </code>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <Badge variant="active">{role.permissions_count} permisos</Badge>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
