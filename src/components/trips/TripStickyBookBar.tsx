import { Link } from 'react-router-dom'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { formatDate, isTourBookable } from '../../lib/toursApi'
import SplitFlapPrice from '../ui/SplitFlapPrice'

type Props = {
  tour: Tour
}

/** Fixed bottom book bar (mobile) — always visible above BottomNav. */
export default function TripStickyBookBar({ tour }: Props) {
  const { lang, t } = useLang()
  const bookable = isTourBookable(tour)
  const to = bookable ? `/waiver?trip=${tour.trip_code}` : undefined

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(46px+env(safe-area-inset-bottom)+12px)] z-40 px-3 md:hidden"
      role="region"
      aria-label={lang === 'th' ? 'จองทริป' : 'Book trip'}
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full bg-ink px-4 py-2.5 text-cream shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)]">
        <div className="min-w-0 leading-tight">
          <SplitFlapPrice
            amountAud={tour.price_aud}
            board
            className="text-[13px] font-extrabold leading-none"
          />
          <p className="mt-0.5 truncate font-thai text-[9px] font-medium text-cream/75">
            {formatDate(tour.departure_date, lang)}
            <span className="opacity-80"> · {lang === 'th' ? 'ต่อคน' : '/ person'}</span>
          </p>
        </div>
        {bookable && to ? (
          <Link
            to={to}
            className="shrink-0 rounded-[13px] bg-[#0d0d0f] px-4 py-2 text-center shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_10px_22px_-8px_rgba(0,0,0,0.55)]"
          >
            <span className="block text-[11px] font-bold leading-none">{t('btn.bookNow')}</span>
            <span className="mt-0.5 block font-thai text-[8.5px] font-medium opacity-80">จองเลย</span>
          </Link>
        ) : (
          <span className="shrink-0 rounded-[13px] bg-white/10 px-4 py-2 text-[11px] font-bold text-cream/70">
            {t('btn.comingSoon')}
          </span>
        )}
      </div>
    </div>
  )
}
