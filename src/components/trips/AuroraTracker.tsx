import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

const NOAA_KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'

// TODO: wire up OpenWeatherMap or similar once API key is available
const MOCK_WEATHER = {
  cloudCover: 42,
  moonPhase: 8,
  moonLabel: { en: 'Waning gibbous — good for Milky Way', th: 'แรม 8 ค่ำ — เหมาะล่าทางช้างเผือก' },
}

type KpState = { value: number | null; error: boolean; loading: boolean }

async function fetchLatestKp(): Promise<number | null> {
  const res = await fetch(NOAA_KP_URL)
  if (!res.ok) throw new Error('KP fetch failed')
  const rows: string[][] = await res.json()
  const dataRows = rows.filter((r) => r[0] && /^\d{4}-\d{2}-\d{2}/.test(r[0]))
  if (dataRows.length === 0) return null
  const latest = dataRows[dataRows.length - 1]
  const kp = parseFloat(latest[1])
  return Number.isFinite(kp) ? kp : null
}

export default function AuroraTracker() {
  const { lang, t } = useLang()
  const [kp, setKp] = useState<KpState>({ value: null, error: false, loading: true })

  useEffect(() => {
    let cancelled = false
    fetchLatestKp()
      .then((value) => {
        if (!cancelled) setKp({ value, error: false, loading: false })
      })
      .catch(() => {
        if (!cancelled) setKp({ value: null, error: true, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const moonLabel = lang === 'th' ? MOCK_WEATHER.moonLabel.th : MOCK_WEATHER.moonLabel.en

  return (
    <section className="relative overflow-hidden rounded-editorial border border-teal-700/40 bg-teal-900 p-5 starfield">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-900/40 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h2 className="font-serif text-sm font-semibold text-cream">
            {lang === 'th' ? 'ดัชนีแสงใต้ & สภาพท้องฟ้า' : 'Aurora & sky conditions'}
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-cream/70">KP Index</p>
            {kp.loading ? (
              <p className="mt-1 font-serif text-2xl text-cream/70">…</p>
            ) : kp.error ? (
              <p className="mt-1 text-xs text-cream/70">
                {lang === 'th' ? 'ไม่สามารถโหลดข้อมูลได้ขณะนี้' : 'Unable to load data'}
              </p>
            ) : (
              <p className="mt-1 font-serif text-2xl text-gold">{kp.value?.toFixed(1) ?? '—'}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-cream/70">
              {lang === 'th' ? 'เมฆ' : 'Clouds'}
            </p>
            <p className="mt-1 font-serif text-2xl text-cream">{MOCK_WEATHER.cloudCover}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-cream/70">
              {lang === 'th' ? 'ดวงจันทร์' : 'Moon'}
            </p>
            <p className="mt-1 font-serif text-2xl text-cream">{MOCK_WEATHER.moonPhase}%</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-cream/70">{moonLabel}</p>
        <p className="mt-3 text-[10px] leading-relaxed text-cream/70/80">
          {lang === 'th'
            ? 'KP: NOAA Space Weather · เมฆ/ดวงจันทร์: ข้อมูลตัวอย่าง (รอ API) · แสงใต้เป็นปรากฏการณ์ธรรมชาติ ไม่รับประกันการมองเห็น'
            : 'KP: NOAA Space Weather · Cloud/moon: placeholder (API pending) · Aurora is a natural phenomenon — sightings not guaranteed'}
        </p>
        <p className="sr-only">{t('common.aurora')}</p>
      </div>
    </section>
  )
}
