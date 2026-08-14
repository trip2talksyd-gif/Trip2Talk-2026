import { Camera } from 'lucide-react'

type Props = {
  className?: string
  /** Icon-only for 44px thumbs (mini-trip). Full bilingual label on heroes/cards. */
  compact?: boolean
}

/** Empty/broken cover — never invents a destination photo. */
export default function TripCoverFallback({ className = '', compact = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-mint-100 text-teal-dark ${className}`}
      role="img"
      aria-label="Photo coming soon / รูปกำลังจะมา"
    >
      <Camera
        className={compact ? 'h-4 w-4 text-orange' : 'h-6 w-6 text-orange'}
        strokeWidth={1.75}
        aria-hidden
      />
      {!compact && (
        <>
          <span className="mt-1.5 px-2 text-center font-display text-[11px] font-semibold leading-tight">
            Photo coming soon
          </span>
          <span
            lang="th"
            className="mt-0.5 px-2 text-center font-serif font-thai text-[10px] leading-tight text-teal-mid"
          >
            รูปกำลังจะมา
          </span>
        </>
      )}
    </div>
  )
}
