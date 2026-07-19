import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Flame, Heart } from 'lucide-react'
import type { Tour, TripType } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import { useTripCardPreview } from '../../hooks/useTripCardPreview'
import {
  inferTripType,
  isAuroraTrip,
  tourDestination,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { seatsRemaining } from '../../lib/toursApi'
import { getTripDetails, listFor } from '../../data/tripDetails'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import TripPhotoHero from './TripPhotoHero'
import TripBookButton from './TripBookButton'
import TripCardPreviewBubble from './TripCardPreviewBubble'
import SplitFlapPrice from '../ui/SplitFlapPrice'

/** Optional per-trip preview video URLs — play icon shows when set */
export const TRIP_PREVIEW_VIDEOS: Partial<Record<string, string>> = {}

type Props = {
  tour: Tour
}

const CATEGORY_PILL: Record<TripType, { en: string; th: string; className: string }> = {
  oneday: {
    en: 'One day',
    th: 'วันเดียว',
    className: 'bg-teal-500 text-ink',
  },
  overnight: {
    en: 'Overnight',
    th: 'ค้างคืน',
    className: 'bg-coral text-cream',
  },
  multiday: {
    en: 'Multi-day',
    th: 'หลายวัน',
    className: 'bg-teal-900 text-cream',
  },
}

function specialtyLabel(tour: Tour, lang: 'en' | 'th'): string | null {
  if (isAuroraTrip(tour)) return lang === 'th' ? 'ล่าแสงใต้' : 'Aurora'
  if (tour.trip_code === 'SYD-INFLU-3H') return lang === 'th' ? 'อินฟลู' : 'Influencer'
  if (tour.trip_code === 'NZ-6D5N') return lang === 'th' ? 'ไฮไลท์' : 'Flagship'
  return null
}

export default function TripCard({ tour }: Props) {
  const { lang, t } = useLang()
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const seats = seatsRemaining(tour)
  const lowSeats = seats > 0 && seats <= 3
  const tripType = inferTripType(tour)
  const category = CATEGORY_PILL[tripType]
  const specialty = specialtyLabel(tour, lang)
  const { position, previewHandlers } = useTripCardPreview()
  const favorited = useIsFavorite(tour.trip_code)
  const toggleFavorite = useToggleFavorite()

  const includes = useMemo(() => {
    const details = getTripDetails(tour.trip_code)
    return details ? listFor(details.includes, lang).slice(0, 3) : []
  }, [tour.trip_code, lang])

  const previewPhoto = useMemo(() => getPreviewPhotoForTrip(tour.trip_code), [tour.trip_code])
  const previewSrc = useMemo(
    () => (previewPhoto ? photoSrc(previewPhoto) : ''),
    [previewPhoto],
  )
  const hasVideo = Boolean(TRIP_PREVIEW_VIDEOS[tour.trip_code])

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(22,38,43,0.12)] ring-1 ring-line">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        <Link
          to={`/trips/${tour.trip_code}`}
          className="block h-full touch-manipulation"
          {...previewHandlers}
        >
          <TripPhotoHero
            tripCode={tour.trip_code}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-cream/65">
              {tourDestination(tour.trip_code)}
            </p>
            <h3 className="mt-1 font-serif text-xl leading-tight text-cream">{name}</h3>
            <p className="mt-1 text-xs text-cream/65">{tourDurationLabel(tour, lang)}</p>
          </div>
        </Link>

        <TripCardPreviewBubble
          visible={position.visible}
          x={position.x}
          y={position.y}
          imageSrc={previewSrc}
          alt={name}
          hasVideo={hasVideo}
        />

        {/* Floating category tag — top-left */}
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm ${category.className}`}
          >
            {lang === 'th' ? category.th : category.en}
          </span>
          {specialty && (
            <span className="rounded-full bg-teal-500/95 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink shadow-sm">
              {specialty}
            </span>
          )}
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
          className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${favorited ? 'fill-coral text-coral' : 'text-ink/70'}`}
            strokeWidth={2}
          />
        </button>

        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-ink shadow-sm">
          {seats === 0
            ? lang === 'th'
              ? 'เต็ม'
              : 'Full'
            : `${seats} ${lang === 'th' ? 'ที่นั่ง' : 'seats'}`}
          {lowSeats && seats > 0 && <Flame className="ml-1 inline h-3 w-3 text-coral" />}
        </span>
      </div>

      <div className="bg-teal-900 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <SplitFlapPrice amountAud={tour.price_aud} className="text-3xl text-teal-400" />
        </div>

        {includes.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-cream/65">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <TripBookButton tour={tour} variant="primary" className="mt-3 w-full" />
      </div>
    </article>
  )
}
