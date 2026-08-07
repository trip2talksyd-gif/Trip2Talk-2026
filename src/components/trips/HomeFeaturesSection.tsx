import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import BiText from '../ui/BiText'
import SplitFlapPrice from '../ui/SplitFlapPrice'

const HERO_MEDIA =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/VDO/Uluru.mp4'

const BASE_PRICE = 1390
const PRIVATE_ADDON = 500

/** Homepage features + private-trip pricing — teal/cream/peach (mockup), not black+lime. */
export default function HomeFeaturesSection() {
  const { t, tt } = useLang()
  const [privateOn, setPrivateOn] = useState(true)
  const [videoOk, setVideoOk] = useState(true)
  const total = BASE_PRICE + (privateOn ? PRIVATE_ADDON : 0)

  const features = [
    t('home.features.list.1'),
    t('home.features.list.2'),
    t('home.features.list.3'),
    t('home.features.list.4'),
  ]

  const title = tt('home.features.title')
  const toggleTitle = tt('home.features.toggle.title')
  const toggleDesc = tt('home.features.toggle.desc')
  const cta = tt('home.features.cta')
  const footerTitle = tt('home.features.footer.title')
  const footerSub = tt('home.features.footer.sub')

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-cream px-4 py-10 sm:px-6 sm:py-12 md:px-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-line bg-card shadow-mockup">
        <div className="relative px-5 pt-6 sm:px-8 sm:pt-8 md:px-10">
          <BiText
            as="h2"
            en={title.en}
            th={title.th}
            serif
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-[40px]"
            thClassName="mt-1 block font-thai text-base font-medium text-teal-700 sm:text-lg"
          />

          <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl bg-teal-900 sm:mt-6 sm:aspect-[21/9] md:rounded-3xl">
            {videoOk ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={HERO_MEDIA}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoOk(false)}
              />
            ) : null}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22,38,43,.35) 0%, transparent 45%, rgba(22,38,43,.55) 100%)',
              }}
              aria-hidden
            />
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8">
          <div className="grid gap-4 rounded-2xl border border-line bg-mint-100/80 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.9fr_1.2fr] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-line">
            <div className="flex flex-col justify-between rounded-xl bg-card p-4 sm:p-5 lg:rounded-none lg:bg-transparent lg:pr-6">
              <div>
                <BiText
                  as="p"
                  en={toggleTitle.en}
                  th={toggleTitle.th}
                  className="text-[15px] font-semibold text-ink sm:text-base"
                  thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
                />
                <BiText
                  as="p"
                  en={toggleDesc.en}
                  th={toggleDesc.th}
                  className="mt-2 text-[13px] leading-relaxed text-ink-soft"
                  thClassName="mt-1 block font-thai text-[11px] text-ink-soft/85"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-baseline gap-0.5 text-sm font-medium text-teal-700">
                  +
                  <SplitFlapPrice
                    amountAud={PRIVATE_ADDON}
                    board
                    className="text-sm font-semibold leading-none text-teal-700"
                  />
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={privateOn}
                  aria-label={toggleTitle.en}
                  onClick={() => setPrivateOn((v) => !v)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                    privateOn
                      ? 'bg-gradient-to-b from-teal-400 to-teal-600'
                      : 'bg-line'
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

            <div className="flex flex-col items-start justify-center px-1 py-2 lg:px-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <SplitFlapPrice
                  amountAud={total}
                  board
                  className="text-3xl font-semibold leading-none tracking-tight text-ink sm:text-4xl md:text-[40px]"
                />
                <span className="text-lg font-normal text-ink-soft sm:text-xl">
                  {t('home.features.price.unit')}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                {privateOn ? t('home.features.price.notePrivate') : t('home.features.price.note')}
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 px-1 py-1 lg:pl-6">
              <ul className="space-y-2">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-ink">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"
                      strokeWidth={2.5}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink-soft">{t('home.features.duration')}</span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/trips"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-teal-400 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_1px_0_rgba(255,255,255,.45)_inset,0_8px_16px_-6px_rgba(50,25,8,.45)]"
                  >
                    {cta.en}
                    <span className="ml-1.5 font-thai text-[10px] font-medium opacity-90">
                      {cta.th}
                    </span>
                  </Link>
                  <Link
                    to="/booking"
                    aria-label={cta.en}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-900 text-cream"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-mint-100/50 px-5 py-4 sm:px-8 md:px-10">
          <BiText
            as="p"
            en={footerTitle.en}
            th={footerTitle.th}
            className="text-base font-semibold text-ink sm:text-lg"
            thClassName="mt-0.5 block font-thai text-sm font-medium text-ink-soft"
          />
          <BiText
            as="p"
            en={footerSub.en}
            th={footerSub.th}
            className="mt-0.5 text-xs text-ink-soft sm:text-sm"
            thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft/85"
          />
        </div>
      </div>
    </section>
  )
}
