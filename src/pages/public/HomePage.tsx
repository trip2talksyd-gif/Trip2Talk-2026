import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import CountUpStat from '../../components/ui/CountUpStat'
import TripTypeCategories from '../../components/trips/TripTypeCategories'
import HomeHowItWorks from '../../components/trips/HomeHowItWorks'
import HomeFeaturesSection from '../../components/trips/HomeFeaturesSection'
import HomeTripShowcase from '../../components/trips/HomeTripShowcase'
import HomeCtaFaq from '../../components/trips/HomeCtaFaq'
import { fetchConfirmedTours } from '../../lib/toursApi'
import { heroDestinationBlurbs, uniqueTourDestinations } from '../../lib/tourDisplay'

/** Trip2Talk hero reel — main Supabase project `bljhnelgmkulxwuhedbi` only (never the stale xwdtjwzjkqunewxjpimm ref). */
const HERO_VIDEO_URL =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/VDO/Tasmania_cover.mp4'

export default function HomePage() {
  const { tt } = useLang()
  const [destBlurbs, setDestBlurbs] = useState<{ en: string; th: string } | null>(null)
  const [heroVideoOk, setHeroVideoOk] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchConfirmedTours()
      .then((tours) => {
        if (cancelled) return
        setDestBlurbs(heroDestinationBlurbs(uniqueTourDestinations(tours)))
      })
      .catch(() => {
        if (!cancelled) setDestBlurbs(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const badge = tt('home.hero.badge')
  const en1 = tt('home.hero.en.line1')
  const en2 = tt('home.hero.en.line2')
  const th1 = tt('home.hero.th.line1')
  const th2 = tt('home.hero.th.line2')
  const subtitleFallback = tt('home.hero.subtitle')
  const explore = tt('btn.exploreTrips')
  const gallery = tt('nav.gallery')
  const promoTitle = tt('home.promo.title')
  const tripsLabel = tt('home.stats.tripsLabel')
  const groupLabel = tt('home.stats.groupLabel')
  const photoLabel = tt('home.stats.photographersLabel')

  const subtitleEn = destBlurbs?.en ?? subtitleFallback.en
  const subtitleTh = destBlurbs?.th ?? subtitleFallback.th

  return (
    <div className="-mx-4 space-y-0">
      <section className="relative flex min-h-[92svh] w-full flex-col overflow-hidden bg-teal-900">
        {heroVideoOk ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 z-0 h-full w-full object-cover"
            src={HERO_VIDEO_URL}
            onError={() => setHeroVideoOk(false)}
          />
        ) : null}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,26,29,.55) 0%, rgba(15,26,29,.1) 40%, rgba(15,26,29,.9) 78%, rgba(15,26,29,.97) 100%)',
          }}
          aria-hidden
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-[300px] flex-1 flex-col justify-end px-5 pb-4 pt-16 sm:max-w-md">
          <p className="mb-2.5 self-center rounded-full border border-white/25 bg-white/14 px-[11px] py-1 text-center text-[8.5px] leading-[1.4] text-cream backdrop-blur-[6px]">
            {badge.en}
            <span className="mt-0.5 block font-thai text-[7.5px] opacity-85">{badge.th}</span>
          </p>

          <h1 className="m-0 text-center font-serif text-[22px] leading-[1.22] text-cream sm:text-[28px]">
            {en1.en} <em className="not-italic text-mint-200">{en2.en}</em>
          </h1>
          <p className="mb-[7px] mt-0.5 text-center font-thai text-[10.5px] text-mint-200 sm:text-[13px]">
            {th1.th} {th2.th}
          </p>

          <p className="mb-[3px] text-center text-[9.5px] leading-[1.5] text-[#dff5ea] sm:text-[12px]">
            {subtitleEn}
          </p>
          <p className="mb-[11px] text-center font-thai text-[8.5px] text-[#bfe9d0] sm:text-[11px]">
            {subtitleTh}
          </p>

          <div className="mb-3 flex gap-1.5 rounded-full border border-white/20 bg-white/12 p-[5px]">
            <Link to="/trips" className="btn-embossed cta-shine">
              {explore.en}
              <span className="mt-0.5 block font-thai text-[7.5px] font-medium opacity-85">
                {explore.th}
              </span>
            </Link>
            <Link to="/gallery" className="btn-embossed-ghost">
              {gallery.en}
              <span className="mt-0.5 block font-thai text-[7.5px] font-medium opacity-85">
                {gallery.th}
              </span>
            </Link>
          </div>
        </div>

        <div className="relative z-[2] mx-auto mb-2.5 w-full max-w-[300px] px-5 sm:max-w-md">
          <Link
            to="/photo-guide"
            className="flex items-center gap-2.5 rounded-[14px] border border-white/28 bg-white/14 px-3 py-2.5 backdrop-blur-[6px]"
          >
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-b from-teal-400 to-teal-600">
              <Camera className="h-3.5 w-3.5 text-cream" strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1 leading-[1.3]">
              <span className="block text-[9.5px] font-bold text-cream">{promoTitle.en}</span>
              <span className="block font-thai text-[8px] text-[#d9f5e4]">{promoTitle.th}</span>
            </span>
            <ArrowRight className="h-3 w-3 shrink-0 text-cream/80" />
          </Link>
        </div>

        <div className="relative z-[2] grid grid-cols-3 gap-0 border-t border-white/10 bg-teal-900/75 px-1 pb-8 pt-2.5 text-center backdrop-blur-[2px]">
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={13} />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {tripsLabel.en}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">
                {tripsLabel.th}
              </span>
            </p>
          </div>
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={6} />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {groupLabel.en}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">
                {groupLabel.th}
              </span>
            </p>
          </div>
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={10} suffix="+" />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {photoLabel.en}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">
                {photoLabel.th}
              </span>
            </p>
          </div>
        </div>
      </section>

      <TripTypeCategories />
      <HomeHowItWorks />
      <HomeFeaturesSection />
      <HomeTripShowcase />
      <div className="space-y-10 bg-cream px-4 py-10 text-ink">
        <HomeCtaFaq />
      </div>
    </div>
  )
}
