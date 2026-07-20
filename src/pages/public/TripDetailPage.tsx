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
import { getTripMap, googleMapsEmbedUrl } from '../../data/tripMaps'
import { GALLERY_PHOTOS, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import SplitFlapPrice from '../../components/ui/SplitFlapPrice'
import TripPhotoHero from '../../components/trips/TripPhotoHero'
import TripPricingCard from '../../components/trips/TripPricingCard'
import TripBookButton from '../../components/trips/TripBookButton'
import TripStickyBookBar from '../../components/trips/TripStickyBookBar'
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
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null)

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

  // Reset the hover preview whenever the trip changes so it doesn't carry over.
  useEffect(() => {
    setPreviewPhoto(null)
  }, [tripCode])

  const stripPhotos = useMemo(() => {
    if (!tour) return []
    const prefix = tour.trip_code.split('-')[0]?.toLowerCase() ?? ''
    const matched = GALLERY_PHOTOS.filter(
      (p) => p.id.startsWith(prefix) || p.id.includes(prefix),
    )
    // No unrelated fallback here on purpose — an empty strip (hidden by the
    // `stripPhotos.length > 0` check below) beats showing photos of a
    // different destination, e.g. NSW beach shots on the Uluru trip page.
    return matched.slice(0, 8)
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
  const accommodationNote = details?.accommodationNote
    ? textFor(details.accommodationNote, lang)
    : ''
  const durationLabel = tourDurationLabel(tour, lang)
  const itinerary = getItinerary(tour.trip_code, details?.highlights, durationLabel)
  const mapCfg = getTripMap(tour.trip_code)

  return (
    <div className="space-y-6 pb-28 md:pb-4">
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
        <TripPhotoHero
          tripCode={tour.trip_code}
          alt={name}
          className="aspect-[16/10] w-full transition-opacity duration-150"
          overridePhoto={previewPhoto}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/20 to-transparent" />
        <div className="absolute bottom-0 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-wider text-cream/65">{tour.trip_code}</p>
          <h1 className="font-serif text-2xl text-cream sm:text-3xl">{name}</h1>
          <p className="mt-1 text-xs text-cream/65">
            {tourDestination(tour.trip_code)} · {durationLabel}
          </p>
        </div>
      </div>

      {/* Top CTA — visible without scrolling past the whole page */}
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-[0_8px_22px_-14px_rgba(15,28,30,0.35)]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <SplitFlapPrice
              amountAud={tour.price_aud}
              board
              className="text-[15px] font-extrabold leading-none"
            />
            <span className="text-[10px] font-semibold text-ink-soft">AUD</span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-ink-soft">
            {lang === 'th' ? 'ต่อคน · มัดจำล็อคที่นั่ง' : 'per person · deposit locks your seat'}
          </p>
        </div>
        <TripBookButton tour={tour} variant="deep" className="!w-auto shrink-0 !px-5 !py-2.5" />
      </div>

      {/* Horizontal swipeable strip — hover/focus a thumbnail to preview it in the hero above */}
      {stripPhotos.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="flex gap-2">
            {stripPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                aria-label={lang === 'th' ? 'ดูรูปนี้' : 'Preview this photo'}
                onMouseEnter={() => setPreviewPhoto(photo)}
                onMouseLeave={() => setPreviewPhoto(null)}
                onFocus={() => setPreviewPhoto(photo)}
                onBlur={() => setPreviewPhoto(null)}
                onClick={() => setPreviewPhoto(photo)}
                className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-1 transition-all ${
                  previewPhoto?.id === photo.id
                    ? 'ring-2 ring-teal-600'
                    : 'ring-line hover:ring-teal-600/60'
                }`}
              >
                <img
                  src={photoSrc(photo)}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {tagline && <p className="text-sm text-ink/80">{tagline}</p>}

      {isPremiumTrip(tour.trip_code) && <PremiumTripCallout tripCode={tour.trip_code} />}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="order-2 space-y-6 lg:order-1">
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

          {accommodationNote && (
            <section className="rounded-editorial border border-line bg-mint-100/80 p-4">
              <h2 className="text-sm font-medium text-ink">
                {lang === 'th' ? 'ที่พัก' : 'Accommodation'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{accommodationNote}</p>
            </section>
          )}

          {itinerary && <TripTimeline itinerary={itinerary} nextDate={tour.departure_date} />}

          <div className="relative overflow-hidden rounded-2xl border border-line">
            <iframe
              src={googleMapsEmbedUrl(mapCfg)}
              title={lang === 'th' ? mapCfg.caption.th : mapCfg.caption.en}
              className="aspect-[760/285] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-teal-900/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              Google Maps
            </span>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-900/90 to-transparent px-3 pb-3 pt-8 text-xs text-cream">
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

        <div className="order-1 lg:order-2">
          <TripPricingCard tour={tour} includes={includes} />
        </div>
      </div>

      <TripStickyBookBar tour={tour} />
    </div>
  )
}
