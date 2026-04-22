import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'

interface RowMenuAction {
  label: string
  icon?: ReactNode
  danger?: boolean
  warning?: boolean
  action: () => void
}

type RowMenuItem = RowMenuAction | 'divider'

interface RowMenuProps {
  items: RowMenuItem[]
}

export function RowMenu({ items }: RowMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpen(o => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          background: 'transparent', border: '1px solid transparent', cursor: 'pointer',
          color: 'var(--gray-500)', padding: '4px 6px', borderRadius: 4,
          display: 'flex', alignItems: 'center', lineHeight: 1,
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-100)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
            background: 'white', border: '1px solid var(--gray-200)', borderRadius: 6,
            boxShadow: 'var(--shadow-md)', minWidth: 160, padding: '4px 0',
          }}
        >
          {items.map((item, i) => {
            if (item === 'divider') {
              return <div key={i} style={{ height: 1, background: 'var(--gray-200)', margin: '4px 0' }} />
            }
            const color = item.danger ? 'var(--danger-500)' : item.warning ? 'var(--warning-500)' : 'var(--gray-800)'
            const hoverBg = item.danger ? 'var(--danger-50)' : 'var(--gray-50)'
            return (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setOpen(false); item.action() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 12px', fontSize: 13,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color, textAlign: 'left', fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {item.icon && <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </>
  )
}
