import { Link } from 'react-router-dom'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { formatDate, isListedPriceHidden, isTourBookable } from '../../lib/toursApi'
import { squarePayQuerySuffix } from '../../lib/preferredPayment'
import SplitFlapPrice from '../ui/SplitFlapPrice'

type Props = {
  tour: Tour
}

/** Fixed bottom book bar (mobile) — always visible above BottomNav. */
export default function TripStickyBookBar({ tour }: Props) {
  const { tt } = useLang()
  const bookable = isTourBookable(tour)
  const to = bookable ? `/waiver?trip=${tour.trip_code}${squarePayQuerySuffix()}` : undefined
  const book = tt('btn.bookNow')
  const soon = tt('btn.comingSoon')
  const from = tt('detail.fromPrice')
  const perPerson = tt('detail.stat.perPerson')
  const priceTba = tt('trips.priceTba')
  const priceHidden = isListedPriceHidden(tour)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(52px+env(safe-area-inset-bottom)+12px)] z-40 px-3 md:hidden"
      role="region"
      aria-label={`${book.en} / ${book.th}`}
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full bg-ink px-4 py-2.5 text-cream shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)]">
        <div className="min-w-0 leading-tight">
          <div className="flex items-baseline gap-1">
            {priceHidden ? (
              <span className="text-[13px] font-extrabold leading-none">{priceTba.en}</span>
            ) : (
              <>
                <span className="text-[9px] font-medium text-cream/70">{from.en}</span>
                <SplitFlapPrice
                  amountAud={tour.price_aud}
                  board
                  className="text-[13px] font-extrabold leading-none"
                />
              </>
            )}
          </div>
          <p className="mt-0.5 truncate font-thai text-[9px] font-medium text-cream/75">
            {formatDate(tour.departure_date, 'en')}
            <span className="opacity-80">
              {' '}
              · {perPerson.en} / {perPerson.th}
            </span>
          </p>
        </div>
        {bookable && to ? (
          <Link
            to={to}
            className="ai-edge shrink-0 rounded-[13px] bg-[#0d0d0f] px-4 py-2 text-center text-[11px] font-bold shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_10px_22px_-8px_rgba(0,0,0,0.55)]"
          >
            {book.en}
            <span className="mt-0.5 block font-thai text-[8px] font-medium opacity-85">{book.th}</span>
          </Link>
        ) : (
          <span className="shrink-0 rounded-[13px] bg-white/10 px-4 py-2 text-center text-[11px] font-bold text-cream/70">
            {soon.en}
            <span className="mt-0.5 block font-thai text-[8px] font-medium opacity-85">{soon.th}</span>
          </span>
        )}
      </div>
    </div>
  )
}
