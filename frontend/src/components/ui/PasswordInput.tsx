import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  required?: boolean
  error?: string
}

const baseInput = 'w-full pl-3 pr-10 py-2 text-base text-gray-900 font-sans border border-gray-300 rounded outline-none bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/20 transition-shadow duration-150'
const errorInput = 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'

export function PasswordInput({ label, required, error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className={cn(baseInput, error && errorInput, props.className)}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 p-0 flex"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </div>
  )
}
