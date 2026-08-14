import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Heart } from 'lucide-react'
import type { Tour, TripType } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import {
  inferTripType,
  isAuroraTrip,
  tourDestination,
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { seatsRemaining } from '../../lib/toursApi'
import { getPreviewPhotoForTrip, photoThumbSrc } from '../../data/galleryPhotos'
import TripCoverImage from './TripCoverImage'
import SplitFlapPrice from '../ui/SplitFlapPrice'
import type { TranslationKey } from '../../i18n/translations'

type Props = {
  tour: Tour
}

type CatPill = { key: TranslationKey; className: string }

const TYPE_PILL: Record<TripType, CatPill> = {
  oneday: { key: 'common.oneday', className: 'bg-teal-500' },
  overnight: { key: 'common.overnight', className: 'bg-coral' },
  multiday: { key: 'common.multiday', className: 'bg-teal-800' },
}

/** Mockup Popular / Desert / Flagship-style tags when a specialty applies. */
function categoryPill(tour: Tour): CatPill {
  const code = tour.trip_code.toUpperCase()
  if (code === 'NZ-6D5N') return { key: 'trips.cat.flagship', className: 'bg-teal-800' }
  if (code.startsWith('ULU')) return { key: 'trips.cat.desert', className: 'bg-teal-600' }
  if (isAuroraTrip(tour)) return { key: 'trips.cat.aurora', className: 'bg-teal-700' }
  if (code === 'SYD-INFLU-3H') return { key: 'trips.cat.influencer', className: 'bg-coral' }
  const seats = seatsRemaining(tour)
  if (seats > 0 && seats <= 3) return { key: 'trips.cat.popular', className: 'bg-coral' }
  return TYPE_PILL[inferTripType(tour)]
}

/** Mockup `.trip-card` — bilingual EN+TH name, category tag, meta + price. */
export default function TripCard({ tour }: Props) {
  const { tt } = useLang()
  const seats = seatsRemaining(tour)
  const lowSeats = seats > 0 && seats <= 3
  const category = categoryPill(tour)
  const catLabel = tt(category.key)
  const favorited = useIsFavorite(tour.trip_code)
  const toggleFavorite = useToggleFavorite()
  const seatsLeft = tt('trips.seatsLeft')
  const seatsFull = tt('trips.seatsFull')
  const favAdd = tt('favorites.add')
  const favRemove = tt('favorites.remove')

  const previewPhoto = useMemo(() => getPreviewPhotoForTrip(tour.trip_code), [tour.trip_code])
  const previewSrc = useMemo(
    () => (previewPhoto ? photoThumbSrc(previewPhoto, { width: 320, quality: 68, format: 'webp' }) : ''),
    [previewPhoto],
  )

  const destEn = tourDestinationLabel(tour.trip_code, 'en')
  const destTh = tourDestinationLabel(tour.trip_code, 'th')
  const durationEn = tourDurationLabel(tour, 'en')
  const durationTh = tourDurationLabel(tour, 'th')

  return (
    <article className="group relative flex gap-2.5 rounded-2xl border border-line bg-card p-2 shadow-[0_6px_18px_-10px_rgba(10,61,58,0.25)]">
      <Link to={`/trips/${tour.trip_code}`} className="relative h-[78px] w-[78px] shrink-0">
        <TripCoverImage
          src={tour.cover_image_url || previewSrc}
          alt={tour.name_en}
          size="thumb"
          className="h-[78px] w-[78px] rounded-xl object-cover"
        />
        <span
          className={`absolute left-[5px] top-[5px] rounded-md px-[7px] py-[3px] text-[7px] font-extrabold uppercase tracking-[0.03em] text-cream shadow-[0_2px_6px_-2px_rgba(0,0,0,0.35)] ${category.className}`}
          title={`${catLabel.en} / ${catLabel.th}`}
        >
          {catLabel.en}
        </span>
      </Link>

      <div className="min-w-0 flex-1 py-0.5 pr-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-teal-600">
          {destEn}
          <span className="ml-1 font-thai text-[8px] font-medium normal-case tracking-normal text-teal-600/80">
            {destTh !== destEn ? destTh : tourDestination(tour.trip_code)}
          </span>
        </p>
        <Link to={`/trips/${tour.trip_code}`}>
          <h3 className="mt-0.5 font-thai text-[12.5px] font-bold leading-snug text-ink">
            {tour.name_en}
            <span className="mt-0.5 block text-[10px] font-medium text-ink-soft">{tour.name_th}</span>
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-ink-soft">
          <span className="truncate">
            {durationEn}
            <span className="font-thai text-[9px] opacity-85"> · {durationTh}</span>
          </span>
          <SplitFlapPrice
            amountAud={tour.price_aud}
            board
            className="shrink-0 text-[11px] font-extrabold leading-none"
          />
        </div>
        <p className="mt-0.5 text-[9px] font-bold text-coral">
          {seats === 0
            ? `${seatsFull.en} / ${seatsFull.th}`
            : `${seats} ${seatsLeft.en} · ${seatsLeft.th} ${seats}`}
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
        aria-label={favorited ? `${favRemove.en} / ${favRemove.th}` : `${favAdd.en} / ${favAdd.th}`}
        aria-pressed={favorited}
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-coral"
      >
        <Heart className={`h-3 w-3 ${favorited ? 'fill-coral' : ''}`} strokeWidth={2} />
      </button>
    </article>
  )
}
