import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

interface Props {
  selectedCount: number
  actions: string[]
  loading?: boolean
  onAction: (action: string) => void
  onClear: () => void
}

export function BulkActions({ selectedCount, actions, loading, onAction, onClear }: Props) {
  const { t } = useTranslation()
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-[10px] bg-brand-50 rounded-md mb-3">
      <span className="text-base text-brand-700 font-medium">
        {t('crud.selectedCount', { count: selectedCount })}
      </span>
      <div className="flex-1" />
      {actions.map(action => (
        <Button
          key={action}
          variant={action === 'delete' ? 'danger' : 'secondary'}
          size="sm"
          loading={loading}
          onClick={() => onAction(action)}
        >
          {action === 'delete' ? t('crud.deleteSelected') : action}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClear}>
        {t('crud.deselect')}
      </Button>
    </div>
  )
}
