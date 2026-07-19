import { Link } from 'react-router-dom'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { isTourBookable } from '../../lib/toursApi'

type Props = {
  tour: Tour
  className?: string
  variant?: 'primary' | 'ghost' | 'deep'
  detailOnly?: boolean
}

export default function TripBookButton({
  tour,
  className = '',
  variant = 'primary',
  detailOnly = false,
}: Props) {
  const { t } = useLang()
  const bookable = isTourBookable(tour)

  if (!bookable) {
    return (
      <span
        className={`block w-full rounded-editorial bg-cream/20 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-cream/50 ${className}`}
        aria-disabled
      >
        {t('btn.comingSoon')}
      </span>
    )
  }

  const to = detailOnly ? `/trips/${tour.trip_code}` : `/waiver?trip=${tour.trip_code}`
  const label = detailOnly ? t('btn.viewTrip') : t('btn.bookNow')

  const styles =
    variant === 'ghost'
      ? 'border border-white/35 bg-transparent text-cream hover:border-white/55'
      : variant === 'deep'
        ? 'bg-teal-900 text-cream hover:bg-teal-900/90'
        : 'bg-teal-500 text-ink hover:opacity-90'

  return (
    <Link
      to={to}
      className={`block w-full rounded-editorial py-2.5 text-center text-xs font-medium uppercase tracking-[0.5px] transition-colors ${styles} ${className}`}
    >
      {label}
    </Link>
  )
}
