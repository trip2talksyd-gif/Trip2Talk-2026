import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Heart } from 'lucide-react'
import type { Tour, TripType } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import {
  inferTripType,
  isAuroraTrip,
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { seatsRemaining } from '../../lib/toursApi'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import TripPhotoHero from './TripPhotoHero'
import SplitFlapPrice from '../ui/SplitFlapPrice'

type Props = {
  tour: Tour
}

const CATEGORY_PILL: Record<TripType, { en: string; th: string; className: string }> = {
  oneday: {
    en: 'One day',
    th: 'วันเดียว',
    className: 'bg-teal-500',
  },
  overnight: {
    en: 'Overnight',
    th: 'ค้างคืน',
    className: 'bg-coral',
  },
  multiday: {
    en: 'Multi-day',
    th: 'หลายวัน',
    className: 'bg-teal-800',
  },
}

function specialtyLabel(tour: Tour, lang: 'en' | 'th'): string | null {
  if (isAuroraTrip(tour)) return lang === 'th' ? 'ล่าแสงใต้' : 'Aurora'
  if (tour.trip_code === 'SYD-INFLU-3H') return lang === 'th' ? 'อินฟลู' : 'Influencer'
  if (tour.trip_code === 'NZ-6D5N') return lang === 'th' ? 'ไฮไลท์' : 'Flagship'
  return null
}

/** Mockup `.trip-card` — horizontal thumb + info (exact spacing/radii). */
export default function TripCard({ tour }: Props) {
  const { lang, t } = useLang()
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const nameTh = tour.name_th
  const seats = seatsRemaining(tour)
  const lowSeats = seats > 0 && seats <= 3
  const tripType = inferTripType(tour)
  const category = CATEGORY_PILL[tripType]
  const specialty = specialtyLabel(tour, lang)
  const favorited = useIsFavorite(tour.trip_code)
  const toggleFavorite = useToggleFavorite()

  const previewPhoto = useMemo(() => getPreviewPhotoForTrip(tour.trip_code), [tour.trip_code])
  const previewSrc = useMemo(
    () => (previewPhoto ? photoSrc(previewPhoto) : ''),
    [previewPhoto],
  )

  return (
    <article className="group relative flex gap-2.5 rounded-2xl border border-line bg-card p-2 shadow-[0_6px_18px_-10px_rgba(10,61,58,0.25)]">
      <Link to={`/trips/${tour.trip_code}`} className="relative h-[78px] w-[78px] shrink-0">
        {previewSrc || tour.cover_image_url ? (
          <img
            src={tour.cover_image_url || previewSrc}
            alt={name}
            className="h-[78px] w-[78px] rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <TripPhotoHero
            tripCode={tour.trip_code}
            alt={name}
            className="h-[78px] w-[78px] rounded-xl object-cover"
          />
        )}
        <span
          className={`absolute left-[5px] top-[5px] rounded-md px-[7px] py-[3px] text-[7px] font-extrabold uppercase tracking-[0.03em] text-cream shadow-[0_2px_6px_-2px_rgba(0,0,0,0.35)] ${category.className}`}
        >
          {lang === 'th' ? category.th : category.en}
        </span>
      </Link>

      <div className="min-w-0 flex-1 py-0.5 pr-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-teal-600">
          {tourDestinationLabel(tour.trip_code, lang)}
          {specialty ? ` · ${specialty}` : ''}
        </p>
        <Link to={`/trips/${tour.trip_code}`}>
          <h3 className="mt-0.5 font-thai text-[12.5px] font-bold leading-snug text-ink">
            {lang === 'th' ? nameTh : name}
            {lang === 'en' && (
              <span className="mt-px block text-[10px] font-medium text-ink-soft">{nameTh}</span>
            )}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-ink-soft">
          <span className="truncate">{tourDurationLabel(tour, lang)}</span>
          <SplitFlapPrice
            amountAud={tour.price_aud}
            board
            className="shrink-0 text-[11px] font-extrabold leading-none"
          />
        </div>
        <p className="mt-0.5 text-[9px] font-bold text-coral">
          {seats === 0
            ? lang === 'th'
              ? 'เต็ม'
              : 'Full'
            : lang === 'th'
              ? `เหลือ ${seats}`
              : `${seats} left`}
          {lowSeats && seats > 0 && <Flame className="ml-0.5 inline h-2.5 w-2.5" />}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(tour.trip_code)
        }}
        aria-label={favorited ? t('favorites.remove') : t('favorites.add')}
        aria-pressed={favorited}
        className="absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/35 text-[11px] text-coral"
      >
        <Heart className={`h-3 w-3 ${favorited ? 'fill-coral' : ''}`} strokeWidth={2} />
      </button>
    </article>
  )
}
