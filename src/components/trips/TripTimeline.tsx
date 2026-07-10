import { useEffect, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import {
  getAvailableSeasons,
  getDefaultSeason,
  getItineraryDays,
  getSeasonVariant,
  isSeasonalItinerary,
  ITINERARY_SEASONS,
  SEASON_LABELS,
  type ItineraryDay,
  type ItinerarySeason,
  type TripItinerary,
} from '../../data/itineraries'

type Props = {
  itinerary: TripItinerary
  nextDate?: string | null
}

function TimelineDays({ days }: { days: ItineraryDay[] }) {
  const { lang } = useLang()

  return (
    <div className="relative space-y-6 pl-8">
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gold/30" aria-hidden />

      {days.map((day) => {
        const title = lang === 'th' ? day.title.th : day.title.en
        const subtitle = lang === 'th' ? day.subtitle.th : day.subtitle.en
        return (
          <article key={day.day} className="relative">
            <div
              className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gold to-deep-green text-[11px] font-semibold text-gold-dark shadow"
              aria-hidden
            >
              {day.day}
            </div>
            <div className="rounded-editorial border border-deep-green/10 bg-cream/50 p-4">
              <h3 className="font-serif text-base font-semibold text-brand-dark">{title}</h3>
              <p className="mt-0.5 text-xs text-cream-muted">{subtitle}</p>
              <ul className="mt-3 space-y-2">
                {day.events.map((ev, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-mono text-xs text-gold">{ev.time}</span>
                    <span className="text-brand-dark/80">
                      {lang === 'th' ? ev.description.th : ev.description.en}
                    </span>
                  </li>
                ))}
              </ul>
              {day.note && (
                <div className="mt-3 rounded-editorial border border-amber/30 bg-amber/10 px-3 py-2 text-xs text-brand-dark">
                  {lang === 'th' ? day.note.th : day.note.en}
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default function TripTimeline({ itinerary, nextDate }: Props) {
  const { lang } = useLang()
  const seasonal = isSeasonalItinerary(itinerary)
  const availableSeasons = getAvailableSeasons(itinerary)

  const [selectedSeason, setSelectedSeason] = useState<ItinerarySeason>(() =>
    getDefaultSeason(itinerary, nextDate),
  )

  useEffect(() => {
    setSelectedSeason(getDefaultSeason(itinerary, nextDate))
  }, [itinerary, nextDate])

  const days = seasonal
    ? getItineraryDays(itinerary, selectedSeason)
    : getItineraryDays(itinerary)

  const seasonVariant = seasonal ? getSeasonVariant(itinerary, selectedSeason) : undefined
  const seasonNote = seasonVariant?.seasonNote

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl text-brand-dark">
          {lang === 'th' ? 'แผนการเดินทาง' : 'Day by Day'}
        </h2>
        {itinerary.headerNote && (
          <p className="mt-1 text-xs text-cream-muted">
            {lang === 'th' ? itinerary.headerNote.th : itinerary.headerNote.en}
          </p>
        )}
        {!itinerary.headerNote && !itinerary.detailed && !seasonal && (
          <p className="mt-1 text-xs text-cream-muted">
            {lang === 'th'
              ? 'ภาพรวมทริป — รายละเอียดชั่วโมงจะแจ้งก่อนออกเดินทาง'
              : 'Trip overview — hour-by-hour detail confirmed before departure'}
          </p>
        )}
      </div>

      {seasonal && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={lang === 'th' ? 'เลือกฤดูกาล' : 'Select season'}
        >
          {ITINERARY_SEASONS.map((season) => {
            const isAvailable = availableSeasons.includes(season)
            const labels = SEASON_LABELS[season]
            const label = lang === 'th' ? labels.th : labels.en
            const months = lang === 'th' ? labels.months.th : labels.months.en
            const isSelected = selectedSeason === season

            return (
              <button
                key={season}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-disabled={!isAvailable}
                disabled={!isAvailable}
                onClick={() => isAvailable && setSelectedSeason(season)}
                className={`rounded-editorial px-3 py-2 text-left text-xs transition-colors ${
                  !isAvailable
                    ? 'cursor-not-allowed border border-deep-green/10 bg-gray-100 text-gray-400 opacity-60'
                    : isSelected
                      ? 'border border-gold bg-gold/20 font-medium text-gold-dark'
                      : 'border border-deep-green/15 bg-white text-brand-dark/80 hover:border-gold/40'
                }`}
              >
                <span className="block font-medium">{label}</span>
                <span className="block text-[10px] opacity-80">{months}</span>
              </button>
            )
          })}
        </div>
      )}

      {seasonNote && (
        <p className="rounded-editorial border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-brand-dark">
          {lang === 'th' ? seasonNote.th : seasonNote.en}
        </p>
      )}

      {days.length > 0 ? (
        <TimelineDays days={days} />
      ) : (
        <p className="text-sm text-cream-muted">
          {lang === 'th'
            ? 'แผนการเดินทางฤดูนี้จะประกาศเร็วๆ นี้'
            : 'Itinerary for this season coming soon.'}
        </p>
      )}
    </section>
  )
}
