interface QuiverLogoProps {
  size?: number
}

export function QuiverLogo({ size = 28 }: QuiverLogoProps) {
  const r = Math.round(size * 0.21)
  return (
    <div
      className="bg-brand-500 flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: r }}
    >
      <svg width={size * 0.57} height={size * 0.57} viewBox="0 0 16 16" fill="none">
        <path d="M3 4l5 8 5-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
