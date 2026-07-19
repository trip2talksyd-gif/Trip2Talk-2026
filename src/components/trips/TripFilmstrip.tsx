import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import type { Tour } from '../../types/tour'

type Props = {
  tours: Tour[]
  labelEn: string
  labelTh: string
  className?: string
}

export default function TripFilmstrip({ tours, labelEn, labelTh, className = '' }: Props) {
  const { lang } = useLang()
  if (tours.length === 0) return null

  // Duplicate set for seamless infinite CSS loop
  const slides = [...tours, ...tours]

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline gap-2">
        <p className="text-[11px] font-bold text-ink">{lang === 'th' ? labelTh : labelEn}</p>
        {lang === 'en' && (
          <span className="font-thai text-[10px] text-ink-soft">{labelTh}</span>
        )}
      </div>
      <div className="cal-filmstrip-viewport">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-5 bg-gradient-to-r from-cream to-transparent"
          aria-hidden
        />
        <div className="cal-filmstrip-track">
          {slides.map((tour, i) => {
            const name = lang === 'th' ? tour.name_th : tour.name_en
            return (
              <Link
                key={`${tour.id}-${i}`}
                to={`/trips/${tour.trip_code}`}
                className="group relative h-full w-[112px] shrink-0 overflow-hidden rounded-[14px] shadow-[0_10px_20px_-10px_rgba(15,28,30,0.35)] transition-transform duration-300 hover:-translate-y-1.5 hover:scale-105"
              >
                {tour.cover_image_url ? (
                  <img
                    src={tour.cover_image_url}
                    alt={name}
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
                  <span className="block text-[9.5px] font-bold leading-tight">{name}</span>
                  <span className="mt-0.5 block text-[7.5px] opacity-85">
                    {tourDurationLabel(tour, lang)} · {tourDestination(tour.trip_code)}
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
