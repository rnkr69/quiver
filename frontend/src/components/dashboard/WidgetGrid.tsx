import { getWidgetComponent } from './WidgetRegistry'

interface WidgetData {
  type: string
  title: string
  component: string
  data: Record<string, unknown>
}

interface Props {
  widgets: WidgetData[]
  isLoading?: boolean
  minColWidth?: number
}

const SKELETON_COUNT = 3

export function WidgetGrid({ widgets, isLoading, minColWidth = 240 }: Props) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`,
    gap: 16,
  }

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {[...Array(SKELETON_COUNT)].map((_, i) => (
          <div key={i} style={{
            height: 96, backgroundColor: '#f3f3f3', borderRadius: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    )
  }

  if (!widgets.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#8a8a8a', fontSize: 14 }}>
        No hay widgets configurados. Registra widgets con{' '}
        <code style={{ fontFamily: 'monospace', backgroundColor: '#f3f3f3', padding: '2px 6px', borderRadius: 4 }}>
          quiver.register_widget(...)
        </code>
      </div>
    )
  }

  return (
    <div style={gridStyle}>
      {widgets.map((widget, i) => {
        const Component = getWidgetComponent(widget.component)
        if (!Component) {
          return (
            <div key={i} style={{
              backgroundColor: '#fff8ed', border: '1px solid #fde68a', borderRadius: 8, padding: 20,
            }}>
              <div style={{ fontSize: 12, color: '#92400e' }}>
                Widget desconocido: <code>{widget.component}</code>
              </div>
            </div>
          )
        }
        return <Component key={i} title={widget.title} data={widget.data} icon={widget.data.icon != null ? <i className={`bi bi-${widget.data.icon}`} style={{ fontSize: 18 }} /> : undefined} />
      })}
    </div>
  )
}
