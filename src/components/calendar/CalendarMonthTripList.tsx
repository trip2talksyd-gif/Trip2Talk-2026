import { Link } from 'react-router-dom'
import { formatDate, seatsRemaining } from '../../lib/toursApi'
import { tourDestinationLabel, tourDurationLabel } from '../../lib/tourDisplay'
import type { Tour } from '../../types/tour'
import { departureIso } from './CalendarMonthGrid'

function dayParts(iso: string | null | undefined) {
  const day = departureIso(iso)
  if (!day) return { day: '—', mon: '' }
  const [y, m, d] = day.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    day: String(date.getDate()).padStart(2, '0'),
    mon: date.toLocaleDateString('en-AU', { month: 'short' }),
  }
}

type Props = {
  tours: Tour[]
  emptyEn: string
  emptyTh: string
  seatsLeftEn: string
  seatsLeftTh: string
  seatsFullEn: string
  seatsFullTh: string
}

/** Month-filtered trip rows (date, names, meta, seats) — restored from pre-grid CalendarPage. */
export default function CalendarMonthTripList({
  tours,
  emptyEn,
  emptyTh,
  seatsLeftEn,
  seatsLeftTh,
  seatsFullEn,
  seatsFullTh,
}: Props) {
  return (
    <ul className="space-y-2.5">
      {tours.map((tour) => {
        const seats = seatsRemaining(tour)
        const parts = dayParts(tour.departure_date)
        const destEn = tourDestinationLabel(tour.trip_code, 'en')
        const destTh = tourDestinationLabel(tour.trip_code, 'th')
        return (
          <li key={tour.id}>
            <Link
              to={`/trips/${tour.trip_code}`}
              className="flex items-center gap-2.5 rounded-[14px] border border-line bg-card p-[9px] transition-colors hover:border-teal-500/40"
            >
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint-100 text-teal-800">
                <span className="text-sm font-bold leading-none">{parts.day}</span>
                <span className="text-[7.5px] font-bold uppercase">{parts.mon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {tour.name_en}
                  <span className="ml-1 font-thai text-[10px] font-medium text-ink-soft">
                    {tour.name_th}
                  </span>
                </p>
                <p className="truncate text-[9.5px] text-ink-soft">
                  {tourDurationLabel(tour, 'en')} · {destEn}
                  {tour.departure_date ? ` · ${formatDate(tour.departure_date, 'en')}` : ''}
                </p>
                <p className="truncate font-thai text-[8.5px] text-ink-soft/80">
                  {tourDurationLabel(tour, 'th')} · {destTh}
                  {tour.departure_date ? ` · ${formatDate(tour.departure_date, 'th')}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-right text-[9px] font-bold text-coral">
                {seats === 0 ? seatsFullEn : `${seats} ${seatsLeftEn}`}
                <span className="mt-0.5 block font-thai text-[8px] font-medium opacity-85">
                  {seats === 0 ? seatsFullTh : `${seatsLeftTh} ${seats}`}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
      {tours.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-soft">
          {emptyEn}
          <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">{emptyTh}</span>
        </p>
      )}
    </ul>
  )
}
