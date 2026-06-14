import type { ReactNode } from 'react'
import { QuiverLogo } from '@/components/ui/QuiverLogo'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

interface Props {
  children: ReactNode
}

export function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center gap-2.5 mb-6">
        <QuiverLogo size={40} />
        <span className="text-3xl font-semibold text-gray-900">Quiver</span>
      </div>

      <div className="bg-white rounded-lg p-8 w-full max-w-[400px] shadow-md border border-gray-200">
        {children}
      </div>

      <div className="mt-6 text-sm text-gray-400">
        © {new Date().getFullYear()} Quiver
      </div>
    </div>
  )
}
