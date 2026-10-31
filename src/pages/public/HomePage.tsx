/**
 * Homepage v7 — sells the experience of travelling with a real photographer.
 * Approved mockup: docs/mockups/homepage-v7 (cream + deep green, mobile-first).
 * The photo-spot discovery map that used to live here is now at /discover.
 */
import { useEffect } from 'react'
import { Play } from 'lucide-react'
import HeroVideo from '../../components/home/HeroVideo'
import {
  DaySection,
  FinalSection,
  FollowSection,
  GallerySection,
  HiTitle,
  ReelsSection,
  SaenSection,
  TripsSection,
  WhySection,
} from '../../components/home/HomeV7Sections'
import { useBi, useHomeTours } from '../../components/home/homeV7Hooks'
import { HOME_HERO } from '../../data/homeContent'
import { useLang } from '../../hooks/useLang'

function HomeHero() {
  const pick = useBi()
  const { lang } = useLang()
  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden bg-teal-dark text-cream sm:-mx-6 lg:-mx-10">
      <div className="relative grid min-h-[min(88svh,780px)] grid-cols-1 grid-rows-1">
        <div className="relative col-start-1 row-start-1 overflow-hidden">
          <HeroVideo />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(18,47,42,.15) 0%, rgba(18,47,42,.25) 35%, rgba(18,47,42,.82) 75%, rgba(18,47,42,.96) 100%)',
            }}
            aria-hidden
          />
        </div>

        <div className="relative z-10 col-start-1 row-start-1 flex items-end">
          <div className="mx-auto w-full max-w-[1180px] px-5 pb-9 pt-28 sm:px-6 lg:px-10 lg:pb-14">
            <p
              lang={lang}
              className={`inline-flex items-center gap-2 rounded-full border border-cream/30 bg-teal-dark/55 px-3.5 py-1.5 text-[13px] backdrop-blur ${
                lang === 'th' ? 'font-thai' : 'font-display'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#ff4d3d] shadow-[0_0_0_4px_rgba(255,77,61,.2)]" aria-hidden />
              {pick(HOME_HERO.pill)}
            </p>

            <div className="max-w-[720px]">
              <HiTitle h={HOME_HERO.heading} as="h1" tone="dark" size="hero" />
            </div>

            <p
              lang={lang}
              className={`mt-4 max-w-[44ch] text-[16.5px] leading-relaxed text-cream/85 ${lang === 'th' ? 'font-thai' : ''}`}
            >
              {pick(HOME_HERO.sub)}
            </p>

            <div className="mt-6 grid max-w-[520px] gap-2.5 sm:grid-cols-2">
              <a href="#trips" className="home-btn-primary">
                {pick(HOME_HERO.ctaTrips)}
              </a>
              <a href="#reel" className="home-btn-ghost-dark">
                <Play className="h-4 w-4 fill-current" aria-hidden />
                {pick(HOME_HERO.ctaReel)}
              </a>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {HOME_HERO.pillars.map((p) => (
                <li
                  key={p.hi.en}
                  lang={lang}
                  className={`rounded-full border border-cream/30 bg-teal-dark/35 px-3 py-1.5 text-[13.5px] text-cream/85 ${
                    lang === 'th' ? 'font-thai' : ''
                  }`}
                >
                  <b className="font-semibold text-orange-soft">{pick(p.hi)}</b> {pick(p.rest)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { tours, failed } = useHomeTours()

  useEffect(() => {
    document.title = 'Trip2Talk — Photo Trips with a Real Photographer'
    const canonical = document.querySelector("link[rel='canonical']")
    if (canonical) canonical.setAttribute('href', 'https://trip2talk.com.au/')
    const ogUrl = document.querySelector("meta[property='og:url']")
    if (ogUrl) ogUrl.setAttribute('content', 'https://trip2talk.com.au/')
  }, [])

  return (
    <div className="bg-cream-app text-ink">
      <HomeHero />
      <WhySection />
      <DaySection />
      <SaenSection openTrips={tours ? tours.length : null} />
      <GallerySection />
      <ReelsSection />
      <TripsSection tours={tours} failed={failed} />
      <FollowSection />
      <FinalSection />
    </div>
  )
}
