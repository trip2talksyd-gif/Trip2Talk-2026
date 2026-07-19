import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

const FAQ_KEYS = [
  { q: 'home.faq.q1' as const, a: 'home.faq.a1' as const },
  { q: 'home.faq.q2' as const, a: 'home.faq.a2' as const },
  { q: 'home.faq.q3' as const, a: 'home.faq.a3' as const },
  { q: 'home.faq.q4' as const, a: 'home.faq.a4' as const },
  { q: 'home.faq.q5' as const, a: 'home.faq.a5' as const },
  { q: 'home.faq.q6' as const, a: 'home.faq.a6' as const },
]

export default function HomeCtaFaq() {
  const { t } = useLang()
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  function toggle(i: number) {
    setActiveIndex((current) => (current === i ? null : i))
  }

  return (
    <section className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-[1.4fr_1fr]">
      {/* Animated gradient CTA card */}
      <div
        className="hero-cta-gradient flex flex-col items-center justify-center rounded-editorial px-8 py-16 text-center text-white"
        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
      >
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
          {t('home.cta.title.line1')}
          <br />
          {t('home.cta.title.line2')}
        </h2>
        <p className="mt-3 text-sm opacity-90">{t('home.cta.subtitle')}</p>
        <Link to="/trips" className="btn-primary mt-7 !bg-cream !text-ink">
          {t('btn.bookNow')}
        </Link>
      </div>

      {/* FAQ accordion */}
      <div className="flex flex-col justify-center gap-3">
        {FAQ_KEYS.map(({ q, a }, i) => {
          const isActive = activeIndex === i
          return (
            <div
              key={q}
              onClick={() => toggle(i)}
              className={`group cursor-pointer overflow-hidden rounded-editorial border bg-white transition-all duration-300 ${
                isActive
                  ? 'border-teal-500/50 shadow-[0_8px_20px_rgba(233,149,90,0.15)]'
                  : 'border-teal-900/8 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:border-teal-900/20 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span
                  className={`shrink-0 font-serif text-xs transition-colors duration-300 ${
                    isActive ? 'text-teal-500' : 'text-ink/25'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`flex-1 text-sm transition-colors duration-300 ${
                    isActive ? 'font-medium text-ink' : 'text-ink/80'
                  }`}
                >
                  {t(q)}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-teal-500 text-ink'
                      : 'bg-teal-900/5 text-ink/40 group-hover:bg-teal-900/10'
                  }`}
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
                  />
                </span>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 pl-11 text-sm leading-relaxed text-ink/60">{t(a)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
