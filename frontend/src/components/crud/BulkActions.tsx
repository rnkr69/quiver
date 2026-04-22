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
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px',
      backgroundColor: '#e6f7f8',
      borderRadius: 6,
      marginBottom: 12,
    }}>
      <span style={{ fontSize: 14, color: '#005e63', fontWeight: 500 }}>
        {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
      </span>
      <div style={{ flex: 1 }} />
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
