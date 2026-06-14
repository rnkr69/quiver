import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
          {t('errors.componentNotFoundTitle')}
        </p>
        <p style={{ fontSize: 13, color: '#78350f', margin: 0 }}>
          {t('errors.componentNotRegisteredPrefix')}{' '}
          <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>{name}</code>{' '}
          {t('errors.componentNotRegisteredAdd')}{' '}
          <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>
            PageRegistry.register("{name}", {name})
          </code>{' '}
          {t('errors.componentNotRegisteredIn')}{' '}
          <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>main.tsx</code>.
        </p>
      </div>
    </div>
  )
}
