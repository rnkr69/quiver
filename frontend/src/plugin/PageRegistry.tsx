import type { ComponentType } from 'react'

// Map<componentName, ReactComponent> — populated by the host app in main.tsx
const _registry = new Map<string, ComponentType>()

export const PageRegistry = {
  register(name: string, component: ComponentType): void {
    _registry.set(name, component)
  },

  get(name: string): ComponentType | null {
    return _registry.get(name) ?? null
  },

  has(name: string): boolean {
    return _registry.has(name)
  },
}

interface FallbackPageProps {
  name: string
}

export function FallbackPage({ name }: FallbackPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        padding: 32,
      }}
    >
      <div
        style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: 8,
          padding: '24px 32px',
          maxWidth: 560,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', margin: '0 0 8px' }}>
          Componente no encontrado en PageRegistry
        </p>
        <p style={{ fontSize: 13, color: '#78350f', margin: 0 }}>
          El componente <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>{name}</code>{' '}
          no está registrado. Añade{' '}
          <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>
            PageRegistry.register("{name}", {name})
          </code>{' '}
          en <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>main.tsx</code>.
        </p>
      </div>
    </div>
  )
}
