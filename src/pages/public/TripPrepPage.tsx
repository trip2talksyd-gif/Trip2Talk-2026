import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, Luggage, ShieldAlert } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  BAGGAGE_INFO,
  JETSTAR_RESTRICTIONS,
  SAFETY_WARNINGS,
} from '../../data/risks'
import { getPackingGuide } from '../../data/packingGuides'
import { listFor } from '../../data/tripDetails'

export default function TripPrepPage() {
  const { tripCode } = useParams<{ tripCode: string }>()
  const { lang } = useLang()
  const code = tripCode?.toUpperCase() ?? ''
  const baggage = BAGGAGE_INFO[lang]
  const jetstar = JETSTAR_RESTRICTIONS[lang]
  const safety = SAFETY_WARNINGS[code]
  const packing = getPackingGuide(code)

  return (
    <div className="space-y-6 pb-6">
      <Link
        to={`/trips/${code}`}
        className="inline-flex items-center gap-1 text-sm text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        {lang === 'th' ? 'กลับหน้าทริป' : 'Back to trip'}
      </Link>

      <header>
        <h1 className="font-serif text-2xl text-ink">
          {lang === 'th' ? 'เตรียมตัวก่อนเดินทาง' : 'Trip Preparation'}
        </h1>
        <p className="mt-1 font-mono text-xs text-ink-soft">{code}</p>
      </header>

      {/* Baggage */}
      <section className="rounded-editorial border border-teal-600/30 bg-teal-500/10 p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-editorial bg-teal-500/20">
            <Luggage className="h-5 w-5 text-teal-800" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-ink">{baggage.title}</h2>
            <p className="mt-2 text-sm font-medium text-ink">{baggage.checked}</p>
            <p className="text-sm text-ink">{baggage.carryOn}</p>
            <p className="mt-2 text-xs text-ink-soft">{baggage.airline}</p>
          </div>
        </div>
      </section>

      {/* Jetstar restrictions — coral warning */}
      <section className="rounded-editorial border border-coral/40 bg-coral/10 p-4">
        <div className="flex gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-coral" />
          <div>
            <h2 className="font-serif text-base font-semibold text-ink">{jetstar.title}</h2>
            <ul className="mt-3 space-y-2">
              {jetstar.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink">
                  <span className="text-coral">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Location cautions — amber/gold */}
      {safety && (
        <section className="rounded-editorial border border-coral/40 bg-coral/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber" />
            <div>
              <h2 className="font-serif text-base font-semibold text-ink">
                {lang === 'th' ? 'ข้อควรระวังเฉพาะทริป' : 'Location-specific cautions'}
              </h2>
              <ul className="mt-3 space-y-2">
                {(lang === 'th' ? safety.th : safety.en).map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink">
                    <span className="text-amber">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Packing guide */}
      <section>
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'คู่มือจัดกระเป๋า' : 'Packing guide'}
        </h2>
        <div className="mt-4 space-y-4">
          {packing.groups.map((group) => {
            const title = lang === 'th' ? group.title.th : group.title.en
            const items = listFor(group.items, lang)
            return (
              <div
                key={group.key}
                className="rounded-editorial border border-line bg-white p-4"
              >
                <h3 className="text-sm font-medium text-ink">{title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-ink/80">
                      <span className="text-teal-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
