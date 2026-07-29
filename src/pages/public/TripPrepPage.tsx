import { useState, type ReactNode } from 'react'
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
import { tourDestinationLabel } from '../../lib/tourDisplay'

type PrepItem = {
  id: string
  groupKey: string
  groupTitle: string
  primary: string
  secondary: string
}

/** Climate advisory shown in the mockup's .weather-card slot. Trip2Talk has no
 *  forecast feed, so this is packing advice per climate — never invented temps. */
const CLIMATE_CARD: Record<
  PackingClimate,
  { icon: string; en: { title: string; note: string }; th: { title: string; note: string } }
> = {
  cold: {
    icon: '❄️',
    en: { title: 'Cold & changeable', note: 'Thermal base layers + waterproof shell. Summits can sit near freezing.' },
    th: { title: 'อากาศเย็น เปลี่ยนเร็ว', note: 'ใส่ thermal ชั้นในและเสื้อกันน้ำ ยอดเขาอาจใกล้ 0°C' },
  },
  desert: {
    icon: '☀️',
    en: { title: 'Hot days, cold nights', note: 'SPF 50+, 3L water a day, and warm layers after sunset.' },
    th: { title: 'กลางวันร้อน กลางคืนหนาว', note: 'ครีมกันแดด SPF 50+ น้ำ 3 ลิตร/วัน และเสื้อกันหนาวหลังพระอาทิตย์ตก' },
  },
  coastal: {
    icon: '🌊',
    en: { title: 'Windy & wet coast', note: 'Windbreaker, quick-dry clothes, non-slip shoes on wet rocks.' },
    th: { title: 'ชายฝั่ง ลมแรงและชื้น', note: 'เสื้อกันลม เสื้อผ้าแห้งเร็ว รองเท้ากันลื่นสำหรับหินเปียก' },
  },
  general: {
    icon: '⛅',
    en: { title: 'Mild — pack layers', note: 'Comfortable shoes, a light rain jacket, sun hat and sunglasses.' },
    th: { title: 'อากาศกำลังดี — เตรียมหลายชั้น', note: 'รองเท้าใส่สบาย เสื้อกันฝนบาง หมวกและแว่นกันแดด' },
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
  const { lang } = useLang()
  const code = tripCode?.toUpperCase() ?? ''
  const baggage = BAGGAGE_INFO[lang]
  const jetstar = JETSTAR_RESTRICTIONS[lang]
  const safety = SAFETY_WARNINGS[code]
  const packing = getPackingGuide(code)
  const videoUrl = getTripVideoUrl(code)
  const climate = CLIMATE_CARD[packing.climate]
  const climateCopy = lang === 'th' ? climate.th : climate.en

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
    <div className="space-y-3 pb-6">
      {/* Mockup .flow-top */}
      <header className="-mx-4 flex items-center gap-2.5 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <Link
          to={`/trips/${code}`}
          aria-label={lang === 'th' ? 'กลับหน้าทริป' : 'Back to trip'}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-teal-700"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-serif text-[15.5px] text-ink sm:text-xl">
            {lang === 'th' ? 'เตรียมตัวก่อนเที่ยว' : 'Trip Prep'}
          </h1>
          <p className="font-mono text-[10px] text-ink-soft">
            {code} · {tourDestinationLabel(code, lang)}
          </p>
        </div>
      </header>

      {/* Mockup .prep-guide-banner */}
      <Link
        to="/photo-guide"
        className="flex items-center gap-2.5 rounded-xl border border-line bg-mint-100 px-3 py-2.5"
      >
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-white text-sm shadow-[0_4px_10px_-4px_rgba(15,28,30,0.25)]">
          📸
        </span>
        <span className="min-w-0 flex-1 leading-[1.3]">
          <b className="block text-[10.5px] text-ink">
            {lang === 'th'
              ? 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง'
              : 'Read the Photo Guide before you go'}
          </b>
          <span className="block font-thai text-[9px] text-ink-soft">
            {lang === 'th'
              ? 'ท่าโพส · ตั้งค่ากล้อง · มือถือ'
              : 'Posing · camera settings · phone tips'}
          </span>
        </span>
        <span className="text-xs text-teal-700">→</span>
      </Link>

      {/* Mockup .prep-progress + .prep-item list. Keyed by trip code so the
          ticked items reset when you switch trips without an extra effect. */}
      <PrepChecklist
        key={code}
        code={code}
        items={items}
        climateCard={
          /* Mockup .weather-card — climate advice, not a forecast */
          <div className="flex items-center justify-between gap-3 rounded-[14px] bg-gradient-to-br from-teal-900 to-teal-700 px-3.5 py-3 text-cream">
            <div className="min-w-0">
              <b className="block text-base">{climateCopy.title}</b>
              <span className="block text-[9.5px] leading-relaxed text-mint-200">
                {tourDestinationLabel(code, lang)} · {climateCopy.note}
              </span>
            </div>
            <span className="shrink-0 text-[22px]" aria-hidden>
              {climate.icon}
            </span>
          </div>
        }
      />

      {/* Trip video — only renders when a video has been uploaded for this destination */}
      {videoUrl && (
        <video
          key={videoUrl}
          src={videoUrl}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="aspect-video w-full rounded-2xl border border-line bg-black object-cover"
        />
      )}

      {/* Flights, baggage and safety detail — kept in full, collapsed under the checklist */}
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
  const groupKeys = [...new Set(items.map((item) => item.groupKey))]

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-[5px] flex justify-between text-[10px] text-ink-soft">
          <span>
            {lang === 'th'
              ? `เก็บแล้ว ${packedCount}/${items.length}`
              : `${packedCount} of ${items.length} packed`}
          </span>
          <span>{percent}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-mint-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="block h-full bg-gradient-to-r from-teal-500 to-teal-800 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {climateCard}

      {groupKeys.map((key) => {
        const groupItems = items.filter((item) => item.groupKey === key)
        return (
          <section key={key} className="space-y-2">
            <h2 className="pt-1 text-[10px] font-bold uppercase tracking-[0.05em] text-ink-soft">
              {groupItems[0].groupTitle}
            </h2>
            {groupItems.map((item) => {
              const done = packed.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePacked(item.id)}
                  aria-pressed={done}
                  className="flex w-full items-center gap-2.5 rounded-[11px] border border-line bg-card px-3 py-2.5 text-left"
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${
                      done ? 'border-teal-700 bg-teal-700 text-cream' : 'border-line'
                    }`}
                  >
                    {done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <b
                      className={`block text-[11px] font-semibold ${
                        done ? 'text-ink-soft line-through' : 'text-ink'
                      }`}
                    >
                      {item.primary}
                    </b>
                    <span className="block font-thai text-[9px] text-ink-soft">
                      {item.secondary}
                    </span>
                  </span>
                </button>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}

/** Collapsible info card — mockup .acct-menu-item row that opens in place. */
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
