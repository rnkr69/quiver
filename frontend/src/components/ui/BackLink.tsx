import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface BackLinkProps {
  to?: string
  label?: string
  className?: string
}

export function BackLink({ to, label, className }: BackLinkProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer',
        'text-brand-500 text-md p-0 mb-4 font-sans hover:underline',
        className,
      )}
    >
      <ArrowLeft size={14} />
      {label ?? t('common.back')}
    </button>
  )
}
