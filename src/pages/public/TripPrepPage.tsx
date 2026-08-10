import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  Luggage,
  ShieldAlert,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  BAGGAGE_INFO,
  JETSTAR_RESTRICTIONS,
  SAFETY_WARNINGS,
} from '../../data/risks'
import { getPackingGuide, type PackingClimate } from '../../data/packingGuides'
import { getTripVideoUrl } from '../../data/tripVideos'
import { getTripWeatherHub } from '../../data/tripMaps'
import { fetchTourByCode, formatDate } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

type PrepItem = {
  id: string
  groupKey: string
  groupTitle: string
  primary: string
  secondary: string
}

/** Typical seasonal ranges for the weather-card slot (no live forecast API). */
const CLIMATE_WEATHER: Record<
  PackingClimate,
  { range: string; icon: string; noteEn: string; noteTh: string }
> = {
  cold: {
    range: '8–15°C',
    icon: '⛅',
    noteEn: 'Cool — pack layers',
    noteTh: 'อากาศเย็น แนะนำใส่เสื้อหลายชั้น',
  },
  desert: {
    range: '5–35°C',
    icon: '☀️',
    noteEn: 'Hot days, cold nights',
    noteTh: 'กลางวันร้อน กลางคืนหนาว',
  },
  coastal: {
    range: '12–20°C',
    icon: '🌊',
    noteEn: 'Windy & changeable',
    noteTh: 'ลมแรง อากาศเปลี่ยนเร็ว',
  },
  general: {
    range: '15–25°C',
    icon: '⛅',
    noteEn: 'Mild — pack layers',
    noteTh: 'อากาศกำลังดี — เตรียมหลายชั้น',
  },
}

function storageKey(code: string): string {
  return `t2t_prep_${code}`
}

function readPacked(code: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(code))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writePacked(code: string, ids: Set<string>): void {
  try {
    localStorage.setItem(storageKey(code), JSON.stringify([...ids]))
  } catch {
    // Private-mode / quota — the checklist still works for this session.
  }
}

export default function TripPrepPage() {
  const { tripCode } = useParams<{ tripCode: string }>()
  const { lang, t } = useLang()
  const code = tripCode?.toUpperCase() ?? ''
  const baggage = BAGGAGE_INFO[lang]
  const jetstar = JETSTAR_RESTRICTIONS[lang]
  const safety = SAFETY_WARNINGS[code]
  const packing = getPackingGuide(code)
  const videoUrl = getTripVideoUrl(code)
  const weather = CLIMATE_WEATHER[packing.climate]
  const hub = getTripWeatherHub(code, lang)
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    fetchTourByCode(code)
      .then((t) => {
        if (!cancelled) setTour(t)
      })
      .catch(() => {
        if (!cancelled) {
          setTour(null)
          setError(t('common.error'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [code, t])

  if (loading) {
    return (
      <div className="space-y-4 pb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <PageError
        message={error}
        onRetry={() => {
          setLoading(true)
          setError('')
          fetchTourByCode(code)
            .then(setTour)
            .catch(() => setError(t('common.error')))
            .finally(() => setLoading(false))
        }}
      />
    )
  }

  const dateLabel = tour?.departure_date
    ? formatDate(tour.departure_date, lang)
    : ''

  const items: PrepItem[] = packing.groups.flatMap((group) =>
    group.items.en.map((en, i) => {
      const th = group.items.th[i] ?? en
      return {
        id: `${group.key}-${i}`,
        groupKey: group.key,
        groupTitle: lang === 'th' ? group.title.th : group.title.en,
        primary: lang === 'th' ? th : en,
        secondary: lang === 'th' ? en : th,
      }
    }),
  )

  return (
    <div className="pb-6">
      {/* Mockup .flow-top */}
      <header className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <Link
          to={`/trips/${code}`}
          aria-label={lang === 'th' ? 'กลับหน้าทริป' : 'Back to trip'}
          className="back"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        </Link>
        <h1 className="m-0 font-serif text-[15.5px] text-ink sm:text-xl">
          {lang === 'th' ? 'เตรียมตัวก่อนเที่ยว' : 'Trip Prep'}
          <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
            {lang === 'th' ? 'Trip Prep' : 'เตรียมตัวก่อนเที่ยว'}
          </span>
        </h1>
      </header>

      <div className="prep-body mt-3">
        {/* Mockup .prep-guide-banner */}
        <Link to="/photo-guide" className="prep-guide-banner">
          <span className="pgb-ic" aria-hidden>
            📸
          </span>
          <div className="pgb-txt">
            <b>
              {lang === 'th'
                ? 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง'
                : 'Read the Photo Guide before you go'}
            </b>
            <span>
              {lang === 'th'
                ? 'Posing · camera settings · phone tips'
                : 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง'}
            </span>
          </div>
          <span className="pgb-arrow" aria-hidden>
            →
          </span>
        </Link>

        <PrepChecklist
          key={code}
          code={code}
          items={items}
          climateCard={
            <div className="weather-card">
              <div className="min-w-0">
                <b>{weather.range}</b>
                <span>
                  {hub}
                  {dateLabel ? ` · ${dateLabel}` : ''}
                  <span
                    className="th"
                    style={{ display: 'block', fontFamily: 'var(--font-th)' }}
                  >
                    {lang === 'th' ? weather.noteTh : weather.noteEn}
                  </span>
                </span>
              </div>
              <span className="weather-ic" aria-hidden>
                {weather.icon}
              </span>
            </div>
          }
        />

        {videoUrl && (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="aspect-video w-full rounded-2xl border border-line bg-black object-cover"
          />
        )}

        <PrepAccordion
          icon={<Luggage className="h-4 w-4 text-teal-800" strokeWidth={2.25} />}
          title={baggage.title}
        >
          <p className="text-sm font-medium text-ink">{baggage.checked}</p>
          <p className="text-sm text-ink">{baggage.carryOn}</p>
          <p className="mt-2 text-xs text-ink-soft">{baggage.airline}</p>
        </PrepAccordion>

        <PrepAccordion
          icon={<ShieldAlert className="h-4 w-4 text-coral" strokeWidth={2.25} />}
          title={jetstar.title}
        >
          <ul className="space-y-2">
            {jetstar.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-ink">
                <span className="text-coral">·</span>
                {item}
              </li>
            ))}
          </ul>
        </PrepAccordion>

        {safety && (
          <PrepAccordion
            icon={<AlertTriangle className="h-4 w-4 text-amber" strokeWidth={2.25} />}
            title={lang === 'th' ? 'ข้อควรระวังเฉพาะทริป' : 'Location-specific cautions'}
          >
            <ul className="space-y-2">
              {(lang === 'th' ? safety.th : safety.en).map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink">
                  <span className="text-amber">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </PrepAccordion>
        )}
      </div>
    </div>
  )
}

function PrepChecklist({
  code,
  items,
  climateCard,
}: {
  code: string
  items: PrepItem[]
  climateCard: ReactNode
}) {
  const { lang } = useLang()
  const [packed, setPacked] = useState<Set<string>>(() => readPacked(code))

  function togglePacked(id: string) {
    const next = new Set(packed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setPacked(next)
    writePacked(code, next)
  }

  const packedCount = items.filter((item) => packed.has(item.id)).length
  const percent = items.length === 0 ? 0 : Math.round((packedCount / items.length) * 100)

  return (
    <>
      <div>
        <div
          className="mb-[5px] flex justify-between text-[10px] text-ink-soft"
          style={{ fontSize: 10, color: 'var(--ink-soft)' }}
        >
          <span>
            {lang === 'th'
              ? `เก็บแล้ว ${packedCount}/${items.length}`
              : `${packedCount} of ${items.length} packed`}
            <span className="th" style={{ fontFamily: 'var(--font-th)' }}>
              {lang === 'th'
                ? ` · ${packedCount} of ${items.length} packed`
                : ` · เก็บแล้ว ${packedCount}/${items.length}`}
            </span>
          </span>
          <span>{percent}%</span>
        </div>
        <div
          className="prep-progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      {climateCard}

      {items.map((item) => {
        const done = packed.has(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => togglePacked(item.id)}
            aria-pressed={done}
            className={`prep-item${done ? ' done' : ''}`}
          >
            <span className="cb" aria-hidden>
              {done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
            </span>
            <div>
              <b>{item.primary}</b>
              <span>{item.secondary}</span>
            </div>
          </button>
        )
      })}
    </>
  )
}

/** Collapsible info card — baggage / Jetstar / safety kept below the checklist. */
function PrepAccordion({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <details className="group rounded-xl border border-line bg-card px-3 py-2.5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-mint-100">
          {icon}
        </span>
        <b className="min-w-0 flex-1 text-[11.5px] font-semibold text-ink">{title}</b>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          strokeWidth={2.25}
        />
      </summary>
      <div className="mt-2.5 border-t border-line pt-2.5">{children}</div>
    </details>
  )
}
