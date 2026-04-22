import type { ComponentType, ReactNode } from 'react'
import { StatCard } from './StatCard'
import { ChartWidget } from './ChartWidget'

interface WidgetProps {
  title: string
  data: Record<string, unknown>
  icon?: ReactNode
}

// Developer can add custom widgets: widgetRegistry.set('MyWidget', MyWidgetComponent)
export const widgetRegistry = new Map<string, ComponentType<WidgetProps>>([
  ['StatCard', StatCard],
  ['ChartWidget', ChartWidget],
])

export function getWidgetComponent(type: string): ComponentType<WidgetProps> | null {
  return widgetRegistry.get(type) ?? null
}
