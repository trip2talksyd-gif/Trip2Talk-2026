import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { fetchFeaturedTours, seatsRemaining } from '../../lib/toursApi'
import { tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import TripCoverImage from './TripCoverImage'
import SplitFlapPrice from '../ui/SplitFlapPrice'
import type { Tour } from '../../types/tour'

/** Real-trip proof section — 3 currently-bookable trips, real cover photos,
 * no invented testimonials. Silently renders nothing if the fetch fails or
 * comes back empty, since this is a supporting section, not critical path. */
export default function HomeTripShowcase() {
  const { t, lang } = useLang()
  const [tours, setTours] = useState<Tour[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFeaturedTours(3)
      .then((data) => {
        if (!cancelled) setTours(data)
      })
      .catch(() => {
        if (!cancelled) setTours([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (tours != null && tours.length === 0) return null

  return (
    <section className="bg-cream px-4 py-10 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">{t('home.showcase.title')}</h2>
            <p className="mt-1.5 text-sm text-ink-soft">{t('home.showcase.subtitle')}</p>
          </div>
          <Link
            to="/trips"
            className="hidden shrink-0 text-xs font-medium uppercase tracking-wider text-teal-600 sm:inline-block"
          >
            {t('home.showcase.cta')} →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(tours ?? [null, null, null]).map((tour, i) =>
            tour ? (
              <ShowcaseCard key={tour.id} tour={tour} lang={lang} />
            ) : (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-line bg-mint-100/40"
              />
            ),
          )}
        </div>

        <Link
          to="/trips"
          className="mt-5 block text-center text-xs font-medium uppercase tracking-wider text-teal-600 sm:hidden"
        >
          {t('home.showcase.cta')} →
        </Link>
      </div>
    </section>
  )
}

function ShowcaseCard({ tour, lang }: { tour: Tour; lang: 'en' | 'th' }) {
  const fallbackPhoto = getPreviewPhotoForTrip(tour.trip_code)
  const imgSrc = tour.cover_image_url || (fallbackPhoto ? photoSrc(fallbackPhoto) : null)

  return (
    <Link
      to={`/trips/${tour.trip_code}`}
      className="group overflow-hidden rounded-2xl border border-line bg-card shadow-[0_6px_18px_-10px_rgba(10,61,58,0.25)]"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <TripCoverImage
          src={imgSrc}
          alt={tour.name_en}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
          {tourDestination(tour.trip_code)}
        </p>
        <p className="mt-0.5 truncate font-thai text-sm font-bold text-ink">
          {lang === 'th' ? tour.name_th : tour.name_en}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
          <span>{tourDurationLabel(tour, lang)}</span>
          <SplitFlapPrice amountAud={tour.price_aud} className="text-[12px] font-extrabold text-ink" />
        </div>
        <p className="mt-1 text-[10.5px] font-semibold text-coral">
          {seatsRemaining(tour)} {lang === 'th' ? 'ที่นั่งว่าง' : 'seats left'}
        </p>
      </div>
    </Link>
  )
}
