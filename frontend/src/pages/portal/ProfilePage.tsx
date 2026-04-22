import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { portalApi, type PortalProfile } from '@/api/portal.api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DetailField } from '@/components/ui/DetailField'
import { PageHeader } from '@/components/ui/PageHeader'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ProfilePage() {
  const [profile, setProfile] = useState<PortalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portalApi.getProfile().then((res) => setProfile(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 32, width: 140, background: 'var(--gray-100)', borderRadius: 4 }} />
        <div style={{ height: 160, background: 'var(--gray-100)', borderRadius: 8 }} />
      </div>
    )
  }

  if (!profile) {
    return <div style={{ color: 'var(--gray-500)', padding: 24 }}>No se pudo cargar el perfil.</div>
  }

  const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Mi perfil" />

      <Card>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'var(--brand-50)', color: 'var(--brand-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 2px' }}>
                {profile.first_name} {profile.last_name}
              </p>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '0 0 6px' }}>{profile.email}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {profile.roles.map(r => <Badge key={r} variant="client">{r}</Badge>)}
              </div>
            </div>
          </div>
          <Link
            to="/portal/perfil/editar"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 14, fontWeight: 500,
              background: 'white', color: 'var(--gray-800)',
              border: '1px solid var(--gray-300)', borderRadius: 6,
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            <Pencil size={14} />
            Editar perfil
          </Link>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-200)', padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <DetailField label="Nombre" value={profile.first_name} />
            <DetailField label="Apellidos" value={profile.last_name} />
            <DetailField
              label="Email"
              value={<>{profile.email} <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>(no editable)</span></>}
              style={{ gridColumn: '1 / -1' }}
            />
            <DetailField
              label="Miembro desde"
              value={formatDate(profile.created_at)}
              style={{ gridColumn: '1 / -1' }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
