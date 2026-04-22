import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import { WidgetGrid } from '@/components/dashboard/WidgetGrid'

interface WidgetData {
  type: string
  title: string
  component: string
  data: Record<string, unknown>
}

export function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get<WidgetData[]>('/admin/dashboard')
      .then(res => setWidgets(res.data))
      .catch(() => setWidgets([]))
      .finally(() => setLoading(false))
  }, [])

  const statWidgets = widgets.filter(w => w.component !== 'ChartWidget')
  const chartWidgets = widgets.filter(w => w.component === 'ChartWidget')

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Dashboard</h1>
      <WidgetGrid widgets={statWidgets} isLoading={loading} />
      {(loading || chartWidgets.length > 0) && (
        <div style={{ marginTop: 24 }}>
          <WidgetGrid widgets={chartWidgets} isLoading={loading} minColWidth={500} />
        </div>
      )}
    </div>
  )
}
