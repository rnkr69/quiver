import { cn } from '@/lib/utils'

interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Toggle({ checked = false, onChange, disabled, label, className }: ToggleProps) {
  return (
    <label className={cn(
      'inline-flex items-center gap-2',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      className,
    )}>
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative w-9 h-5 rounded-[10px] transition-colors duration-200 shrink-0',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          checked ? 'bg-brand-500' : 'bg-gray-300',
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-[left] duration-200',
          checked ? 'left-[18px]' : 'left-0.5',
        )} />
      </div>
      {label && <span className="text-base text-gray-800">{label}</span>}
    </label>
  )
}
