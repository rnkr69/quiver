import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [profile, setProfile] = useState<PortalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portalApi.getProfile().then((res) => setProfile(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-8 w-[140px] bg-gray-100 rounded animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-gray-500 py-6">{t('portal.profile.loadError')}</div>
  }

  const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div className="max-w-[640px]">
      <PageHeader title={t('portal.profile.title')} />

      <Card>
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-0.5">{profile.first_name} {profile.last_name}</p>
              <p className="text-md text-gray-600 mb-1.5">{profile.email}</p>
              <div className="flex flex-wrap gap-1">
                {profile.roles.map(r => <Badge key={r} variant="client">{r}</Badge>)}
              </div>
            </div>
          </div>
          <Link
            to="/portal/perfil/editar"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 no-underline shrink-0"
          >
            <Pencil size={14} />
            {t('portal.profile.editProfile')}
          </Link>
        </div>

        <div className="border-t border-gray-200 px-6 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <DetailField label={t('portal.profile.firstName')} value={profile.first_name} />
            <DetailField label={t('portal.profile.lastName')} value={profile.last_name} />
            <DetailField
              label={t('portal.profile.email')}
              value={<>{profile.email} <span className="text-xs text-gray-400">{t('portal.profile.notEditable')}</span></>}
              className="col-span-full"
            />
            <DetailField
              label={t('portal.profile.memberSince')}
              value={formatDate(profile.created_at)}
              className="col-span-full"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
