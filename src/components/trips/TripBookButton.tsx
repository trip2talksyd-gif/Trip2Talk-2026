import { Link } from 'react-router-dom'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { isTourBookable } from '../../lib/toursApi'
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
