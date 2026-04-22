import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { RowMenu } from '@/components/ui/RowMenu'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { usersApi } from '@/api/users.api'

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  )
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

const thClass = 'px-4 py-2.5 text-left text-md font-semibold text-gray-700 bg-gray-50 border-b border-gray-200'
const tdClass = 'px-4 py-3 text-base text-gray-900 border-b border-gray-100 align-middle'

export function UsersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [deactivateId, setDeactivateId] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list })

  const deactivate = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeactivateId(null); toast('Usuario desactivado correctamente') },
    onError: () => toast('Error al desactivar el usuario', 'error'),
  })

  return (
    <div>
      <PageHeader
        title="Usuarios"
        actions={<Button variant="primary" onClick={() => navigate('/admin/users/new')}>+ Crear usuario</Button>}
      />

      {isLoading ? (
        <div className="text-gray-500 text-base">Cargando...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Usuario</th>
                <th className={thClass}>Roles</th>
                <th className={thClass}>Estado</th>
                <th className={thClass}>Último acceso</th>
                <th className={`${thClass} w-10`}></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={<Users size={40} />} title="No hay usuarios" description="Crea el primer usuario para comenzar." />
                  </td>
                </tr>
              ) : users.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={user.first_name} lastName={user.last_name} />
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-1 flex-wrap">
                      {user.is_superuser && <Badge variant="warning">Superuser</Badge>}
                      {user.roles.map(r => <Badge key={r.id} variant="active">{r.display_name}</Badge>)}
                    </div>
                  </td>
                  <td className={tdClass}>
                    <Badge variant={user.is_active ? 'success' : 'inactive'}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className={`${tdClass} text-gray-600 text-md`}>{formatDate(user.last_login_at)}</td>
                  <td className={`${tdClass} text-right`} onClick={e => e.stopPropagation()}>
                    <RowMenu items={[
                      { label: 'Editar', action: () => navigate(`/admin/users/${user.id}/edit`) },
                      'divider',
                      ...(user.is_active ? [{ label: 'Desactivar', danger: true as const, action: () => setDeactivateId(user.id) }] : []),
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!deactivateId}
        title="Desactivar usuario"
        confirmLabel="Desactivar"
        loading={deactivate.isPending}
        onConfirm={() => deactivateId && deactivate.mutate(deactivateId)}
        onCancel={() => setDeactivateId(null)}
      >
        ¿Desactivar este usuario? El usuario no podrá iniciar sesión hasta que sea reactivado.
      </Modal>
    </div>
  )
}
