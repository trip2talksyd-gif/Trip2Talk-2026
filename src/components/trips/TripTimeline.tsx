import { useEffect, useState } from 'react'
import { BedDouble, Camera, Plane, UtensilsCrossed } from 'lucide-react'
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
  type ItineraryEvent,
  type ItineraryEventCategory,
  type ItinerarySeason,
  type TripItinerary,
} from '../../data/itineraries'

type Props = {
  itinerary: TripItinerary
  nextDate?: string | null
}

const CATEGORY_STYLE: Record<
  ItineraryEventCategory,
  { icon: typeof Plane; dot: string; labelEn: string; labelTh: string }
> = {
  flight: {
    icon: Plane,
    dot: 'bg-teal-700 text-cream',
    labelEn: 'Transport',
    labelTh: 'เดินทาง',
  },
  stay: {
    icon: BedDouble,
    dot: 'bg-teal-900 text-cream',
    labelEn: 'Stay',
    labelTh: 'ที่พัก',
  },
  activity: {
    icon: Camera,
    dot: 'bg-teal-500 text-ink',
    labelEn: 'Activity',
    labelTh: 'กิจกรรม',
  },
  meal: {
    icon: UtensilsCrossed,
    dot: 'bg-coral text-cream',
    labelEn: 'Meal',
    labelTh: 'มื้ออาหาร',
  },
}

function eventCategory(ev: ItineraryEvent): ItineraryEventCategory {
  return ev.category ?? 'activity'
}

function DayTimeline({ day }: { day: ItineraryDay }) {
  const { lang } = useLang()
  const title = lang === 'th' ? day.title.th : day.title.en
  const subtitle = lang === 'th' ? day.subtitle.th : day.subtitle.en

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-serif text-base font-semibold text-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
      </div>

      <div className="relative space-y-4 pl-10">
        <div
          className="absolute bottom-2 left-[15px] top-2 border-l border-dashed border-line"
          aria-hidden
        />

        {day.events.map((ev, i) => {
          const cat = eventCategory(ev)
          const style = CATEGORY_STYLE[cat]
          const Icon = style.icon
          return (
            <article key={`${day.day}-${i}`} className="relative">
              <div
                className={`absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${style.dot}`}
                title={lang === 'th' ? style.labelTh : style.labelEn}
                aria-label={lang === 'th' ? style.labelTh : style.labelEn}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              </div>
              <div className="rounded-editorial bg-mint-100/80 px-3 py-2.5">
                <p className="font-mono text-[11px] font-medium text-teal-600">{ev.time}</p>
                <p className="mt-0.5 text-sm leading-snug text-ink">
                  {lang === 'th' ? ev.description.th : ev.description.en}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      {day.note && (
        <div className="mt-4 rounded-editorial border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs text-ink">
          {lang === 'th' ? day.note.th : day.note.en}
        </div>
      )}
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
  const [activeDay, setActiveDay] = useState(0)

  useEffect(() => {
    setSelectedSeason(getDefaultSeason(itinerary, nextDate))
  }, [itinerary, nextDate])

  const days = seasonal
    ? getItineraryDays(itinerary, selectedSeason)
    : getItineraryDays(itinerary)

  useEffect(() => {
    setActiveDay(0)
  }, [selectedSeason, itinerary, days.length])

  const seasonVariant = seasonal ? getSeasonVariant(itinerary, selectedSeason) : undefined
  const seasonNote = seasonVariant?.seasonNote
  const currentDay = days[activeDay]

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl text-ink">
          {lang === 'th' ? 'แผนทริป' : 'Trip Plan'}
        </h2>
        {itinerary.headerNote && (
          <p className="mt-1 text-xs text-ink-soft">
            {lang === 'th' ? itinerary.headerNote.th : itinerary.headerNote.en}
          </p>
        )}
        {!itinerary.headerNote && !itinerary.detailed && !seasonal && (
          <p className="mt-1 text-xs text-ink-soft">
            {lang === 'th'
              ? 'ภาพรวมทริป — รายละเอียดชั่วโมงจะแจ้งก่อนออกเดินทาง'
              : 'Trip overview — hour-by-hour detail confirmed before departure'}
          </p>
        )}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_STYLE) as ItineraryEventCategory[]).map((key) => {
          const style = CATEGORY_STYLE[key]
          const Icon = style.icon
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-2 py-1 text-[10px] uppercase tracking-wider text-ink-soft"
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full ${style.dot}`}>
                <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
              {lang === 'th' ? style.labelTh : style.labelEn}
            </span>
          )
        })}
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
            const monthsLabel = lang === 'th' ? labels.months.th : labels.months.en
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
                    ? 'cursor-not-allowed border border-line bg-mint-100 text-ink-soft/50 opacity-60'
                    : isSelected
                      ? 'border border-teal-500 bg-teal-500/15 font-medium text-ink'
                      : 'border border-line bg-white text-ink/80 hover:border-teal-500/40'
                }`}
              >
                <span className="block font-medium">{label}</span>
                <span className="block text-[10px] opacity-80">{monthsLabel}</span>
              </button>
            )
          })}
        </div>
      )}

      {seasonNote && (
        <p className="rounded-editorial border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs text-ink">
          {lang === 'th' ? seasonNote.th : seasonNote.en}
        </p>
      )}

      {days.length > 0 ? (
        <>
          {/* Day tabs */}
          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
            role="tablist"
            aria-label={lang === 'th' ? 'เลือกวัน' : 'Select day'}
          >
            {days.map((day, index) => {
              const selected = index === activeDay
              return (
                <button
                  key={day.day}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveDay(index)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                    selected
                      ? 'bg-teal-900 text-cream'
                      : 'bg-mint-100 text-ink-soft hover:bg-teal-900/10'
                  }`}
                >
                  {lang === 'th' ? `วัน ${day.day}` : `Day ${day.day}`}
                </button>
              )
            })}
          </div>

          {currentDay && <DayTimeline day={currentDay} />}
        </>
      ) : (
        <p className="text-sm text-ink-soft">
          {lang === 'th'
            ? 'แผนการเดินทางฤดูนี้จะประกาศเร็วๆ นี้'
            : 'Itinerary for this season coming soon.'}
        </p>
      )}
    </section>
  )
}
