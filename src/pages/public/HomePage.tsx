import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { BRAND_BADGE_PNG_SRC, BRAND_BADGE_SRC, BRAND_NAME } from '../../data/brand'
import { fetchConfirmedTours } from '../../lib/toursApi'
import { heroDestinationBlurbs, uniqueTourDestinations } from '../../lib/tourDisplay'
import HeroVideo, { type HeroVideoHandle } from '../../components/home/HeroVideo'
import HomePositioningSection from '../../components/trips/HomePositioningSection'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import ShareButton from '../../components/ui/ShareButton'

const CTA_GRADIENT = 'linear-gradient(to bottom, #2B2B2B, #101010)'

const NAV_LINKS = [
  { to: '/trips', en: 'Trips', th: 'ทริป' },
  { to: '/discover', en: 'Discover', th: 'Discover' },
  { to: '/photo-guide', en: 'Guides', th: 'คู่มือ', chevron: true },
  { to: '/pricing', en: 'Pricing', th: 'ราคา' },
] as const

export default function HomePage() {
  const { lang, setLang, tt } = useLang()
  const navigate = useNavigate()
  const heroVideoRef = useRef<HeroVideoHandle>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [destBlurbs, setDestBlurbs] = useState<{ en: string; th: string } | null>(null)

  const subtitleFallback = tt('home.hero.subtitle')
  const subtitleEn = destBlurbs?.en ?? subtitleFallback.en
  const subtitleTh = destBlurbs?.th ?? subtitleFallback.th

  const whoosh = () => heroVideoRef.current?.whoosh()

  useEffect(() => {
    document.title = 'Trip2Talk — Photo Trips in Australia'
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchConfirmedTours()
      .then((tours) => {
        if (!cancelled) setDestBlurbs(heroDestinationBlurbs(uniqueTourDestinations(tours)))
      })
      .catch(() => {
        if (!cancelled) setDestBlurbs(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : prev || ''
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const goTrips = (path = '/trips') => {
    whoosh()
    window.setTimeout(() => {
      navigate(path)
      setMenuOpen(false)
    }, 280)
  }

  const onCta = (e?: FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    goTrips(q ? `/trips?q=${encodeURIComponent(q)}` : '/trips')
  }

  const heroEn = `${tt('home.hero.en.line1').en} ${tt('home.hero.en.line2').en}`
  const heroTh = `${tt('home.hero.th.line1').th} ${tt('home.hero.th.line2').th}`

  const statsBody =
    lang === 'th'
      ? 'กลุ่มเล็กจอง Trip2Talk เพื่อทริปถ่ายภาพพร้อมช่างภาพมืออาชีพ'
      : 'Small groups book Trip2Talk for photo trips with a pro photographer.'

  const quote =
    lang === 'th'
      ? '"เราไม่ใช่บริษัททัวร์ — ทุกทริปคือแพ็กเกจถ่ายภาพเป็นหลัก ธรรมชาติคือสตูดิโอในช่วงแสงที่ดีที่สุด"'
      : '"We\'re not a tour company — every trip is a photography package first, nature as your studio in the best light."'

  return (
    <>
    <section
      className="home-nexum relative grid h-[100dvh] max-h-[100dvh] w-full grid-cols-1 grid-rows-1 overflow-hidden bg-[#0a1214] font-[Geist,-apple-system,BlinkMacSystemFont,sans-serif] antialiased md:max-h-[min(100dvh,900px)] md:h-[min(100dvh,900px)]"
      onMouseMove={(e) => heroVideoRef.current?.setPointerX(e.clientX)}
      onMouseLeave={() => heroVideoRef.current?.setPointerX(null)}
      onTouchMove={(e) => {
        const t = e.touches[0]
        if (t) heroVideoRef.current?.setPointerX(t.clientX)
      }}
      onTouchEnd={() => heroVideoRef.current?.setPointerX(null)}
      onTouchCancel={() => heroVideoRef.current?.setPointerX(null)}
    >
      {/* Grid cell locks height — video cannot inflate the section via intrinsic 16:9 size */}
      <div className="relative col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden">
        <HeroVideo ref={heroVideoRef} />
      </div>

      <div className="col-start-1 row-start-1 z-10 flex min-h-0 flex-col">
        {/* Top nav — fixed chrome height; never shrinks with the video */}
        <nav className="flex shrink-0 items-center justify-between px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pb-6 lg:px-12">
          <Link to="/" className="relative z-50 flex items-center gap-2">
            <picture>
              <source srcSet={BRAND_BADGE_SRC} type="image/webp" />
              <img
                src={BRAND_BADGE_PNG_SRC}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-white/40"
              />
            </picture>
            <span className="text-lg font-semibold lowercase tracking-tight text-white">
              {BRAND_NAME.toLowerCase().replace(/\s/g, '')}
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {lang === 'th' ? link.th : link.en}
                  {'chevron' in link && link.chevron ? (
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="inline-flex rounded-full border border-white/20 p-[3px] text-[10px] font-bold text-white/80">
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'en' ? 'bg-white text-[#101010]' : 'hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('th')}
                aria-pressed={lang === 'th'}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'th' ? 'bg-white text-[#101010]' : 'hover:text-white'
                }`}
              >
                TH
              </button>
            </div>

            <ShareButton tone="hero" />

            <Link
              to="/trips"
              onClick={(e) => {
                e.preventDefault()
                goTrips('/trips')
              }}
              className="flex items-center self-stretch rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: CTA_GRADIENT }}
            >
              {lang === 'th' ? 'เริ่มจอง' : 'Get started'}
            </Link>
          </div>

          <div className="relative z-50 flex items-center gap-1.5 md:hidden">
            <ShareButton tone="hero" />
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Menu
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <X
                className={`absolute h-5 w-5 transition-all duration-300 ${
                  menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile overlay + drawer */}
        <div
          className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
        <div
          className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col bg-black/90 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-2 px-6 pt-24">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateX(0)' : 'translateX(24px)',
                  transitionDelay: menuOpen ? `${(index + 1) * 60}ms` : '0ms',
                }}
              >
                <span className="flex items-center justify-between">
                  {lang === 'th' ? link.th : link.en}
                  {'chevron' in link && link.chevron ? (
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  ) : null}
                </span>
              </Link>
            ))}

            <div className="mt-2 flex gap-2 px-4">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  lang === 'en' ? 'bg-white text-[#101010]' : 'bg-white/10 text-white/80'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('th')}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  lang === 'th' ? 'bg-white text-[#101010]' : 'bg-white/10 text-white/80'
                }`}
              >
                TH
              </button>
            </div>
          </div>

          <div
            className="mt-auto px-6 pb-10 transition-all duration-[400ms]"
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: menuOpen ? '300ms' : '0ms',
            }}
          >
            <Link
              to="/trips"
              onClick={(e) => {
                e.preventDefault()
                goTrips('/trips')
              }}
              className="flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: CTA_GRADIENT }}
            >
              {lang === 'th' ? 'เริ่มจอง' : 'Get started'}
            </Link>
          </div>
        </div>

        {/* Bottom-anchored content — lives in the constrained hero cell, not below the video */}
        <div className="mt-auto flex min-h-0 flex-col gap-6 overflow-y-auto px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
          <div className="max-w-xl">
            <BiDisplayHeading
              en={heroEn}
              th={heroTh}
              as="h1"
              thAs="p"
              enClassName="text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[3.5rem]"
              thClassName="mt-2 text-sm font-medium text-white/75"
            />
            <p
              lang={lang === 'th' ? 'th' : 'en'}
              className={`mt-3 max-w-md text-sm leading-relaxed text-white/75 ${
                lang === 'th' ? 'font-thai' : ''
              }`}
              style={
                lang === 'th' ? { fontFamily: "Sarabun, Prompt, 'Noto Serif Thai', sans-serif" } : undefined
              }
            >
              {lang === 'th' ? subtitleTh : subtitleEn}
            </p>

            <form
              onSubmit={onCta}
              className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:inline-flex sm:w-auto sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-1.5"
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'th' ? '...ค้นหามุมงามใน Aus or NZ' : '...find beautiful spots in Aus or NZ'
                }
                className="rounded-full bg-white px-5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:py-2.5"
                style={{ background: CTA_GRADIENT }}
              >
                {lang === 'th' ? 'เริ่มจอง' : 'Get started'}
              </button>
            </form>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            {/* Stats card */}
            <article className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <p
                className="text-3xl font-normal tracking-tight text-white sm:text-4xl"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                10+
              </p>
              <p
                className={`mt-3 text-sm leading-relaxed text-white/75 sm:mt-4 ${
                  lang === 'th' ? 'font-thai' : ''
                }`}
              >
                {statsBody}
              </p>
            </article>

            {/* Photographer / positioning card — real Trip2Talk copy, no invented guest quotes */}
            <article className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-black text-xs font-bold text-white">
                  T
                </span>
                <span className="text-sm font-semibold text-white">Trip2Talk</span>
              </div>
              <p
                className={`text-sm leading-relaxed text-white/80 ${
                  lang === 'th' ? 'font-thai' : ''
                }`}
              >
                {quote}
              </p>
              <div className="mt-4 flex items-center gap-3 sm:mt-5">
                <picture>
                  <source srcSet={BRAND_BADGE_SRC} type="image/webp" />
                  <img
                    src={BRAND_BADGE_PNG_SRC}
                    alt="Saen — Trip2Talk"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full bg-white/20 object-cover"
                  />
                </picture>
                <div>
                  <p className="text-sm font-semibold text-white">Saen</p>
                  <p
                    className={`text-xs text-white/60 ${lang === 'th' ? 'font-thai' : ''}`}
                  >
                    {lang === 'th' ? 'Trip Leader · ช่างภาพ' : 'Trip Leader · Photographer'}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
    <HomePositioningSection />
    </>
  )
}
