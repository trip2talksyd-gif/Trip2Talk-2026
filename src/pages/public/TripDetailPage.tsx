import { useEffect, useMemo, useState } from 'react'
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
import { fetchTourByCode, formatAud, isTourBookable, seatsRemaining } from '../../lib/toursApi'
import {
  isAuroraTrip,
  tourDestination,
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { getTripDetails, listFor, textFor } from '../../data/tripDetails'
import { getItinerary } from '../../data/itineraries'
import { isPremiumTrip } from '../../data/tripTiers'
import { AURORA_DISCLAIMER } from '../../data/risks'
import { getTripMap, googleMapsEmbedUrl } from '../../data/tripMaps'
import { getGalleryPhotosForTrip, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import { getTripCoverVideoUrl } from '../../data/tripVideos'
import { getTestimonialsForTrip } from '../../data/testimonials'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
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
import TestimonialSection from '../../components/trips/TestimonialSection'

/** Mobile-only tabs (mockup .tab-row). On md+ every pane is shown at once. */
type DetailTab = 'details' | 'itinerary' | 'reviews'

export default function TripDetailPage() {
  const { tripCode } = useParams<{ tripCode: string }>()
  const { lang, t } = useLang()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const favorited = useIsFavorite(tripCode ?? '')
  const toggleFavorite = useToggleFavorite()
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null)
  const [tab, setTab] = useState<DetailTab>('details')

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
    setTab('details')
  }, [tripCode])

  const stripPhotos = useMemo(() => {
    if (!tour) return []
    // Matched by category (same mapping the hero photo uses), not by id
    // substring — an id-prefix match let an unrelated Uluru photo (id
    // "tas-002") sneak into the Tasmania trip's thumbnail strip. No
    // unrelated fallback here on purpose — an empty strip (hidden by the
    // `stripPhotos.length > 0` check below) beats showing photos of a
    // different destination.
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
    return <PageError message={error || t('common.error')} />
  }

  const details = getTripDetails(tour.trip_code)
  const name = lang === 'th' ? tour.name_th : tour.name_en
  const altName = lang === 'th' ? tour.name_en : tour.name_th
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
  const coverVideoUrl = getTripCoverVideoUrl(tour.trip_code)
  const bookable = isTourBookable(tour)
  const remaining = seatsRemaining(tour)
  const testimonials = getTestimonialsForTrip(tour.trip_code)
  // Urgency badge once seats are genuinely scarce — not from the very first
  // booking, so it doesn't cry wolf on a trip that just opened.
  const lowSeats = bookable && tour.max_seats > 0 && remaining <= Math.max(2, Math.ceil(tour.max_seats * 0.34))

  /** Hidden on mobile unless its tab is active; always visible from md up. */
  const pane = (id: DetailTab) => (tab === id ? '' : 'hidden md:block')

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'details', label: lang === 'th' ? 'รายละเอียด' : 'Details' },
    { id: 'itinerary', label: lang === 'th' ? 'เส้นทาง' : 'Itinerary' },
    { id: 'reviews', label: lang === 'th' ? 'รีวิว' : 'Reviews' },
  ]

  const statChips: { value: string; label: string }[] = [
    { value: durationLabel, label: lang === 'th' ? 'ระยะเวลา' : 'Duration' },
    {
      value: bookable
        ? lang === 'th'
          ? `เหลือ ${remaining}`
          : `${remaining} left`
        : lang === 'th'
          ? `สูงสุด ${tour.max_seats}`
          : `Max ${tour.max_seats}`,
      label: lang === 'th' ? 'ที่นั่ง' : 'Seats',
    },
    { value: formatAud(tour.price_aud), label: lang === 'th' ? 'ต่อคน' : 'Per person' },
  ]

  return (
    <div className="space-y-6 pb-28 md:pb-4">
      {/* Desktop back / favourite row — on mobile these live on the hero as circle buttons */}
      <div className="hidden items-center justify-between gap-3 md:flex">
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

      {/* Mockup .detail-hero (mobile ~42% tall) / .video-frame 21:9 (desktop) */}
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
              alt={name}
              className="aspect-[6/5] w-full transition-opacity duration-150 md:aspect-[21/9]"
              overridePhoto={previewPhoto}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/20 to-transparent" />

          {/* Mockup .detail-hero .top-row — circle back + heart (mobile only) */}
          <div className="absolute inset-x-3.5 top-3 flex items-center justify-between md:hidden">
            <Link
              to="/trips"
              aria-label={t('nav.trips')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
            </Link>
            <button
              type="button"
              onClick={() => toggleFavorite(tour.trip_code)}
              aria-pressed={favorited}
              aria-label={favorited ? t('favorites.remove') : t('favorites.add')}
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
              {lang === 'th'
                ? `🔥 เหลือ ${remaining} ที่นั่ง`
                : `🔥 Only ${remaining} seat${remaining === 1 ? '' : 's'} left`}
            </span>
          )}

          <div className="absolute bottom-0 hidden p-4 md:block sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-cream/65">{tour.trip_code}</p>
            <h1 className="font-serif text-2xl text-cream sm:text-3xl">{name}</h1>
            <p className="mt-1 text-xs text-cream/65">
              {tourDestination(tour.trip_code)} · {durationLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Mockup .detail-body head + .stat-row (mobile) */}
      <div className="md:hidden">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.04em] text-teal-600">
          {tourDestinationLabel(tour.trip_code, lang)} · {tour.trip_code}
        </p>
        <h1 className="mt-[3px] font-thai text-[17px] font-bold leading-snug text-ink">{name}</h1>
        <p className="mt-px font-thai text-[11.5px] font-medium text-ink-soft">{altName}</p>

        <div className="mt-2.5 flex gap-2">
          {statChips.map((chip) => (
            <div key={chip.label} className="flex-1 rounded-xl bg-mint-100 px-1 py-[7px] text-center">
              <b className="block text-[11.5px] text-teal-800">{chip.value}</b>
              <span className="text-[8.5px] uppercase leading-[1.4] text-ink-soft">
                {chip.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mockup .tab-row — mobile only; md+ shows every pane stacked */}
      <div
        className="-mt-2 flex gap-3.5 border-b border-line md:hidden"
        role="tablist"
        aria-label={name}
      >
        {tabs.map((item) => {
          const active = tab === item.id
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
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Top CTA — desktop only; mobile keeps TripStickyBookBar at the bottom */}
      <div className="hidden items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-[0_8px_22px_-14px_rgba(15,28,30,0.35)] md:flex">
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
            {bookable && lowSeats
              ? lang === 'th'
                ? `เหลือ ${remaining} ที่นั่ง · มัดจำล็อคที่นั่ง`
                : `${remaining} seat${remaining === 1 ? '' : 's'} left · deposit locks your seat`
              : lang === 'th'
                ? 'ต่อคน · มัดจำล็อคที่นั่ง'
                : 'per person · deposit locks your seat'}
          </p>
        </div>
        <TripBookButton tour={tour} variant="deep" className="!w-auto shrink-0 !px-5 !py-2.5" />
      </div>

      {/* Mockup .gallery-scroll — larger on desktop */}
      {stripPhotos.length > 0 && (
        <div
          className={`-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${pane('details')}`}
        >
          <div className="flex gap-2.5">
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
                className={`h-20 w-[7.5rem] shrink-0 overflow-hidden rounded-[14px] ring-1 transition-all sm:h-[170px] sm:w-[230px] ${
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
          <p className="mt-1.5 text-[11px] text-ink-soft">
            {lang === 'th' ? '↔ ปัดดูรูปเพิ่มเติม' : '↔ Swipe for more photos'}
          </p>
        </div>
      )}

      {tagline && (
        <p className={`text-[13px] leading-relaxed text-ink-soft sm:text-sm ${pane('details')}`}>
          {tagline}
        </p>
      )}

      {/* Mockup .meta-icons — desktop only; mobile uses the stat chips above */}
      <div className="hidden flex-wrap gap-x-[22px] gap-y-3 border-y border-line py-4 md:flex">
        <div className="text-[11.5px] text-ink-soft">
          <CalendarDays className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />
          <b className="block text-[13px] text-ink">{durationLabel}</b>
          {lang === 'th' ? 'ระยะเวลา' : 'Duration'}
        </div>
        <div className="text-[11.5px] text-ink-soft">
          <MapPin className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />
          <b className="block text-[13px] text-ink">{tourDestination(tour.trip_code)}</b>
          {lang === 'th' ? 'ปลายทาง' : 'Destination'}
        </div>
        <div className="text-[11.5px] text-ink-soft">
          <Users className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />
          <b className="block text-[13px] text-ink">
            {lang === 'th' ? `สูงสุด ${tour.max_seats}` : `Max ${tour.max_seats}`}
          </b>
          {lang === 'th' ? 'ขนาดกลุ่ม' : 'Group size'}
        </div>
        <div className="text-[11.5px] text-ink-soft">
          <Camera className="mb-1 h-4 w-4 text-teal-700" strokeWidth={2} />
          <b className="block text-[13px] text-ink">
            {lang === 'th' ? 'รวมช่างภาพ' : 'Pro photographer'}
          </b>
          {lang === 'th' ? 'ทุกทริป' : 'Every trip'}
        </div>
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
                  <p className="text-sm font-medium text-teal-900">{t('common.aurora')}</p>
                  <p className="mt-1 text-xs text-ink/70">{AURORA_DISCLAIMER[lang]}</p>
                </div>
              </div>
            </div>
          )}

          {highlights.length > 0 && (
            <section className={pane('details')}>
              <h2 className="font-thai text-[15.5px] text-ink">
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

          <div className={pane('reviews')}>
            <TestimonialSection testimonials={testimonials} />
            {testimonials.length === 0 && <ReviewsPlaceholder />}
          </div>

          <div className={`grid gap-4 sm:grid-cols-2 ${pane('details')}`}>
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
            <section
              className={`rounded-editorial border border-line bg-mint-100/80 p-4 ${pane('details')}`}
            >
              <h2 className="text-sm font-medium text-ink">
                {lang === 'th' ? 'ที่พัก' : 'Accommodation'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{accommodationNote}</p>
            </section>
          )}

          {itinerary && (
            <div className={pane('itinerary')}>
              <TripTimeline itinerary={itinerary} nextDate={tour.departure_date} />
            </div>
          )}

          <div className={`relative overflow-hidden rounded-2xl border border-line ${pane('details')}`}>
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
            className={`flex items-center justify-between rounded-editorial border border-line bg-cream px-4 py-3 text-sm text-ink transition-colors hover:border-teal-500/40 ${pane('details')}`}
          >
            <span>{lang === 'th' ? 'เตรียมตัวก่อนเดินทาง' : 'Trip Preparation'}</span>
            <ChevronRight className="h-4 w-4 text-teal-600" />
          </Link>

          <Link
            to="/photo-guide"
            className={`flex items-center gap-3 rounded-editorial border border-line bg-mint-100 px-4 py-3 ${pane('details')}`}
          >
            <span className="text-sm font-medium text-ink">
              {lang === 'th'
                ? 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง'
                : 'Read the Photo Guide before you go'}
            </span>
            <ChevronRight className="ml-auto h-4 w-4 text-teal-600" />
          </Link>
        </div>

        <div className={`order-1 lg:order-2 ${pane('details')}`}>
          <TripPricingCard tour={tour} includes={includes} />
        </div>
      </div>

      <TripStickyBookBar tour={tour} />
    </div>
  )
}

/**
 * Mockup .rev-summary chrome, but with no invented scores or counts —
 * real quotes land in src/data/testimonials.ts and render above this.
 */
function ReviewsPlaceholder() {
  const { lang } = useLang()

  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <h2 className="font-serif text-lg text-ink">
        {lang === 'th' ? 'รีวิวจากลูกทริป' : 'Guest reviews'}
      </h2>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
        {lang === 'th'
          ? 'เรายังไม่ลงรีวิวในเว็บ — อ่านคอมเมนต์และรูปจากลูกทริปจริงได้ที่เพจ Facebook ของเรา'
          : "We don't publish review scores here yet — read real comments and guest photos on our Facebook Page."}
      </p>
      <a
        href={FACEBOOK_PAGE_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-[11px] bg-mint-100 px-3.5 py-2 text-[11px] font-bold text-teal-700"
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
        {lang === 'th' ? 'ดูรีวิวบน Facebook' : 'See reviews on Facebook'}
      </a>
    </section>
  )
}
