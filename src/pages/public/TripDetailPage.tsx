import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchTourByCode } from '../../lib/toursApi'
import { isAuroraTrip, tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import { getTripDetails, listFor, textFor } from '../../data/tripDetails'
import { getItinerary } from '../../data/itineraries'
import { isPremiumTrip } from '../../data/tripTiers'
import { AURORA_DISCLAIMER } from '../../data/risks'
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full rounded-editorial" />
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

  return (
    <div className="space-y-6 pb-4">
      <Link to="/trips" className="inline-flex items-center gap-1 text-sm text-deep-green">
        <ArrowLeft className="h-4 w-4" />
        {t('nav.trips')}
      </Link>

      <div className="relative overflow-hidden rounded-editorial">
        <TripPhotoHero tripCode={tour.trip_code} alt={name} className="aspect-[16/10] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-near-black-green/80 to-transparent" />
        <div className="absolute bottom-0 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cream-muted">{tour.trip_code}</p>
          <h1 className="font-serif text-2xl text-cream">{name}</h1>
          <p className="text-xs text-cream-muted">
            {tourDestination(tour.trip_code)} · {durationLabel}
          </p>
        </div>
      </div>

      {tagline && <p className="text-sm text-brand-dark/80">{tagline}</p>}

      {isPremiumTrip(tour.trip_code) && <PremiumTripCallout tripCode={tour.trip_code} />}

      <TripPricingCard tour={tour} includes={includes} />

      <Link
        to={`/trips/${tour.trip_code}/prep`}
        className="flex items-center justify-between rounded-editorial border border-deep-green/15 bg-white px-4 py-3 text-sm text-brand-dark transition-colors hover:border-gold/40"
      >
        <span>
          {lang === 'th' ? '🧳 เตรียมตัวก่อนเดินทาง' : '🧳 Trip Preparation'}
        </span>
        <ChevronRight className="h-4 w-4 text-gold" />
      </Link>

      {isAuroraTrip(tour) && (
        <>
          <AuroraTracker />
          <div className="flex gap-2 rounded-editorial border border-deep-green/20 bg-deep-green/5 p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-medium text-deep-green">{t('common.aurora')}</p>
              <p className="mt-1 text-xs text-brand-dark/70">{AURORA_DISCLAIMER[lang]}</p>
            </div>
          </div>
        </>
      )}

      {highlights.length > 0 && (
        <section>
          <h2 className="font-serif text-lg text-brand-dark">
            {lang === 'th' ? 'ไฮไลท์' : 'Highlights'}
          </h2>
          <ul className="mt-2 space-y-2">
            {highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-brand-dark/80">
                <span className="text-gold">·</span>
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {includes.length > 0 && (
          <section className="rounded-editorial border border-deep-green/10 bg-white p-4">
            <h2 className="text-sm font-medium text-brand-dark">
              {lang === 'th' ? 'รวมในราคา' : 'Included'}
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-brand-dark/70">
              {includes.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </section>
        )}
        {excludes.length > 0 && (
          <section className="rounded-editorial border border-deep-green/10 bg-white p-4">
            <h2 className="text-sm font-medium text-brand-dark">
              {lang === 'th' ? 'ไม่รวม' : 'Not included'}
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-brand-dark/70">
              {excludes.map((item) => (
                <li key={item}>✗ {item}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="section-divider" />

      {itinerary && <TripTimeline itinerary={itinerary} nextDate={tour.departure_date} />}
    </div>
  )
}
