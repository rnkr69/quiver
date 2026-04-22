import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md'

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand-500 text-white border border-transparent hover:bg-brand-600',
  secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
  ghost:     'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100',
  danger:    'bg-white text-danger-500 border border-danger-500 hover:bg-danger-50',
  link:      'bg-transparent text-brand-500 border-none p-0 font-normal hover:underline',
}

const sizeClasses: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary:   { md: 'px-4 py-2',        sm: 'px-3 py-[5px] text-sm' },
  secondary: { md: 'px-4 py-2',        sm: 'px-3 py-[5px] text-sm' },
  ghost:     { md: 'px-[10px] py-1.5', sm: 'px-2 py-1 text-sm' },
  danger:    { md: 'px-4 py-2',        sm: 'px-3 py-[5px] text-sm' },
  link:      { md: '',                  sm: 'text-sm' },
}

const baseClasses = 'inline-flex items-center gap-1.5 font-medium text-md rounded cursor-pointer transition-colors duration-150 leading-none whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-70 font-sans'

function Spinner() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className="animate-spin shrink-0">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[variant][size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
