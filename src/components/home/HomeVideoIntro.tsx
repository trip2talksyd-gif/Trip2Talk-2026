import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { BRAND_BADGE_PNG_SRC, BRAND_BADGE_SRC } from '../../data/brand'
import { fetchConfirmedTours } from '../../lib/toursApi'
import { heroDestinationBlurbs, uniqueTourDestinations } from '../../lib/tourDisplay'
import HeroVideo, { type HeroVideoHandle } from './HeroVideo'
import BiDisplayHeading from '../ui/BiDisplayHeading'

const CTA_GRADIENT = 'linear-gradient(to bottom, #2B2B2B, #101010)'

/**
 * Marketing video + Capture Moments copy from the old `/` HomePage.
 * Kept for reuse off Discover — not rendered on the homepage.
 */
export default function HomeVideoIntro() {
  const { lang, tt } = useLang()
  const navigate = useNavigate()
  const heroVideoRef = useRef<HeroVideoHandle>(null)
  const [query, setQuery] = useState('')
  const [destBlurbs, setDestBlurbs] = useState<{ en: string; th: string } | null>(null)

  const subtitleFallback = tt('home.hero.subtitle')
  const subtitleEn = destBlurbs?.en ?? subtitleFallback.en
  const subtitleTh = destBlurbs?.th ?? subtitleFallback.th

  const whoosh = () => heroVideoRef.current?.whoosh()

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

  const goTrips = (path = '/trips') => {
    whoosh()
    window.setTimeout(() => {
      navigate(path)
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
    <section
      className="relative -mx-4 overflow-x-clip bg-[#0a1214] font-[Geist,-apple-system,BlinkMacSystemFont,sans-serif] antialiased sm:-mx-6 lg:-mx-10"
      onMouseMove={(e) => heroVideoRef.current?.setPointerX(e.clientX)}
      onMouseLeave={() => heroVideoRef.current?.setPointerX(null)}
      onTouchMove={(e) => {
        const t = e.touches[0]
        if (t) heroVideoRef.current?.setPointerX(t.clientX)
      }}
      onTouchEnd={() => heroVideoRef.current?.setPointerX(null)}
      onTouchCancel={() => heroVideoRef.current?.setPointerX(null)}
    >
      <div className="relative grid h-[min(70vh,560px)] min-h-[320px] w-full grid-cols-1 grid-rows-1">
        <div className="relative col-start-1 row-start-1 min-h-0 min-w-0 overflow-hidden">
          <HeroVideo ref={heroVideoRef} />
        </div>

        <div className="col-start-1 row-start-1 z-10 flex min-h-0 flex-col overflow-visible">
          <div className="mt-auto flex min-h-0 flex-col gap-5 overflow-visible px-5 pb-8 sm:gap-7 sm:px-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-12">
            <div className="max-w-xl overflow-visible">
              <BiDisplayHeading
                en={heroEn}
                th={heroTh}
                as="h2"
                thAs="p"
                className="overflow-visible py-0.5"
                enClassName="text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[3.25rem]"
                thClassName="mt-2 text-sm font-medium leading-normal text-white/75"
              />
              <p
                lang={lang === 'th' ? 'th' : 'en'}
                className={`mt-3 max-w-md text-sm leading-relaxed text-white/75 ${
                  lang === 'th' ? 'font-thai' : ''
                }`}
                style={
                  lang === 'th'
                    ? { fontFamily: "Sarabun, Prompt, 'Noto Serif Thai', sans-serif" }
                    : undefined
                }
              >
                {lang === 'th' ? subtitleTh : subtitleEn}
              </p>

              <form
                onSubmit={onCta}
                className="mt-5 flex w-full flex-col gap-3 sm:mt-6 sm:inline-flex sm:w-auto sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-1.5"
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
                    <p className={`text-xs text-white/60 ${lang === 'th' ? 'font-thai' : ''}`}>
                      {lang === 'th' ? 'Trip Leader · ช่างภาพ' : 'Trip Leader · Photographer'}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
