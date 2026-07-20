import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Lock, MessageCircle } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { enabledContactChannels, FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import type { TranslationKey } from '../../i18n/translations'

const FOOTER_VIDEO_URL =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/VDO/NZ/NZ02.mp4'

const TRIP2TALK_LOGO_URL =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Logo/Trip2talk%20(1).png'

const navLinks: { to: string; key: TranslationKey }[] = [
  { to: '/trips', key: 'nav.trips' },
  { to: '/gallery', key: 'nav.gallery' },
  { to: '/calendar', key: 'nav.calendar' },
  { to: '/pricing', key: 'nav.pricing' },
  { to: '/about', key: 'nav.about' },
]

const infoLinks: { to: string; key: TranslationKey }[] = [
  { to: '/terms', key: 'footer.info.terms' },
  { to: '/privacy', key: 'footer.info.privacy' },
  { to: '/cancellation', key: 'footer.info.cancellation' },
  { to: '/payment-methods', key: 'footer.info.payment' },
  { to: '/help', key: 'footer.info.help' },
  { to: '/account', key: 'footer.info.contact' },
]

export default function PublicFooter() {
  const { t } = useLang()
  const watermarkSvgRef = useRef<SVGSVGElement>(null)
  const watermarkTextRef = useRef<SVGTextElement>(null)
  const socials = enabledContactChannels().slice(0, 4)

  useEffect(() => {
    function fitWatermark() {
      const svg = watermarkSvgRef.current
      const text = watermarkTextRef.current
      if (!svg || !text) return
      try {
        const bbox = text.getBBox()
        svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
      } catch {
        /* font not ready */
      }
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(fitWatermark)
    } else {
      window.addEventListener('load', fitWatermark)
    }
    window.addEventListener('resize', fitWatermark)
    return () => window.removeEventListener('resize', fitWatermark)
  }, [])

  return (
    <section className="footer-section relative overflow-visible bg-white px-4 pb-24 pt-8 sm:px-6">
      <div className="footer-wrapper relative z-[1] mx-auto grid max-w-[1150px] grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,350px)_1fr]">
        {/* Left card — video */}
        <div className="footer-left relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[28px] bg-teal-900 p-8 shadow-[0_12px_40px_rgba(13,74,46,0.28)] max-md:min-h-0 max-md:gap-10">
          <video
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={FOOTER_VIDEO_URL} type="video/mp4" />
          </video>

          <div className="relative z-[1] flex flex-row items-center gap-2.5">
            <img
              src={TRIP2TALK_LOGO_URL}
              alt="Trip2Talk"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-sans text-[22px] font-bold tracking-[-0.02em] text-white">
              Trip2Talk
            </span>
          </div>

          <div className="relative z-[1] mb-7 mt-auto">
            <p className="font-sans text-[19px] font-normal leading-[1.45] text-white">
              {t('footer.tagline.line1')}
              <br />
              <span className="text-white/65">{t('footer.tagline.line2')}</span>
            </p>
          </div>

          <div className="relative z-[1] flex flex-row items-center justify-between gap-3">
            <span className="font-hand text-[17px] font-semibold tracking-[0.3px] text-white/90">
              {t('footer.social.label')}
            </span>
            <div className="flex flex-row gap-[7px]">
              {socials.map((channel) => {
                const Icon = channel.icon
                return (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noopener noreferrer' : undefined}
                    aria-label={t(channel.labelKey)}
                    className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#0e1014] text-white shadow-[0_6px_18px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.2)] transition-[background,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_10px_24px_rgba(0,0,0,0.45),0_4px_10px_rgba(0,0,0,0.3)]"
                  >
                    <Icon className="h-[15px] w-[15px]" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="footer-right relative flex flex-col justify-between overflow-visible rounded-[28px] bg-mint-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-10">
          {/* Floating lucky badge */}
          <Link
            to="/booking"
            className="footer-lucky-graphic absolute right-3 top-[-28px] z-10 flex flex-col items-start gap-1.5 sm:right-10 sm:top-[-36px]"
          >
            <div
              className="lucky-cube h-[72px] w-[72px] overflow-hidden rounded-full sm:h-24 sm:w-24"
              style={{
                transform: 'rotate(-10deg)',
                boxShadow: '8px 14px 28px rgba(13,74,46,0.35)',
              }}
            >
              <img
                src={TRIP2TALK_LOGO_URL}
                alt="Trip2Talk"
                className="h-full w-full object-cover"
                style={{ transform: 'rotate(10deg)' }}
              />
            </div>
            <div
              className="mt-1 flex flex-row items-center gap-1.5"
              style={{ transform: 'rotate(-4deg)' }}
            >
              <svg
                className="h-[22px] w-[22px] shrink-0 text-[#9ca3af]"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M3 20 C 6 14, 10 9, 18 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 5 L 12 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 5 L 18 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="whitespace-nowrap font-hand text-xl font-semibold text-[#9ca3af]">
                {t('footer.lucky.text')}
              </span>
            </div>
          </Link>

          <div className="pt-2">
            <div className="flex flex-row gap-10 sm:gap-[72px]">
              <div>
                <div className="mb-[18px] font-hand text-2xl font-semibold italic text-[#9ca3af]">
                  {t('footer.nav.title1')}
                </div>
                {navLinks.map(({ to, key }) => (
                  <Link
                    key={to}
                    to={to}
                    className="mb-3.5 block font-sans text-sm font-semibold text-ink no-underline transition-colors duration-200 hover:text-teal-700"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>
              <div>
                <div className="mb-[18px] font-hand text-2xl font-semibold italic text-[#9ca3af]">
                  {t('footer.nav.title2')}
                </div>
                {infoLinks.map(({ to, key }) => (
                  <Link
                    key={key}
                    to={to}
                    className="mb-3.5 block font-sans text-sm font-semibold text-ink no-underline transition-colors duration-200 hover:text-teal-700"
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <p className="font-sans text-[12.5px] font-medium text-[#9ca3af]">
              {t('footer.copyright')}
            </p>
            <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:max-w-[340px]">
              <h4 className="font-sans text-[15px] font-normal leading-[1.45] text-[#6b7280]">
                {t('footer.bottom.cta.line1')}
                <br />
                <strong className="mt-0.5 block text-[17px] font-bold leading-snug text-ink sm:text-[19px]">
                  {t('footer.bottom.cta.line2')}
                </strong>
              </h4>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d0d0f] px-5 py-3 font-sans text-[13.5px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_18px_-8px_rgba(0,0,0,0.5)] transition-[background,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_12px_22px_-8px_rgba(0,0,0,0.55)] sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                {t('footer.subscribe.button')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div
        className="pointer-events-none relative z-0 mx-auto mt-[-60px] max-w-[1150px] select-none leading-[0]"
        aria-hidden
      >
        <svg
          ref={watermarkSvgRef}
          viewBox="62 95 876 175"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-auto w-full overflow-visible"
        >
          <text
            ref={watermarkTextRef}
            x="500"
            y="240"
            textAnchor="middle"
            fontSize="320"
            className="fill-black/[0.04] font-sans font-bold tracking-[-0.03em]"
          >
            Trip2Talk
          </text>
        </svg>
      </div>

      <div className="mx-auto mt-2 flex max-w-[1150px] flex-col items-center gap-1.5 px-4">
        <p className="text-center font-sans text-[10px] text-[#9ca3af]">
          33/14 Jubilee Ave, Warriewood NSW 2102 · ABN 81 951 461 769
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-1 font-sans text-[10px] text-[#b0b6c0] no-underline transition-colors hover:text-teal-700/70"
          aria-label="Staff PIN login"
        >
          <Lock className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
          พนักงาน
        </Link>
      </div>
    </section>
  )
}
