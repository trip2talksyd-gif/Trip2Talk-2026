import { Link } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import CountUpStat from '../../components/ui/CountUpStat'
import TripTypeCategories from '../../components/trips/TripTypeCategories'
import HomeFeaturesSection from '../../components/trips/HomeFeaturesSection'
import HomeCtaFaq from '../../components/trips/HomeCtaFaq'

/** Existing Trip2Talk hero reel in public storage */
const HERO_VIDEO_URL =
  'https://xwdtjwzjkqunewxjpimm.supabase.co/storage/v1/object/public/trip-photos/VDO/t2t%20herocover.mp4'

export default function HomePage() {
  const { t } = useLang()

  return (
    <div className="-mx-4 space-y-0">
      {/* Full-bleed cinematic hero */}
      <section className="relative flex min-h-[92svh] w-full flex-col overflow-hidden bg-teal-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster=""
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-teal-900/75 via-teal-900/35 to-teal-900/95"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 pb-10 pt-16 text-center">
          <p className="font-instrument-italic text-sm tracking-[0.08em] text-teal-400">
            Trip2Talk
          </p>

          {/* EN primary + TH secondary — both always visible */}
          <h1 className="mt-5 max-w-lg">
            <span className="block font-serif text-[2rem] leading-[1.15] tracking-tight text-cream sm:text-5xl">
              {t('home.hero.en.line1')}
              <br />
              <span className="font-instrument-italic text-teal-400">{t('home.hero.en.line2')}</span>
            </span>
            <span className="mt-3 block font-thai text-base font-medium leading-snug text-cream/75 sm:text-lg">
              {t('home.hero.th.line1')}
              <br />
              {t('home.hero.th.line2')}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/60">
            {t('home.hero.subtitle')}
          </p>

          {/* Embossed CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/trips" className="btn-embossed">
              {t('btn.bookNow')}
            </Link>
            <Link to="/gallery" className="btn-embossed-ghost">
              {t('nav.gallery')}
            </Link>
          </div>

          {/* Stat counters under CTAs */}
          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-2">
            <div className="rounded-editorial bg-black/25 px-2 py-3 backdrop-blur-sm">
              <p className="font-serif text-2xl text-teal-400 sm:text-3xl">
                <CountUpStat end={13} />
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-cream/55">
                {t('home.stats.tripsLabel')}
              </p>
            </div>
            <div className="rounded-editorial bg-black/25 px-2 py-3 backdrop-blur-sm">
              <p className="font-serif text-2xl text-teal-400 sm:text-3xl">
                <CountUpStat end={6} />
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-cream/55">
                {t('home.stats.groupLabel')}
              </p>
            </div>
            <div className="rounded-editorial bg-black/25 px-2 py-3 backdrop-blur-sm">
              <p className="font-serif text-2xl text-teal-400 sm:text-3xl">
                <CountUpStat end={10} suffix="+" />
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-cream/55">
                {t('home.stats.photographersLabel')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Guide promo — stub target until Phase 4 */}
      <Link
        to="/photo-guide"
        className="group flex items-center gap-3 border-y border-teal-800 bg-teal-800 px-4 py-3.5 transition-colors hover:bg-teal-700"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/25 text-teal-400">
          <Camera className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-teal-400">
            {t('home.promo.eyebrow')}
          </span>
          <span className="mt-0.5 block text-sm text-cream">{t('home.promo.title')}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-cream/50 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-400" />
      </Link>

      <TripTypeCategories />
      <HomeFeaturesSection />
      <div className="space-y-10 bg-cream px-4 py-10 text-ink">
        <HomeCtaFaq />
      </div>
    </div>
  )
}
