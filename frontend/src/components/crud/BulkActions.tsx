import { Button } from '@/components/ui/Button'

interface Props {
  selectedCount: number
  actions: string[]
  loading?: boolean
  onAction: (action: string) => void
  onClear: () => void
}

const ACTION_LABELS: Record<string, string> = {
  delete: 'Eliminar seleccionados',
}

export function BulkActions({ selectedCount, actions, loading, onAction, onClear }: Props) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-[10px] bg-brand-50 rounded-md mb-3">
      <span className="text-base text-brand-700 font-medium">
        {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
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
          {ACTION_LABELS[action] ?? action}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Deseleccionar
      </Button>
    </div>
  )
}
