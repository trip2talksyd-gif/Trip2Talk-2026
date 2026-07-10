import { Check } from 'lucide-react'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { tourDurationLabel } from '../../lib/tourDisplay'
import { formatAud, formatDate, seatsRemaining } from '../../lib/toursApi'
import TripPhotoHero from './TripPhotoHero'
import TripBookButton from './TripBookButton'

type Props = {
  tour: Tour
  includes: string[]
}

export default function TripPricingCard({ tour, includes }: Props) {
  const { lang, t } = useLang()
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const checklist = includes.slice(0, 4)

  return (
    <div className="overflow-hidden rounded-[28px] bg-[#0c0c0c] font-sans text-white antialiased shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/8">
      <div className="relative aspect-[16/10] overflow-hidden">
        <TripPhotoHero
          tripCode={tour.trip_code}
          alt={name}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:p-5 lg:grid-cols-[0.9fr_1.2fr] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-white/10">
          <div className="flex flex-col items-start justify-center px-1 py-2 lg:px-6">
            <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[40px]">
              {formatAud(tour.price_aud)}
              <span className="text-lg font-normal text-white/50 sm:text-xl">
                {' '}
                {t('home.features.price.unit')}
              </span>
            </p>
            <p className="mt-1.5 text-sm text-white/45">{t('home.features.price.note')}</p>
          </div>

          <div className="flex flex-col justify-between gap-4 px-1 py-1 lg:pl-6">
            {checklist.length > 0 && (
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-white/80">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c8f542]"
                      strokeWidth={2.5}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-white/40">
              {t('booking.deposit')}: {formatAud(tour.deposit_aud)} ·{' '}
              {formatDate(tour.departure_date, lang)} · {seatsRemaining(tour)}{' '}
              {t('common.seatsRemaining')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <span className="text-sm text-white/50">{tourDurationLabel(tour, lang)}</span>
              <div className="w-full sm:max-w-[200px]">
                <TripBookButton tour={tour} variant="primary" className="!rounded-full py-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
