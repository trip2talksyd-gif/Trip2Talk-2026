import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useIsFavorite, useToggleFavorite } from '../../hooks/useFavorites'
import {
  fetchFeaturedTours,
  fetchTourByCode,
  formatAud,
  isTourBookable,
  seatsRemaining,
} from '../../lib/toursApi'
import {
  isAuroraTrip,
  tourDestination,
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { getTripDetails } from '../../data/tripDetails'
import { getItinerary } from '../../data/itineraries'
import { isPremiumTrip } from '../../data/tripTiers'
import { AURORA_DISCLAIMER } from '../../data/risks'
import { getTripMap, googleMapsEmbedUrl } from '../../data/tripMaps'
import {
  getGalleryPhotosForTrip,
  getPreviewPhotoForTrip,
  photoSrc,
  type GalleryPhoto,
} from '../../data/galleryPhotos'
import { getTripCoverVideoUrl } from '../../data/tripVideos'
import { getTestimonialsForTrip } from '../../data/testimonials'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import BiText from '../../components/ui/BiText'
import SplitFlapPrice from '../../components/ui/SplitFlapPrice'
import TripPhotoHero from '../../components/trips/TripPhotoHero'
import TripPricingCard from '../../components/trips/TripPricingCard'
import TripBookButton from '../../components/trips/TripBookButton'
import TripStickyBookBar from '../../components/trips/TripStickyBookBar'
import AuroraTracker from '../../components/trips/AuroraTracker'
import TripTimeline from '../../components/trips/TripTimeline'
import PremiumTripCallout from '../../components/trips/PremiumTripCallout'
import TestimonialSection from '../../components/trips/TestimonialSection'
import type { TranslationKey } from '../../i18n/translations'

/** Mobile-only tabs (mockup .tab-row). On md+ every pane is shown at once. */
type DetailTab = 'details' | 'itinerary' | 'reviews'

const TAB_KEYS: { id: DetailTab; key: TranslationKey }[] = [
  { id: 'details', key: 'detail.tab.details' },
  { id: 'itinerary', key: 'detail.tab.itinerary' },
  { id: 'reviews', key: 'detail.tab.reviews' },
]

export default function TripDetailPage() {
  const { tripCode } = useParams<{ tripCode: string }>()
  const { tt } = useLang()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const favorited = useIsFavorite(tripCode ?? '')
  const toggleFavorite = useToggleFavorite()
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null)
  const [tab, setTab] = useState<DetailTab>('details')
  const [moreTrips, setMoreTrips] = useState<Tour[]>([])

  const errorBi = tt('common.error')

  useEffect(() => {
    if (!tripCode) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchTourByCode(tripCode)
      .then(setTour)
      .catch(() => setError(errorBi.en))
      .finally(() => setLoading(false))
  }, [tripCode, errorBi.en])

  useEffect(() => {
    setPreviewPhoto(null)
    setTab('details')
  }, [tripCode])

  useEffect(() => {
    let cancelled = false
    fetchFeaturedTours(6)
      .then((tours) => {
        if (cancelled) return
        setMoreTrips(tours.filter((t) => t.trip_code !== tripCode).slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setMoreTrips([])
      })
    return () => {
      cancelled = true
    }
  }, [tripCode])

  const stripPhotos = useMemo(() => {
    if (!tour) return []
    return getGalleryPhotosForTrip(tour.trip_code).slice(0, 8)
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
    return <PageError message={error || errorBi.en} />
  }

  const details = getTripDetails(tour.trip_code)
  const durationEn = tourDurationLabel(tour, 'en')
  const durationTh = tourDurationLabel(tour, 'th')
  const itinerary = getItinerary(tour.trip_code, undefined, undefined, tour.itinerary)
  const isMultiDay = (tour.duration_days ?? 0) > 1 || /[2-9]D|\d{2,}D/.test(tour.trip_code.toUpperCase())
  const showItineraryComingSoon = !itinerary && isMultiDay
  const mapCfg = getTripMap(tour.trip_code)
  const coverVideoUrl = getTripCoverVideoUrl(tour.trip_code)
  const bookable = isTourBookable(tour)
  const remaining = seatsRemaining(tour)
  const testimonials = getTestimonialsForTrip(tour.trip_code)
  const lowSeats =
    bookable && tour.max_seats > 0 && remaining <= Math.max(2, Math.ceil(tour.max_seats * 0.34))

  const pane = (id: DetailTab) => (tab === id ? '' : 'hidden md:block')

  const navTrips = tt('nav.trips')
  const favAdd = tt('favorites.add')
  const favRemove = tt('favorites.remove')
  const swipe = tt('detail.swipePhotos')
  const highlightsBi = tt('detail.highlights')
  const includesBi = tt('detail.includes')
  const excludesBi = tt('detail.excludes')
  const accomBi = tt('detail.accommodation')
  const prepBi = tt('detail.prep')
  const guideBi = tt('detail.photoGuide')
  const moreBi = tt('detail.moreTrips')
  const auroraBi = tt('common.aurora')
  const fromBi = tt('detail.fromPrice')

  const seatsValue = bookable
    ? { en: `${remaining} left`, th: `เหลือ ${remaining}` }
    : { en: `Max ${tour.max_seats}`, th: `สูงสุด ${tour.max_seats}` }

  const statChips = [
    {
      value: durationEn,
      label: tt('detail.stat.duration'),
    },
    {
      value: seatsValue.en,
      label: tt('detail.stat.seats'),
    },
    {
      value: formatAud(tour.price_aud),
      label: tt('detail.stat.perPerson'),
    },
  ]

  return (
    <div className="space-y-6 pb-28 md:pb-4">
      <div className="hidden items-center justify-between gap-3 md:flex">
        <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-teal-700">
          <ArrowLeft className="h-4 w-4" />
          <span>
            {navTrips.en}
            <span className="ml-1 font-thai text-[11px] opacity-80">{navTrips.th}</span>
          </span>
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
          {favorited ? `${favRemove.en} / ${favRemove.th}` : `${favAdd.en} / ${favAdd.th}`}
        </button>
      </div>

      <div className="-mx-4 overflow-hidden sm:-mx-6 md:mx-0 md:rounded-2xl">
        <div className="relative">
          {coverVideoUrl && !previewPhoto ? (
            <video
              key={coverVideoUrl}
              src={coverVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="aspect-[6/5] w-full object-cover md:aspect-[21/9]"
            />
          ) : (
            <TripPhotoHero
              tripCode={tour.trip_code}
              alt={tour.name_en}
              className="aspect-[6/5] w-full transition-opacity duration-150 md:aspect-[21/9]"
              overridePhoto={previewPhoto}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/20 to-transparent" />

          <div className="absolute inset-x-3.5 top-3 flex items-center justify-between md:hidden">
            <Link
              to="/trips"
              aria-label={`${navTrips.en} / ${navTrips.th}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
            </Link>
            <button
              type="button"
              onClick={() => toggleFavorite(tour.trip_code)}
              aria-pressed={favorited}
              aria-label={
                favorited ? `${favRemove.en} / ${favRemove.th}` : `${favAdd.en} / ${favAdd.th}`
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)]"
            >
              <Heart
                className={`h-4 w-4 ${favorited ? 'fill-coral text-coral' : 'text-ink/60'}`}
                strokeWidth={2.25}
              />
            </button>
          </div>

          {lowSeats && (
            <span className="absolute bottom-3 left-4 animate-pulse rounded-full bg-coral px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] md:bottom-auto md:left-auto md:right-3 md:top-3">
              🔥 {remaining} left · เหลือ {remaining}
            </span>
          )}

          <div className="absolute bottom-0 hidden p-4 md:block sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-cream/65">{tour.trip_code}</p>
            <h1 className="font-serif text-2xl text-cream sm:text-3xl">{tour.name_en}</h1>
            <p className="mt-1 font-thai text-sm text-cream/80">{tour.name_th}</p>
            <p className="mt-1 text-xs text-cream/65">
              {tourDestination(tour.trip_code)} · {durationEn} / {durationTh}
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.04em] text-teal-600">
          {tourDestinationLabel(tour.trip_code, 'en')} · {tour.trip_code}
          <span className="ml-1 font-thai text-[8px] font-medium normal-case tracking-normal opacity-80">
            {tourDestinationLabel(tour.trip_code, 'th')}
          </span>
        </p>
        <h1 className="mt-[3px] font-thai text-[17px] font-bold leading-snug text-ink">
          {tour.name_en}
          <span className="mt-px block text-[11.5px] font-medium text-ink-soft">{tour.name_th}</span>
        </h1>

        <div className="mt-2.5 flex gap-2">
          {statChips.map((chip) => (
            <div key={chip.label.en} className="flex-1 rounded-xl bg-mint-100 px-1 py-[7px] text-center">
              <b className="block text-[11.5px] text-teal-800">{chip.value}</b>
              <span className="text-[8.5px] uppercase leading-[1.4] text-ink-soft">
                {chip.label.en}
                <span className="block font-thai text-[7.5px] normal-case opacity-85">
                  {chip.label.th}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="-mt-2 flex gap-3.5 border-b border-line md:hidden"
        role="tablist"
        aria-label={tour.name_en}
      >
        {TAB_KEYS.map((item) => {
          const active = tab === item.id
          const label = tt(item.key)
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`pb-[7px] text-[10.5px] font-bold ${
                active ? 'border-b-2 border-teal-700 text-teal-700' : 'text-ink-soft'
              }`}
            >
              {label.en}
              <span className="font-thai font-medium opacity-85"> · {label.th}</span>
            </button>
          )
        })}
      </div>

      <div className="hidden items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-[0_8px_22px_-14px_rgba(15,28,30,0.35)] md:flex">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-[10px] font-semibold text-ink-soft">{fromBi.en}</span>
            <SplitFlapPrice
              amountAud={tour.price_aud}
              board
              className="text-[15px] font-extrabold leading-none"
            />
            <span className="text-[10px] font-semibold text-ink-soft">AUD</span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-ink-soft">
            {bookable && lowSeats
              ? `${remaining} seats left · deposit locks your seat / เหลือ ${remaining} · มัดจำล็อคที่นั่ง`
              : 'per person · deposit locks your seat / ต่อคน · มัดจำล็อคที่นั่ง'}
          </p>
        </div>
        <TripBookButton tour={tour} variant="deep" className="!w-auto shrink-0 !px-5 !py-2.5" />
      </div>

      {stripPhotos.length > 0 && (
        <div
          className={`-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${pane('details')}`}
        >
          <div className="flex gap-2.5">
            {stripPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                aria-label={swipe.en}
                onMouseEnter={() => setPreviewPhoto(photo)}
                onMouseLeave={() => setPreviewPhoto(null)}
                onFocus={() => setPreviewPhoto(photo)}
                onBlur={() => setPreviewPhoto(null)}
                onClick={() => setPreviewPhoto(photo)}
                className={`h-20 w-[7.5rem] shrink-0 overflow-hidden rounded-[14px] ring-1 transition-all sm:h-[170px] sm:w-[230px] ${
                  previewPhoto?.id === photo.id
                    ? 'ring-2 ring-teal-600'
                    : 'ring-line hover:ring-teal-600/60'
                }`}
              >
                <img
                  src={photoSrc(photo)}
                  alt={tour.name_en}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <BiText
            as="p"
            en={swipe.en}
            th={swipe.th}
            className="mt-1.5 text-[11px] text-ink-soft"
            thClassName="mt-px block font-thai text-[10px] text-ink-soft/85"
          />
        </div>
      )}

      {details?.tagline && (
        <div
          className={`space-y-1.5 text-[13px] leading-relaxed text-ink-soft sm:text-sm ${pane('details')}`}
        >
          <p>{details.tagline.en}</p>
          <p className="font-thai text-[12px] sm:text-[13px]">{details.tagline.th}</p>
        </div>
      )}

      <div className="hidden flex-wrap gap-x-[22px] gap-y-3 border-y border-line py-4 md:flex">
        <MetaIcon
          icon={<CalendarDays className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />}
          value={durationEn}
          label={tt('detail.stat.duration')}
        />
        <MetaIcon
          icon={<MapPin className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />}
          value={tourDestination(tour.trip_code)}
          label={tt('detail.stat.destination')}
        />
        <MetaIcon
          icon={<Users className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />}
          value={`Max ${tour.max_seats}`}
          label={tt('detail.stat.group')}
        />
        <MetaIcon
          icon={<Camera className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />}
          value={tt('detail.stat.photographer').en}
          label={tt('detail.stat.photographerSub')}
        />
      </div>

      {isPremiumTrip(tour.trip_code) && (
        <div className={pane('details')}>
          <PremiumTripCallout tripCode={tour.trip_code} />
        </div>
      )}

      <div className="grid gap-9 lg:grid-cols-[1.7fr_1fr] lg:items-start">
        <div className="order-2 space-y-6 lg:order-1">
          {isAuroraTrip(tour) && (
            <div className={`space-y-6 ${pane('details')}`}>
              <AuroraTracker />
              <div className="flex gap-2 rounded-editorial border border-teal-900/15 bg-mint-100 p-4">
                <Sparkles className="h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <BiText
                    as="p"
                    en={auroraBi.en}
                    th={auroraBi.th}
                    className="text-sm font-medium text-teal-900"
                    thClassName="mt-0.5 block font-thai text-xs font-medium text-teal-800"
                  />
                  <p className="mt-1 text-xs text-ink/70">{AURORA_DISCLAIMER.en}</p>
                  <p className="mt-0.5 font-thai text-xs text-ink/60">{AURORA_DISCLAIMER.th}</p>
                </div>
              </div>
            </div>
          )}

          {details && details.highlights.en.length > 0 && (
            <section className={pane('details')}>
              <BiText
                as="h2"
                en={highlightsBi.en}
                th={highlightsBi.th}
                className="font-thai text-[15.5px] text-ink"
                thClassName="mt-0.5 block text-[12px] font-medium text-ink-soft"
              />
              <ul className="mt-2 space-y-2">
                {details.highlights.en.map((h, i) => (
                  <li key={h} className="flex gap-2 text-sm text-ink/80">
                    <span className="text-teal-600">·</span>
                    <span>
                      {h}
                      {details.highlights.th[i] && (
                        <span className="mt-0.5 block font-thai text-[12px] text-ink-soft">
                          {details.highlights.th[i]}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {itinerary && (
            <div className={pane('itinerary')}>
              <TripTimeline itinerary={itinerary} nextDate={tour.departure_date} />
            </div>
          )}

          {showItineraryComingSoon && (
            <section
              className={`rounded-2xl border border-dashed border-line bg-mint-100/50 px-4 py-5 ${pane('itinerary')}`}
            >
              <BiText
                as="h2"
                en="Day-by-day itinerary"
                th="แผนทริปวันต่อวัน"
                serif
                className="text-xl text-ink"
                thClassName="mt-0.5 block font-thai text-sm font-medium text-ink-soft"
              />
              <BiText
                as="p"
                en="Detailed day-by-day plan coming soon — we'll publish it here before departure."
                th="แผนวันต่อวันกำลังจัดทำ — จะอัปเดตก่อนออกเดินทาง"
                className="mt-2 text-sm text-ink-soft"
                thClassName="mt-1 block font-thai text-xs text-ink-soft"
              />
            </section>
          )}

          <div className={pane('reviews')}>
            <TestimonialSection testimonials={testimonials} />
            {testimonials.length === 0 && <ReviewsPlaceholder />}
          </div>

          <div className={`grid gap-4 sm:grid-cols-2 ${pane('details')}`}>
            {details && details.includes.en.length > 0 && (
              <section className="rounded-editorial border border-line bg-cream p-4">
                <BiText
                  as="h2"
                  en={includesBi.en}
                  th={includesBi.th}
                  className="text-sm font-medium text-ink"
                  thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
                />
                <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
                  {details.includes.en.map((item, i) => (
                    <li key={item}>
                      ✓ <b>{item}</b>
                      {details.includes.th[i] && (
                        <em className="mt-0.5 block font-thai text-[11px] not-italic text-ink-soft">
                          {details.includes.th[i]}
                        </em>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {details && details.excludes.en.length > 0 && (
              <section className="rounded-editorial border border-line bg-cream p-4">
                <BiText
                  as="h2"
                  en={excludesBi.en}
                  th={excludesBi.th}
                  className="text-sm font-medium text-ink"
                  thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
                />
                <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
                  {details.excludes.en.map((item, i) => (
                    <li key={item}>
                      ✗ {item}
                      {details.excludes.th[i] && (
                        <em className="mt-0.5 block font-thai text-[11px] not-italic text-ink-soft">
                          {details.excludes.th[i]}
                        </em>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {details?.accommodationNote && (
            <section
              className={`rounded-editorial border border-line bg-mint-100/80 p-4 ${pane('details')}`}
            >
              <BiText
                as="h2"
                en={accomBi.en}
                th={accomBi.th}
                className="text-sm font-medium text-ink"
                thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
              />
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {details.accommodationNote.en}
              </p>
              <p className="mt-1 font-thai text-[12px] leading-relaxed text-ink/70">
                {details.accommodationNote.th}
              </p>
            </section>
          )}

          <div className={`relative overflow-hidden rounded-2xl border border-line ${pane('details')}`}>
            <iframe
              src={googleMapsEmbedUrl(mapCfg)}
              title={mapCfg.caption.en}
              className="aspect-[760/285] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-teal-900/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              Google Maps
            </span>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-900/90 to-transparent px-3 pb-3 pt-8 text-xs text-cream">
              {mapCfg.caption.en}
              <span className="mt-0.5 block font-thai text-[11px] text-cream/85">
                {mapCfg.caption.th}
              </span>
            </p>
          </div>

          <Link
            to={`/trips/${tour.trip_code}/prep`}
            className={`flex items-center justify-between rounded-editorial border border-line bg-cream px-4 py-3 text-sm text-ink transition-colors hover:border-teal-500/40 ${pane('details')}`}
          >
            <BiText
              en={prepBi.en}
              th={prepBi.th}
              thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft"
            />
            <ChevronRight className="h-4 w-4 shrink-0 text-teal-600" />
          </Link>

          <Link
            to="/photo-guide"
            className={`flex items-center gap-3 rounded-editorial border border-line bg-mint-100 px-4 py-3 ${pane('details')}`}
          >
            <BiText
              en={guideBi.en}
              th={guideBi.th}
              className="text-sm font-medium text-ink"
              thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
            />
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-teal-600" />
          </Link>
        </div>

        <div className={`order-1 lg:order-2 ${pane('details')}`}>
          <TripPricingCard tour={tour} includes={details?.includes.en ?? []} />
        </div>
      </div>

      {moreTrips.length > 0 && (
        <section className="border-t border-line pt-6">
          <BiText
            as="h2"
            en={moreBi.en}
            th={moreBi.th}
            serif
            className="text-lg text-ink sm:text-xl"
            thClassName="mt-0.5 block font-thai text-sm font-medium text-ink-soft"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {moreTrips.map((rec) => {
              const preview = getPreviewPhotoForTrip(rec.trip_code)
              const img = rec.cover_image_url || (preview ? photoSrc(preview) : '')
              return (
                <Link
                  key={rec.id}
                  to={`/trips/${rec.trip_code}`}
                  className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_6px_18px_-12px_rgba(10,61,58,0.25)]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={rec.name_en}
                      className="aspect-[5/3.6] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <TripPhotoHero
                      tripCode={rec.trip_code}
                      alt={rec.name_en}
                      className="aspect-[5/3.6] w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-teal-600">
                      {tourDestinationLabel(rec.trip_code, 'en')}
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-bold text-ink">
                      {rec.name_en}
                      <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
                        {rec.name_th}
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] font-extrabold text-coral">
                      {formatAud(rec.price_aud)} AUD
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <TripStickyBookBar tour={tour} />
    </div>
  )
}

function MetaIcon({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: { en: string; th: string }
}) {
  return (
    <div className="text-[11.5px] text-ink-soft">
      {icon}
      <b className="block text-[13px] text-ink">{value}</b>
      {label.en}
      <span className="block font-thai text-[10px] opacity-85">{label.th}</span>
    </div>
  )
}

/**
 * Mockup .rev-summary chrome without invented scores —
 * real quotes live in testimonials.ts; otherwise Facebook CTA.
 */
function ReviewsPlaceholder() {
  const { tt } = useLang()
  const title = tt('detail.reviews.title')
  const body = tt('detail.reviews.body')
  const cta = tt('detail.reviews.cta')

  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <BiText
        as="h2"
        en={title.en}
        th={title.th}
        serif
        className="text-lg text-ink"
        thClassName="mt-0.5 block font-thai text-sm font-medium text-ink-soft"
      />
      <BiText
        as="p"
        en={body.en}
        th={body.th}
        className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft"
        thClassName="mt-1 block font-thai text-[11px] text-ink-soft/85"
      />
      <a
        href={FACEBOOK_PAGE_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-[11px] bg-mint-100 px-3.5 py-2 text-[11px] font-bold text-teal-700"
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
        {cta.en}
        <span className="font-thai font-medium opacity-85"> · {cta.th}</span>
      </a>
    </section>
  )
}
