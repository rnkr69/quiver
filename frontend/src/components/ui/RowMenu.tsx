import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        className="bg-transparent border border-transparent cursor-pointer text-gray-500 px-1.5 py-1 rounded flex items-center leading-none font-sans hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-md min-w-[160px] py-1"
          style={{ top: pos.top, right: pos.right }}
        >
          {items.map((item, i) => {
            if (item === 'divider') {
              return <div key={i} className="h-px bg-gray-200 my-1" />
            }
            return (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setOpen(false); item.action() }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-[7px] text-md bg-transparent border-none cursor-pointer text-left font-sans transition-colors',
                  item.danger   ? 'text-danger-500 hover:bg-danger-50'
                  : item.warning  ? 'text-warning-500 hover:bg-gray-50'
                  : 'text-gray-800 hover:bg-gray-50',
                )}
              >
                {item.icon && <span className="flex shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
