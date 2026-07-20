import { Link } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import CountUpStat from '../../components/ui/CountUpStat'
import TripTypeCategories from '../../components/trips/TripTypeCategories'
import HomeFeaturesSection from '../../components/trips/HomeFeaturesSection'
import HomeCtaFaq from '../../components/trips/HomeCtaFaq'

/** Trip2Talk hero reel — hosted in the main Supabase project's storage bucket */
const HERO_VIDEO_URL =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/VDO/Tasmania_cover.mp4'

export default function HomePage() {
  const { t, lang } = useLang()

  return (
    <div className="-mx-4 space-y-0">
      {/* Mockup .home-screen — full-bleed video + overlay + bottom-aligned content */}
      <section className="relative flex min-h-[92svh] w-full flex-col overflow-hidden bg-teal-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
        />
        {/* Exact mockup .home-overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,26,29,.55) 0%, rgba(15,26,29,.1) 40%, rgba(15,26,29,.9) 78%, rgba(15,26,29,.97) 100%)',
          }}
          aria-hidden
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-[300px] flex-1 flex-col justify-end px-5 pb-4 pt-16 sm:max-w-md">
          {/* .home-badge */}
          <p
            className="mb-2.5 self-center rounded-full border border-white/25 bg-white/14 px-[11px] py-1 text-center text-[8.5px] leading-[1.4] text-cream backdrop-blur-[6px]"
          >
            Trip2Talk
            <span className="mt-0.5 block font-thai text-[7.5px] opacity-85">
              {lang === 'th' ? 'ทริปถ่ายภาพส่วนตัว' : 'Private photo journeys'}
            </span>
          </p>

          {/* .home-content h1 — 17px mockup (scaled for real viewport) */}
          <h1 className="m-0 text-center font-serif text-[22px] leading-[1.22] text-cream sm:text-[28px]">
            {t('home.hero.en.line1')}{' '}
            <em className="not-italic text-mint-200">{t('home.hero.en.line2')}</em>
          </h1>
          <p className="mb-[7px] mt-0.5 text-center font-thai text-[10.5px] text-mint-200 sm:text-[13px]">
            {t('home.hero.th.line1')} {t('home.hero.th.line2')}
          </p>

          <p className="mb-[3px] text-center text-[9.5px] leading-[1.5] text-[#dff5ea] sm:text-[12px]">
            {t('home.hero.subtitle')}
          </p>
          <p className="mb-[11px] text-center font-thai text-[8.5px] text-[#bfe9d0] sm:text-[11px]">
            {lang === 'th'
              ? 'กลุ่มเล็ก สูงสุด 6 คน · ช่างภาพมืออาชีพทุกทริป'
              : 'Small groups · max 6 · pro photographer every trip'}
          </p>

          {/* .home-cta pill tray */}
          <div className="mb-3 flex gap-1.5 rounded-full border border-white/20 bg-white/12 p-[5px]">
            <Link to="/trips" className="btn-embossed cta-shine">
              {t('btn.bookNow')}
              <span className="mt-0.5 block font-thai text-[7.5px] font-medium opacity-85">
                {lang === 'th' ? 'จองเลย' : 'จองเลย'}
              </span>
            </Link>
            <Link to="/gallery" className="btn-embossed-ghost">
              {t('nav.gallery')}
              <span className="mt-0.5 block font-thai text-[7.5px] font-medium opacity-85">
                แกลเลอรี
              </span>
            </Link>
          </div>
        </div>

        {/* .home-stats */}
        <div className="relative z-[2] grid grid-cols-3 gap-0 bg-black/28 px-1 pb-16 pt-2 text-center">
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={13} />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {t('home.stats.tripsLabel')}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">ทริป</span>
            </p>
          </div>
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={6} />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {t('home.stats.groupLabel')}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">กลุ่ม</span>
            </p>
          </div>
          <div>
            <p className="m-0 text-[13px] font-bold text-mint-200 sm:text-[18px]">
              <CountUpStat end={10} suffix="+" />
            </p>
            <p className="mt-px text-[6.5px] uppercase leading-[1.3] tracking-[0.06em] text-[#cfe9d8]">
              {t('home.stats.photographersLabel')}
              <span className="block font-thai text-[8.5px] normal-case opacity-85">ช่างภาพ</span>
            </p>
          </div>
        </div>
      </section>

      {/* .home-guide-banner — frosted glass, not solid teal bar */}
      <div className="bg-teal-900 px-5 pb-4">
        <Link
          to="/photo-guide"
          className="flex items-center gap-2.5 rounded-[14px] border border-white/28 bg-white/14 px-3 py-2.5 backdrop-blur-[6px]"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-b from-teal-400 to-teal-600 text-sm">
            <Camera className="h-3.5 w-3.5 text-cream" strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1 leading-[1.3]">
            <span className="block text-[9.5px] font-bold text-cream">{t('home.promo.title')}</span>
            <span className="block font-thai text-[8px] text-[#d9f5e4]">{t('home.promo.eyebrow')}</span>
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-cream/80" />
        </Link>
      </div>

      <TripTypeCategories />
      <HomeFeaturesSection />
      <div className="space-y-10 bg-cream px-4 py-10 text-ink">
        <HomeCtaFaq />
      </div>
    </div>
  )
}
