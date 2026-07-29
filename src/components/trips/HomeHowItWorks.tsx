import { useState } from 'react'
import { Check, MapPin, ShieldCheck, Users } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

const STEPS = [
  { icon: MapPin, titleKey: 'home.how.step1.title', descKey: 'home.how.step1.desc' },
  { icon: ShieldCheck, titleKey: 'home.how.step2.title', descKey: 'home.how.step2.desc' },
  { icon: Users, titleKey: 'home.how.step3.title', descKey: 'home.how.step3.desc' },
] as const

/** "See it in action" section — 3-step process list + a simple static phone
 * mockup. The mock screen shows a real trip (Tasmania Heritage & Aurora) with
 * generic status copy — no fabricated customer name/testimonial. */
export default function HomeHowItWorks() {
  const { t, lang } = useLang()
  const [active, setActive] = useState(0)

  return (
    <section className="bg-cream px-4 py-10 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-serif text-2xl sm:text-3xl">{t('home.how.title')}</h2>
        <p className="mt-1.5 max-w-md text-sm text-ink-soft">{t('home.how.subtitle')}</p>

        <div className="mt-7 grid gap-8 md:grid-cols-2 md:items-center">
          <ol className="space-y-1">
            {STEPS.map((step, i) => {
              const isActive = active === i
              return (
                <li key={step.titleKey}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={`w-full rounded-editorial border-l-2 px-4 py-3.5 text-left transition-colors duration-200 ${
                      isActive
                        ? 'border-teal-600 bg-mint-100/70'
                        : 'border-transparent hover:bg-mint-100/30'
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-ink-soft'}`}
                    >
                      {i + 1}. {t(step.titleKey)}
                    </p>
                    {isActive && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                        {t(step.descKey)}
                      </p>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>

          {/* Simple static phone frame — real trip, generic status only */}
          <div className="mx-auto w-full max-w-[260px]">
            <div className="rounded-[28px] border border-line bg-white p-2 shadow-[0_20px_60px_-20px_rgba(22,38,43,0.35)]">
              <div className="rounded-[20px] bg-mint-100/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  TAS-3D2N
                </p>
                <p className="mt-1 font-serif text-base text-ink">
                  {lang === 'th' ? 'แทสเมเนีย เฮอริเทจ & ออโรร่า' : 'Tasmania Heritage & Aurora'}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal-900 px-3 py-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-mint-200" strokeWidth={2.5} />
                  <span className="text-[11px] font-semibold text-cream">
                    {t('home.how.mock.status')}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-[10.5px] text-ink-soft">
                  <p>{lang === 'th' ? 'ทริป · Tasmania' : 'Trip · Tasmania'}</p>
                  <p>{lang === 'th' ? 'กลุ่มเล็ก · ช่างภาพมืออาชีพ' : 'Small group · pro photographer'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
