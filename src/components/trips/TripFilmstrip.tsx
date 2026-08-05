import { Link } from 'react-router-dom'
import { tourDestinationLabel, tourDurationLabel } from '../../lib/tourDisplay'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import type { Tour } from '../../types/tour'

type Props = {
  tours: Tour[]
  labelEn: string
  labelTh: string
  className?: string
}

export default function TripFilmstrip({ tours, labelEn, labelTh, className = '' }: Props) {
  if (tours.length === 0) return null

  // Duplicate set for seamless infinite CSS loop
  const slides = [...tours, ...tours]

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline gap-2">
        <p className="text-[11px] font-bold text-ink">{labelEn}</p>
        <span className="font-thai text-[10px] text-ink-soft">{labelTh}</span>
      </div>
      <div className="cal-filmstrip-viewport">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-5 bg-gradient-to-r from-cream to-transparent"
          aria-hidden
        />
        <div className="cal-filmstrip-track">
          {slides.map((tour, i) => {
            const fallbackPhoto = getPreviewPhotoForTrip(tour.trip_code)
            const imgSrc = tour.cover_image_url || (fallbackPhoto ? photoSrc(fallbackPhoto) : null)
            const destEn = tourDestinationLabel(tour.trip_code, 'en')
            const destTh = tourDestinationLabel(tour.trip_code, 'th')
            return (
              <Link
                key={`${tour.id}-${i}`}
                to={`/trips/${tour.trip_code}`}
                className="group relative h-full w-[112px] shrink-0 overflow-hidden rounded-[14px] shadow-[0_10px_20px_-10px_rgba(15,28,30,0.35)] transition-transform duration-300 hover:-translate-y-1.5 hover:scale-105"
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`${tour.name_en} / ${tour.name_th}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-teal-800 text-cream/40">
                    T2T
                  </div>
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-cream/92 px-1.5 py-0.5 text-[7.5px] font-extrabold tracking-wide text-ink">
                  {tour.trip_code}
                </span>
                <span className="absolute inset-x-2 bottom-1.5 text-cream">
                  <span className="block text-[9.5px] font-bold leading-tight">
                    {tour.name_en}
                    <span className="mt-0.5 block font-thai text-[8px] font-medium opacity-85">
                      {tour.name_th}
                    </span>
                  </span>
                  <span className="mt-1 block text-[7px] opacity-85">
                    {tourDurationLabel(tour, 'en')} · {destEn}
                    <span className="font-thai"> · {tourDurationLabel(tour, 'th')} · {destTh}</span>
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-5 bg-gradient-to-l from-cream to-transparent"
          aria-hidden
        />
      </div>
    </div>
  )
}
