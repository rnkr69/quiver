import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'

interface BackLinkProps {
  to?: string
  label?: string
  style?: CSSProperties
}

export function BackLink({ to, label = 'Volver', style }: BackLinkProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--brand-500)', fontSize: 13, padding: 0,
        marginBottom: 16, fontFamily: 'inherit',
        ...style,
      }}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}
