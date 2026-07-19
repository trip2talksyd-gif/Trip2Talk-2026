import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Heart, Sparkles } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import { fetchTourByCode } from '../../lib/toursApi'
import { isAuroraTrip, tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import { getTripDetails, listFor, textFor } from '../../data/tripDetails'
import { getItinerary } from '../../data/itineraries'
import { isPremiumTrip } from '../../data/tripTiers'
import { AURORA_DISCLAIMER } from '../../data/risks'
import { getTripMap, staticMapFallback, staticMapUrl } from '../../data/tripMaps'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import TripPhotoHero from '../../components/trips/TripPhotoHero'
import TripPricingCard from '../../components/trips/TripPricingCard'
import AuroraTracker from '../../components/trips/AuroraTracker'
import TripTimeline from '../../components/trips/TripTimeline'
import PremiumTripCallout from '../../components/trips/PremiumTripCallout'

export default function TripDetailPage() {
  const { tripCode } = useParams<{ tripCode: string }>()
  const { lang, t } = useLang()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const favorited = useIsFavorite(tripCode ?? '')
  const toggleFavorite = useToggleFavorite()

  useEffect(() => {
    if (!tripCode) {
      setLoading(false)
      return
    }
    fetchTourByCode(tripCode)
      .then(setTour)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [tripCode, t])

  const stripPhotos = useMemo(() => {
    if (!tour) return []
    const prefix = tour.trip_code.split('-')[0]?.toLowerCase() ?? ''
    const matched = GALLERY_PHOTOS.filter(
      (p) => p.id.startsWith(prefix) || p.id.includes(prefix),
    )
    return (matched.length > 0 ? matched : GALLERY_PHOTOS).slice(0, 8)
  }, [tour])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-48 w-full rounded-editorial" />
      </div>
    )
  }

  if (error || !tour) {
    return <PageError message={error || t('common.error')} />
  }

  const details = getTripDetails(tour.trip_code)
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const highlights = details ? listFor(details.highlights, lang) : []
  const includes = details ? listFor(details.includes, lang) : []
  const excludes = details ? listFor(details.excludes, lang) : []
  const tagline = details ? textFor(details.tagline, lang) : ''
  const durationLabel = tourDurationLabel(tour, lang)
  const itinerary = getItinerary(tour.trip_code, details?.highlights, durationLabel)
  const mapCfg = getTripMap(tour.trip_code)

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-teal-700">
          <ArrowLeft className="h-4 w-4" />
          {t('nav.trips')}
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(tour.trip_code)}
          aria-pressed={favorited}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-medium text-ink"
        >
          <Heart
            className={`h-4 w-4 ${favorited ? 'fill-coral text-coral' : 'text-ink/50'}`}
            strokeWidth={2}
          />
          {favorited ? t('favorites.remove') : t('favorites.add')}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <TripPhotoHero tripCode={tour.trip_code} alt={name} className="aspect-[16/10] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/20 to-transparent" />
        <div className="absolute bottom-0 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-wider text-cream/65">{tour.trip_code}</p>
          <h1 className="font-serif text-2xl text-cream sm:text-3xl">{name}</h1>
          <p className="mt-1 text-xs text-cream/65">
            {tourDestination(tour.trip_code)} · {durationLabel}
          </p>
        </div>
      </div>

      {/* Horizontal swipeable strip */}
      {stripPhotos.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="flex gap-2">
            {stripPhotos.map((photo) => (
              <img
                key={photo.id}
                src={photoSrc(photo)}
                alt={name}
                className="h-20 w-28 shrink-0 rounded-lg object-cover ring-1 ring-line"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {tagline && <p className="text-sm text-ink/80">{tagline}</p>}

      {isPremiumTrip(tour.trip_code) && <PremiumTripCallout tripCode={tour.trip_code} />}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6">
          {isAuroraTrip(tour) && (
            <>
              <AuroraTracker />
              <div className="flex gap-2 rounded-editorial border border-teal-900/15 bg-mint-100 p-4">
                <Sparkles className="h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-900">{t('common.aurora')}</p>
                  <p className="mt-1 text-xs text-ink/70">{AURORA_DISCLAIMER[lang]}</p>
                </div>
              </div>
            </>
          )}

          {highlights.length > 0 && (
            <section>
              <h2 className="font-serif text-lg text-ink">
                {lang === 'th' ? 'ไฮไลท์' : 'Highlights'}
              </h2>
              <ul className="mt-2 space-y-2">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-ink/80">
                    <span className="text-teal-600">·</span>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {includes.length > 0 && (
              <section className="rounded-editorial border border-line bg-cream p-4">
                <h2 className="text-sm font-medium text-ink">
                  {lang === 'th' ? 'รวมในราคา' : "What's included"}
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-ink/70">
                  {includes.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </section>
            )}
            {excludes.length > 0 && (
              <section className="rounded-editorial border border-line bg-cream p-4">
                <h2 className="text-sm font-medium text-ink">
                  {lang === 'th' ? 'ไม่รวม' : 'Not included'}
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-ink/70">
                  {excludes.map((item) => (
                    <li key={item}>✗ {item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {itinerary && <TripTimeline itinerary={itinerary} nextDate={tour.departure_date} />}

          <div className="relative overflow-hidden rounded-2xl border border-line">
            <img
              src={staticMapUrl(mapCfg)}
              alt={lang === 'th' ? mapCfg.caption.th : mapCfg.caption.en}
              className="aspect-[760/285] w-full object-cover"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget
                img.onerror = null
                img.src = staticMapFallback(mapCfg)
              }}
            />
            <span className="absolute left-3 top-3 rounded-md bg-teal-900/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              {lang === 'th' ? 'แผนที่จริง' : 'Real map preview'}
            </span>
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-900/90 to-transparent px-3 pb-3 pt-8 text-xs text-cream">
              {lang === 'th' ? mapCfg.caption.th : mapCfg.caption.en}
            </p>
          </div>

          <Link
            to={`/trips/${tour.trip_code}/prep`}
            className="flex items-center justify-between rounded-editorial border border-line bg-cream px-4 py-3 text-sm text-ink transition-colors hover:border-teal-500/40"
          >
            <span>{lang === 'th' ? 'เตรียมตัวก่อนเดินทาง' : 'Trip Preparation'}</span>
            <ChevronRight className="h-4 w-4 text-teal-600" />
          </Link>

          <Link
            to="/photo-guide"
            className="flex items-center gap-3 rounded-editorial border border-line bg-mint-100 px-4 py-3"
          >
            <span className="text-sm font-medium text-ink">
              {lang === 'th'
                ? 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง'
                : 'Read the Photo Guide before you go'}
            </span>
            <ChevronRight className="ml-auto h-4 w-4 text-teal-600" />
          </Link>
        </div>

        <TripPricingCard tour={tour} includes={includes} />
      </div>
    </div>
  )
}
