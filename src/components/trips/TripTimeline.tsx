import { useEffect, useState } from 'react'
import { BedDouble, Camera, ChevronDown, Plane, UtensilsCrossed } from 'lucide-react'
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
import BiText from '../ui/BiText'

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

function DayAccordionPanel({ day, open, onToggle }: {
  day: ItineraryDay
  open: boolean
  onToggle: () => void
}) {
  const panelId = `itinerary-day-${day.day}`

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mint-100/60"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-900 text-xs font-bold text-cream">
          {day.day}
        </span>
        <span className="min-w-0 flex-1">
          <BiText
            as="span"
            en={day.title.en}
            th={day.title.th}
            className="block text-sm font-semibold text-ink sm:text-[15px]"
            thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
          />
          {(day.subtitle.en || day.subtitle.th) && (
            <BiText
              as="span"
              en={day.subtitle.en}
              th={day.subtitle.th}
              className="mt-1 block text-xs text-ink-soft"
              thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft/85"
            />
          )}
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-teal-700 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-line px-4 pb-4 pt-3">
          <div className="relative space-y-3 pl-10">
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
                    title={`${style.labelEn} / ${style.labelTh}`}
                    aria-label={`${style.labelEn} / ${style.labelTh}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </div>
                  <div className="rounded-editorial bg-mint-100/80 px-3 py-2.5">
                    <p className="font-mono text-[11px] font-medium text-teal-600">{ev.time}</p>
                    <BiText
                      as="p"
                      en={ev.description.en}
                      th={ev.description.th}
                      className="mt-0.5 text-sm leading-snug text-ink"
                      thClassName="mt-1 block font-thai text-[12px] leading-snug text-ink-soft"
                    />
                  </div>
                </article>
              )
            })}
          </div>

          {day.note && (
            <div className="mt-3 rounded-editorial border border-teal-500/30 bg-teal-500/10 px-3 py-2">
              <BiText
                as="p"
                en={day.note.en}
                th={day.note.th}
                className="text-xs text-ink"
                thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TripTimeline({ itinerary, nextDate }: Props) {
  const seasonal = isSeasonalItinerary(itinerary)
  const availableSeasons = getAvailableSeasons(itinerary)

  const [selectedSeason, setSelectedSeason] = useState<ItinerarySeason>(() =>
    getDefaultSeason(itinerary, nextDate),
  )
  const [openDay, setOpenDay] = useState(1)

  useEffect(() => {
    setSelectedSeason(getDefaultSeason(itinerary, nextDate))
  }, [itinerary, nextDate])

  const days = seasonal
    ? getItineraryDays(itinerary, selectedSeason)
    : getItineraryDays(itinerary)

  useEffect(() => {
    setOpenDay(days[0]?.day ?? 1)
  }, [selectedSeason, itinerary, days.length, days[0]?.day])

  const seasonVariant = seasonal ? getSeasonVariant(itinerary, selectedSeason) : undefined
  const seasonNote = seasonVariant?.seasonNote

  return (
    <section className="space-y-4">
      <div>
        <BiText
          as="h2"
          en="Day-by-day itinerary"
          th="แผนทริปวันต่อวัน"
          serif
          className="text-xl text-ink"
          thClassName="mt-0.5 block font-thai text-sm font-medium text-ink-soft"
        />
        {itinerary.headerNote && (
          <BiText
            as="p"
            en={itinerary.headerNote.en}
            th={itinerary.headerNote.th}
            className="mt-1 text-xs text-ink-soft"
            thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft/85"
          />
        )}
        {!itinerary.headerNote && !itinerary.detailed && !seasonal && (
          <BiText
            as="p"
            en="Trip overview — hour-by-hour detail confirmed before departure"
            th="ภาพรวมทริป — รายละเอียดชั่วโมงจะแจ้งก่อนออกเดินทาง"
            className="mt-1 text-xs text-ink-soft"
            thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft/85"
          />
        )}
      </div>

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
              {style.labelEn}
              <span className="font-thai normal-case tracking-normal opacity-80">/ {style.labelTh}</span>
            </span>
          )
        })}
      </div>

      {seasonal && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Select season / เลือกฤดูกาล"
        >
          {ITINERARY_SEASONS.map((season) => {
            const isAvailable = availableSeasons.includes(season)
            const labels = SEASON_LABELS[season]
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
                <span className="block font-medium">
                  {labels.en}
                  <span className="ml-1 font-thai font-normal opacity-80">/ {labels.th}</span>
                </span>
                <span className="block text-[10px] opacity-80">
                  {labels.months.en} · {labels.months.th}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {seasonNote && (
        <div className="rounded-editorial border border-teal-500/30 bg-teal-500/10 px-3 py-2">
          <BiText
            as="p"
            en={seasonNote.en}
            th={seasonNote.th}
            className="text-xs text-ink"
            thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft"
          />
        </div>
      )}

      {days.length > 0 ? (
        <div className="space-y-2">
          {days.map((day) => (
            <DayAccordionPanel
              key={day.day}
              day={day}
              open={openDay === day.day}
              onToggle={() => setOpenDay((prev) => (prev === day.day ? 0 : day.day))}
            />
          ))}
        </div>
      ) : (
        <BiText
          as="p"
          en="Itinerary for this season coming soon."
          th="แผนการเดินทางฤดูนี้จะประกาศเร็วๆ นี้"
          className="text-sm text-ink-soft"
          thClassName="mt-0.5 block font-thai text-xs text-ink-soft"
        />
      )}
    </section>
  )
}
