import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import TripTypeCategories from '../../components/trips/TripTypeCategories'
import HomeFeaturesSection from '../../components/trips/HomeFeaturesSection'
import HomeCtaFaq from '../../components/trips/HomeCtaFaq'

const HERO_VIDEO_URL =
  'https://xwdtjwzjkqunewxjpimm.supabase.co/storage/v1/object/public/trip-photos/VDO/t2t%20herocover.mp4'

export default function HomePage() {
  const { t } = useLang()

  const stats = [
    { value: '13', label: t('home.stats.trips') },
    { value: '6', label: t('home.stats.group') },
    { value: '10+', label: t('home.stats.photographers') },
  ]

  return (
    <div className="-mx-4 space-y-0">
      {/* Cinematic hero */}
      <section className="relative h-[78svh] min-h-[520px] w-full overflow-hidden bg-teal-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
        />

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/70 via-teal-900/20 to-teal-900/90" />

        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
          <p className="font-instrument-italic text-sm tracking-wide text-teal-400">Trip2Talk</p>

          <div className="liquid-glass mt-5 rounded-full px-4 py-2">
            <p className="text-[11px] text-cream/90 sm:text-xs">{t('home.hero.badge')}</p>
          </div>

          <h1 className="mt-6 font-serif text-3xl leading-snug text-cream sm:text-4xl">
            {t('home.hero.title.line1')}
            <br />
            <em className="text-teal-400 not-italic">{t('home.hero.title.line2')}</em>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/65">
            {t('home.hero.subtitle')}
          </p>

          <div className="liquid-glass mt-7 flex items-center gap-1 rounded-full p-1.5">
            <Link to="/trips" className="btn-primary !py-2.5">
              {t('btn.bookNow')}
            </Link>
            <Link to="/gallery" className="btn-ghost !border-white/25 !py-2.5">
              {t('nav.gallery')}
            </Link>
          </div>
        </div>
      </section>

      <TripTypeCategories />

      {/* Stats strip */}
      <section className="grid grid-cols-3 divide-x divide-white/8 bg-teal-900 px-2 py-5">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-2 text-center">
            <p className="font-serif text-2xl text-teal-400">{value}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-cream/65">
              {label}
            </p>
          </div>
        ))}
      </section>

      <HomeFeaturesSection />

      <div className="space-y-10 bg-cream px-4 py-10 text-ink">
        <HomeCtaFaq />
      </div>
    </div>
  )
}
