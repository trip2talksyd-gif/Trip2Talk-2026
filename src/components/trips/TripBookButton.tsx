import { Link } from 'react-router-dom'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { getUnbookableReason, isTourBookable } from '../../lib/toursApi'
import FlipText from '../ui/FlipText'

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
  const { t, lang } = useLang()
  const bookable = isTourBookable(tour)

  if (!bookable) {
    const reason = getUnbookableReason(tour)
    if (reason === 'full' && !detailOnly) {
      return (
        <Link
          to={`/waitlist?trip=${tour.trip_code}`}
          className={`block w-full rounded-[13px] border border-coral/50 bg-coral/10 py-3 text-center text-[12.5px] font-bold text-coral ${className}`}
        >
          {lang === 'th' ? 'เต็มแล้ว — ลงชื่อ Waitlist' : 'Full — Join Waitlist'}
        </Link>
      )
    }
    if (reason === 'cancelled') {
      return (
        <span
          className={`block w-full rounded-[13px] border border-ink-soft/25 bg-ink-soft/10 py-3 text-center text-[12.5px] font-bold text-ink-soft ${className}`}
          aria-disabled
        >
          {t('btn.tripCancelled')}
        </span>
      )
    }
    return (
      <span
        className={`block w-full rounded-[13px] bg-mint-100 py-3 text-center text-[12.5px] font-bold text-ink-soft ${className}`}
        aria-disabled
      >
        {t('btn.comingSoon')}
      </span>
    )
  }

  const to = detailOnly ? `/trips/${tour.trip_code}` : `/waiver?trip=${tour.trip_code}`
  const labelEn = detailOnly ? t('btn.viewTrip') : t('btn.bookNow')
  const labelTh = detailOnly ? 'ดูทริป' : 'จองเลย'

  if (variant === 'deep' || variant === 'primary') {
    return (
      <Link to={to} className={`book-btn flip-cta cta-shine ${className}`}>
        <FlipText text={labelEn} />
        <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-85">{labelTh}</span>
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={`block w-full rounded-[13px] border border-white/40 bg-white/10 py-3 text-center text-[12.5px] font-bold text-cream ${className}`}
    >
      {lang === 'th' ? labelTh : labelEn}
    </Link>
  )
}
