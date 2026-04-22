import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { BackLink } from '@/components/ui/BackLink'
import { DetailField } from '@/components/ui/DetailField'
import { useToast } from '@/components/ui/Toast'
import { usersApi } from '@/api/users.api'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  })

  const deactivate = useMutation({
    mutationFn: () => usersApi.deactivate(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user', id] })
      setDeactivateOpen(false)
      toast('Usuario desactivado correctamente')
    },
    onError: () => toast('Error al desactivar el usuario', 'error'),
  })

  if (isLoading) return <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando...</div>
  if (isError || !user) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>Usuario no encontrado.</p>
        <BackLink to="/admin/users" label="Volver al listado" />
      </div>
    )
  }

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div>
      <BackLink to="/admin/users" label="Volver al listado" />

      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: 'var(--brand-50)', color: 'var(--brand-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 600,
            }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 2px' }}>
                {user.first_name} {user.last_name}
              </h1>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {user.is_superuser && <Badge variant="warning">Superuser</Badge>}
                {user.roles.map(r => <Badge key={r.id} variant="active">{r.display_name}</Badge>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/users/${id}/edit`)}>
              Editar
            </Button>
            {user.is_active && (
              <Button variant="danger" size="sm" onClick={() => setDeactivateOpen(true)}>
                Desactivar
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 24px' }}>
          <DetailField label="Nombre" value={user.first_name} />
          <DetailField label="Apellidos" value={user.last_name} />
          <DetailField label="Email" value={user.email} />
          <DetailField label="Estado" value={
            <Badge variant={user.is_active ? 'success' : 'inactive'}>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          } />
          <DetailField label="Miembro desde" value={new Date(user.created_at).toLocaleDateString('es')} />
          <DetailField
            label="Último acceso"
            value={user.last_login_at ? new Date(user.last_login_at).toLocaleString('es') : '—'}
          />
        </div>
      </Card>

      <Modal
        open={deactivateOpen}
        title="Desactivar usuario"
        confirmLabel="Desactivar"
        loading={deactivate.isPending}
        onConfirm={() => deactivate.mutate()}
        onCancel={() => setDeactivateOpen(false)}
      >
        ¿Desactivar a {user.first_name} {user.last_name}? El usuario no podrá iniciar sesión hasta que sea reactivado.
      </Modal>
    </div>
  )
}
