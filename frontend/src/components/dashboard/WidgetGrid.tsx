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
  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))`,
  }

  if (isLoading) {
    return (
      <div className="grid gap-4" style={gridStyle}>
        {[...Array(SKELETON_COUNT)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!widgets.length) {
    return (
      <div className="text-center py-12 text-gray-600 text-base">
        No hay widgets configurados. Registra widgets con{' '}
        <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm">
          quiver.register_widget(...)
        </code>
      </div>
    )
  }

  return (
    <div className="grid gap-4" style={gridStyle}>
      {widgets.map((widget, i) => {
        const Component = getWidgetComponent(widget.component)
        if (!Component) {
          return (
            <div key={i} className="bg-warning-50 border border-[#fde68a] rounded-lg p-5">
              <div className="text-sm text-[#92400e]">
                Widget desconocido: <code>{widget.component}</code>
              </div>
            </div>
          )
        }
        return <Component key={i} title={widget.title} data={widget.data} icon={widget.data.icon != null ? <i className={`bi bi-${widget.data.icon} text-[18px]`} /> : undefined} />
      })}
    </div>
  )
}
