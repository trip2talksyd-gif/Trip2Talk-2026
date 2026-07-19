import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, Flame, Heart } from 'lucide-react'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import { useTripCardPreview } from '../../hooks/useTripCardPreview'
import {
  inferTripType,
  isAuroraTrip,
  tourDestination,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { formatAud, seatsRemaining } from '../../lib/toursApi'
import { getTripDetails, listFor } from '../../data/tripDetails'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import TripPhotoHero from './TripPhotoHero'
import TripBookButton from './TripBookButton'
import TripCardPreviewBubble from './TripCardPreviewBubble'

/** Optional per-trip preview video URLs — play icon shows when set */
export const TRIP_PREVIEW_VIDEOS: Partial<Record<string, string>> = {}

type Props = {
  tour: Tour
}

function tripBadge(tour: Tour, lang: 'en' | 'th'): string | null {
  if (isAuroraTrip(tour)) return lang === 'th' ? 'ล่าแสงใต้' : 'Aurora hunt'
  if (tour.trip_code === 'SYD-INFLU-3H') return lang === 'th' ? 'อินฟลูเอนเซอร์' : 'Influencer'
  if (tour.trip_code === 'NZ-6D5N') return lang === 'th' ? 'ทริปไฮไลท์' : 'Flagship'
  if (inferTripType(tour) === 'multiday' && tour.price_aud >= 1500) {
    return lang === 'th' ? 'ทริปพรีเมียม' : 'Premium'
  }
  return null
}

export default function TripCard({ tour }: Props) {
  const { lang, t } = useLang()
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const seats = seatsRemaining(tour)
  const lowSeats = seats > 0 && seats <= 3
  const badge = tripBadge(tour, lang)
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
    <article className="group flex flex-col overflow-hidden rounded-editorial">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        <Link
          to={`/trips/${tour.trip_code}`}
          className="block h-full touch-manipulation"
          {...previewHandlers}
        >
          <TripPhotoHero
            tripCode={tour.trip_code}
            alt={name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
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

        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-editorial bg-teal-500 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
            {badge}
          </span>
        )}

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
          {seats === 0 ? (lang === 'th' ? 'เต็ม' : 'Full') : `${seats} ${lang === 'th' ? 'ที่นั่ง' : 'seats'}`}
          {lowSeats && seats > 0 && <Flame className="ml-1 inline h-3 w-3 text-coral" />}
        </span>
      </div>

      <div className="bg-teal-900 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-serif text-3xl text-teal-400">{formatAud(tour.price_aud)}</p>
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
