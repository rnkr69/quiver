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
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'var(--brand-50)', color: 'var(--brand-700)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 600,
    }}>
      {initials}
    </div>
  )
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

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
        title="Usuarios"
        actions={<Button variant="primary" onClick={() => navigate('/admin/users/new')}>+ Crear usuario</Button>}
      />

      {isLoading ? (
        <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Usuario</th>
                <th style={th}>Roles</th>
                <th style={th}>Estado</th>
                <th style={th}>Último acceso</th>
                <th style={{ ...th, width: 40 }}></th>
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
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar firstName={user.first_name} lastName={user.last_name} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.first_name} {user.last_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {user.is_superuser && <Badge variant="warning">Superuser</Badge>}
                      {user.roles.map(r => <Badge key={r.id} variant="active">{r.display_name}</Badge>)}
                    </div>
                  </td>
                  <td style={td}>
                    <Badge variant={user.is_active ? 'success' : 'inactive'}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td style={{ ...td, color: 'var(--gray-600)', fontSize: 13 }}>
                    {formatDate(user.last_login_at)}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
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
