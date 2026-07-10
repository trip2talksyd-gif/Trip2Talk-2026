import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

const HERO_MEDIA =
  'https://xwdtjwzjkqunewxjpimm.supabase.co/storage/v1/object/public/trip-photos/VDO/Copy%20of%202026%20t2t%20tripLandscape%20(1).mp4'

const BASE_PRICE = 1390
const PRIVATE_ADDON = 500

function formatPrice(n: number) {
  return `$${n.toLocaleString('en-AU')}`
}

export default function HomeFeaturesSection() {
  const { t } = useLang()
  const [privateOn, setPrivateOn] = useState(true)
  const total = BASE_PRICE + (privateOn ? PRIVATE_ADDON : 0)

  const features = [
    t('home.features.list.1'),
    t('home.features.list.2'),
    t('home.features.list.3'),
    t('home.features.list.4'),
  ]

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-[#0a0a0a] px-4 py-8 font-sans text-white antialiased sm:px-6 sm:py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-[#0c0c0c] shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/8">
        {/* Top heading + hero */}
        <div className="relative px-5 pt-6 sm:px-8 sm:pt-8 md:px-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[44px]">
            {t('home.features.title')}
          </h2>

          <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl sm:mt-6 sm:aspect-[21/9] md:rounded-3xl">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_MEDIA}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </div>
        </div>

        {/* Pricing bar */}
        <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8">
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:p-5 lg:grid-cols-[1.15fr_0.9fr_1.2fr] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-white/10">
            {/* Left — toggle add-on */}
            <div className="flex flex-col justify-between rounded-xl bg-black/40 p-4 sm:p-5 lg:rounded-none lg:bg-transparent lg:pr-6">
              <div>
                <p className="text-[15px] font-semibold text-white sm:text-base">
                  {t('home.features.toggle.title')}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                  {t('home.features.toggle.desc')}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white/80">
                  +{formatPrice(PRIVATE_ADDON)}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={privateOn}
                  aria-label={t('home.features.toggle.title')}
                  onClick={() => setPrivateOn((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                    privateOn ? 'bg-[#c8f542]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                      privateOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Middle — price */}
            <div className="flex flex-col items-start justify-center px-1 py-2 lg:px-6">
              <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[40px]">
                {formatPrice(total)}
                <span className="text-lg font-normal text-white/50 sm:text-xl">
                  {' '}
                  {t('home.features.price.unit')}
                </span>
              </p>
              <p className="mt-1.5 text-sm text-white/45">
                {privateOn ? t('home.features.price.notePrivate') : t('home.features.price.note')}
              </p>
            </div>

            {/* Right — features + CTA */}
            <div className="flex flex-col justify-between gap-4 px-1 py-1 lg:pl-6">
              <ul className="space-y-2">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-white/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c8f542]" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-white/50">{t('home.features.duration')}</span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/trips"
                    className="inline-flex items-center justify-center rounded-full bg-[#c8f542] px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    {t('home.features.cta')}
                  </Link>
                  <Link
                    to="/booking"
                    aria-label={t('home.features.cta')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8f542] text-black transition-opacity hover:opacity-90"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer label */}
        <div className="border-t border-white/8 px-5 py-4 sm:px-8 md:px-10">
          <p className="text-base font-semibold text-white sm:text-lg">
            {t('home.features.footer.title')}
          </p>
          <p className="text-xs text-white/40 sm:text-sm">{t('home.features.footer.sub')}</p>
        </div>
      </div>
    </section>
  )
}
