/**
 * Homepage v7 sections — approved mockup at docs/mockups/homepage-v7.
 * Mobile-first: swipe rows on phones, grids from md up; tap targets ≥ 48px.
 * Thai headings use Kanit Light (`font-serif font-light`) with one highlighted
 * phrase; English uses Bricolage (`font-display`) on a separate node.
 */
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  HOME_DAY,
  HOME_FINAL,
  HOME_FOLLOW,
  HOME_GALLERY,
  HOME_IMG,
  HOME_REELS,
  HOME_SAEN,
  HOME_TRIPS,
  HOME_WHY,
  type Bi,
  type HiHeading,
} from '../../data/homeContent'
import { FACEBOOK_MESSENGER_URL, FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { YOUTUBE_URL, useBi } from './homeV7Hooks'
import { FacebookIcon, YouTubeIcon } from '../contact/contactIcons'
import { GALLERY_PHOTOS, photoThumbSrc } from '../../data/galleryPhotos'
import { isListedPriceHidden, seatsRemaining } from '../../lib/toursApi'
import { tourDestinationLabel, tourDurationLabel } from '../../lib/tourDisplay'
import TripCoverImage from '../trips/TripCoverImage'
import type { Tour } from '../../types/tour'


type Tone = 'light' | 'dark'


/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Full-bleed band: cancels PublicLayout's <main> side padding. */
export function Bleed({ className = '', children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={`-mx-4 sm:-mx-6 lg:-mx-10 ${className}`}>
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-10">{children}</div>
    </section>
  )
}

export function Kicker({ text, tone = 'light' }: { text: Bi; tone?: Tone }) {
  const pick = useBi()
  const { lang } = useLang()
  return (
    <p
      lang={lang}
      className={`inline-flex items-center gap-2 text-[13px] font-medium ${lang === 'th' ? 'font-serif' : 'font-display'} ${
        tone === 'dark' ? 'text-orange-soft' : 'text-orange-deep'
      }`}
    >
      <span className="h-[2px] w-[18px] rounded-full bg-orange" aria-hidden />
      {pick(text)}
    </p>
  )
}

/**
 * Bilingual headline: primary language large, the other as a small subline.
 * Thai and English stay on sibling nodes (Thai shaping safety).
 */
export function HiTitle({
  h,
  as: Tag = 'h2',
  tone = 'light',
  size = 'section',
  center = false,
}: {
  h: HiHeading
  as?: 'h1' | 'h2' | 'h3'
  tone?: Tone
  size?: 'hero' | 'section' | 'band'
  center?: boolean
}) {
  const { lang } = useLang()
  const hiColor = tone === 'dark' ? 'text-orange-soft' : 'text-orange-deep'
  const subColor = tone === 'dark' ? 'text-cream/70' : 'text-ink-soft'
  const mainSize =
    size === 'hero'
      ? 'text-[34px] sm:text-[46px] lg:text-[60px]'
      : size === 'band'
        ? 'text-[22px] sm:text-[28px] lg:text-[34px]'
        : 'text-[26px] sm:text-[34px] lg:text-[40px]'
  const subSize = size === 'hero' ? 'text-[17px] sm:text-[21px]' : 'text-[15px] sm:text-[17px]'

  const th = (
    <span
      lang="th"
      className={`block font-serif ${
        lang === 'th' ? `${mainSize} font-light leading-[1.3]` : `${subSize} mt-1.5 font-light leading-normal ${subColor}`
      }`}
    >
      {h.th.pre}
      <span className={`font-medium ${lang === 'th' ? hiColor : ''} ${size === 'hero' && lang === 'th' ? 'block' : ''}`}>{h.th.hi}</span>
      {h.th.post}
    </span>
  )
  const en = (
    <span
      lang="en"
      className={`block font-display ${
        lang === 'en'
          ? `${mainSize} font-semibold leading-[1.1] tracking-[-0.025em]`
          : `${subSize} mt-1.5 font-semibold tracking-[-0.01em] ${subColor}`
      }`}
    >
      {h.en.pre}
      <span className={`${lang === 'en' ? hiColor : ''} ${size === 'hero' && lang === 'en' ? 'block' : ''}`}>{h.en.hi}</span>
      {h.en.post}
    </span>
  )
  return (
    <Tag className={`mt-2.5 text-balance ${center ? 'mx-auto text-center' : ''}`}>
      {lang === 'th' ? (
        <>
          {th}
          {en}
        </>
      ) : (
        <>
          {en}
          {th}
        </>
      )}
    </Tag>
  )
}

/** Body text in the active language with the right font. */
export function BiP({ text, className = '' }: { text: Bi; className?: string }) {
  const { lang } = useLang()
  return (
    <p lang={lang} className={`${lang === 'th' ? 'font-thai' : ''} ${className}`}>
      {lang === 'th' ? text.th : text.en}
    </p>
  )
}

/** Horizontal snap row on phones, 3-col grid from md. */
function SnapRow({ children }: { children: ReactNode }) {
  return (
    <div className="hide-scrollbar -mx-5 mt-7 grid snap-x snap-mandatory auto-cols-[84%] grid-flow-col gap-3.5 overflow-x-auto scroll-px-5 px-5 pb-1.5 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible md:px-0">
      {children}
    </div>
  )
}

function SwipeHint({ text }: { text: Bi }) {
  return <BiP text={text} className="mt-3 text-[13px] text-ink-soft md:hidden" />
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export function WhySection() {
  const pick = useBi()
  const { lang } = useLang()
  return (
    <Bleed id="why" className="bg-cream-app py-16 sm:py-24">
      <Kicker text={HOME_WHY.kicker} />
      <HiTitle h={HOME_WHY.heading} />
      <BiP text={HOME_WHY.lead} className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft" />
      <SnapRow>
        {HOME_WHY.cards.map((c) => (
          <article key={c.tag} className="relative aspect-[4/5] snap-start overflow-hidden rounded-[18px] bg-teal-dark">
            <img src={c.img} alt={pick(c.alt)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(10,24,21,.94) 100%)' }}
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
              <p className="font-mono text-[11px] tracking-[0.08em] text-orange-soft">{c.tag}</p>
              <h3 lang={lang} className={`mt-1.5 text-[20px] font-medium leading-snug ${lang === 'th' ? 'font-serif' : 'font-display tracking-[-0.01em]'}`}>
                {pick(c.title)}
              </h3>
              <BiP text={c.body} className="mt-1.5 text-[14.5px] leading-relaxed text-cream/80" />
            </div>
          </article>
        ))}
      </SnapRow>
      <SwipeHint text={{ en: 'Swipe for more →', th: 'ปัดดูต่อ →' }} />
    </Bleed>
  )
}

export function DaySection() {
  const pick = useBi()
  const { lang } = useLang()
  return (
    <Bleed id="day" className="bg-deep-green py-16 text-cream sm:py-24">
      <Kicker text={HOME_DAY.kicker} tone="dark" />
      <HiTitle h={HOME_DAY.heading} tone="dark" />
      <ol className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {HOME_DAY.stops.map((s) => (
          <li
            key={s.time.en}
            className={`grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3.5 rounded-[18px] border p-2.5 md:grid-cols-[128px_minmax(0,1fr)] ${
              s.final ? 'border-orange/60 bg-[linear-gradient(135deg,rgba(230,147,90,.18),#122f2a_70%)]' : 'border-cream/10 bg-teal-dark'
            }`}
          >
            <img src={s.img} alt="" loading="lazy" decoding="async" className="h-24 w-24 rounded-xl object-cover md:h-32 md:w-32" />
            <div className="min-w-0">
              <p lang={lang} className={`text-[12px] tracking-[0.04em] text-orange-soft ${lang === 'th' && s.final ? 'font-serif' : 'font-mono'}`}>
                {pick(s.time)}
              </p>
              <h3 lang={lang} className={`mt-0.5 text-[17px] font-medium leading-snug ${lang === 'th' ? 'font-serif' : 'font-display'}`}>
                {pick(s.title)}
              </h3>
              <BiP text={s.body} className="mt-0.5 text-[14px] leading-relaxed text-cream/75" />
            </div>
          </li>
        ))}
      </ol>
      <BiP text={HOME_DAY.note} className="mt-4 text-[13px] text-cream/60" />
    </Bleed>
  )
}

export function SaenSection({ openTrips }: { openTrips: number | null }) {
  const pick = useBi()
  const { lang } = useLang()
  const stats: { n: string; label: Bi }[] = [
    { n: '10', label: HOME_SAEN.stats.years },
    { n: '6', label: HOME_SAEN.stats.group },
    ...(openTrips && openTrips > 0 ? [{ n: String(openTrips), label: HOME_SAEN.stats.trips }] : []),
  ]
  return (
    <Bleed id="saen" className="bg-cream-app py-16 sm:py-24">
      <div className="grid items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
        <div className="relative aspect-[4/5] max-h-[560px] overflow-hidden rounded-[18px]">
          <img src={HOME_IMG.saen} alt={pick(HOME_SAEN.alt)} loading="lazy" decoding="async" className="h-full w-full object-cover object-[60%_center]" />
          <span className="absolute bottom-3.5 left-3.5 rounded-full bg-teal-dark/75 px-3 py-1.5 font-mono text-[11px] text-cream/85 backdrop-blur">
            {HOME_SAEN.tag}
          </span>
        </div>
        <div>
          <Kicker text={HOME_SAEN.kicker} />
          <HiTitle h={HOME_SAEN.heading} />
          <BiP text={HOME_SAEN.body} className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft" />
          <blockquote className="my-6 border-l-[3px] border-orange pl-4">
            <p lang="th" className={`font-serif font-light leading-normal ${lang === 'th' ? 'text-[20px] text-ink' : 'text-[15px] text-ink-soft'}`}>
              {HOME_SAEN.quote.th}
            </p>
            <p lang="en" className={`mt-1 font-display ${lang === 'en' ? 'text-[20px] font-medium text-ink' : 'text-[14px] text-ink-soft'}`}>
              “{HOME_SAEN.quote.en}”
            </p>
          </blockquote>
          <div className={`grid gap-2.5 ${stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {stats.map((s) => (
              <div key={s.label.en} className="rounded-[14px] border border-line bg-white px-2 py-3.5 text-center">
                <p className="font-display text-[28px] font-extrabold leading-none tracking-[-0.03em] text-orange-deep tabular-nums">{s.n}</p>
                <p lang={lang} className={`mt-1.5 text-[12.5px] text-ink-soft ${lang === 'th' ? 'font-thai' : ''}`}>
                  {pick(s.label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Bleed>
  )
}

/** 1 feature photo (2×2 on desktop, full-width 16:9 on phones) + 8 squares = full rows at 2 and 4 cols. */
const GALLERY_COUNT = 9

export function GallerySection() {
  const pick = useBi()
  const photos = GALLERY_PHOTOS.slice(0, GALLERY_COUNT)
  if (photos.length === 0) return null
  return (
    <Bleed id="gallery" className="bg-cream-app pb-16 sm:pb-24">
      <Kicker text={HOME_GALLERY.kicker} />
      <HiTitle h={HOME_GALLERY.heading} />
      <div className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {photos.map((p, i) => {
          const feature = i === 0
          return (
            <Link
              key={p.id}
              to="/gallery"
              className={`relative block overflow-hidden rounded-xl bg-teal-soft ${
                feature ? 'col-span-2 aspect-[16/9] md:row-span-2 md:aspect-square' : 'aspect-square'
              }`}
            >
              <img
                src={photoThumbSrc(p, { width: feature ? 1080 : 560, quality: 70, format: 'webp' })}
                alt={`${p.caption_en} / ${p.caption_th}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
              />
              <span className="absolute bottom-2 left-2 max-w-[calc(100%-16px)] truncate rounded-full bg-teal-dark/70 px-2.5 py-0.5 font-thai text-[12px] text-cream/90">
                {pick({ en: p.caption_en, th: p.caption_th })}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link to="/gallery" className="home-btn-ghost">
          {pick(HOME_GALLERY.seeGallery)} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link to="/discover" className="home-btn-ghost">
          {pick(HOME_GALLERY.seeSpots)} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Bleed>
  )
}

export function ReelsSection() {
  const pick = useBi()
  const { lang } = useLang()
  return (
    <Bleed id="reel" className="bg-cream-app pb-16 sm:pb-24">
      <Kicker text={HOME_REELS.kicker} />
      <HiTitle h={HOME_REELS.heading} />
      <SnapRow>
        {HOME_REELS.clips.map((c) => (
          <figure key={c.src} className="m-0 snap-start overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_20px_45px_-28px_rgba(15,28,30,.35)]">
            <video
              controls
              playsInline
              preload="none"
              poster={c.poster}
              className="block aspect-video w-full bg-black object-cover"
            >
              <source src={c.src} type="video/mp4" />
            </video>
            <figcaption className="flex items-baseline justify-between gap-2.5 px-4 pb-4 pt-3">
              <span className="min-w-0">
                <span lang={lang} className={`block text-[17px] font-medium ${lang === 'th' ? 'font-serif' : 'font-display'}`}>
                  {pick(c.title)}
                </span>
                <span lang={lang} className={`block text-[13.5px] text-ink-soft ${lang === 'th' ? 'font-thai' : ''}`}>
                  {pick(c.sub)}
                </span>
              </span>
              <span className="font-mono text-[11px] text-orange-deep">{c.length}</span>
            </figcaption>
          </figure>
        ))}
      </SnapRow>
      <a href={`${YOUTUBE_URL}/videos`} target="_blank" rel="noopener noreferrer" className="home-btn-ghost mt-5">
        <Play className="h-4 w-4 fill-current" aria-hidden />
        {pick(HOME_REELS.allOnYoutube)}
      </a>
    </Bleed>
  )
}


function formatDate(iso: string, lang: 'en' | 'th'): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}


export function TripsSection({ tours, failed }: { tours: Tour[] | null; failed: boolean }) {
  const pick = useBi()
  const { lang } = useLang()
  const shown = useMemo(() => (tours ?? []).slice(0, 6), [tours])

  return (
    <Bleed id="trips" className="bg-cream-app pb-16 sm:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker text={HOME_TRIPS.kicker} />
          <HiTitle h={HOME_TRIPS.heading} />
        </div>
        <Link to="/trips" className="home-btn-ghost">
          {pick(HOME_TRIPS.allTrips)} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {tours === null && !failed ? (
        <SnapRow>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[380px] snap-start animate-pulse rounded-[18px] bg-white" />
          ))}
        </SnapRow>
      ) : shown.length === 0 ? (
        <div className="mt-7 rounded-[18px] border border-line bg-white p-6">
          <BiP text={HOME_TRIPS.empty} className="text-[15px] text-ink-soft" />
          <a href={FACEBOOK_MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="home-btn-primary mt-4">
            {pick(HOME_FINAL.ctaChat)}
          </a>
        </div>
      ) : (
        <>
          <SnapRow>
            {shown.map((t) => {
              const seats = seatsRemaining(t)
              const hidePrice = isListedPriceHidden(t)
              const name = lang === 'th' ? t.name_th || t.name_en : t.name_en
              const other = lang === 'th' ? t.name_en : t.name_th
              return (
                <Link
                  key={t.id}
                  to={`/trips/${encodeURIComponent(t.trip_code)}`}
                  className="flex snap-start flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_20px_45px_-28px_rgba(15,28,30,.35)]"
                >
                  <div className="relative aspect-[4/3]">
                    <TripCoverImage src={t.cover_image_url} alt={t.name_en} size="card" className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-teal-dark/75 px-3 py-1 font-mono text-[11px] text-orange-soft">
                      {tourDestinationLabel(t.trip_code, 'en')} · {tourDurationLabel(t, 'en')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3.5">
                    <h3 lang={lang} className={`text-[18px] font-medium leading-snug ${lang === 'th' ? 'font-serif' : 'font-display'}`}>
                      {name}
                    </h3>
                    {other ? (
                      <p lang={lang === 'th' ? 'en' : 'th'} className={`text-[13.5px] text-ink-soft ${lang === 'th' ? 'font-display' : 'font-thai'}`}>
                        {other}
                      </p>
                    ) : null}
                    <div className="mb-3.5 mt-2.5 flex flex-wrap gap-1.5">
                      <span className="home-chip">{tourDurationLabel(t, lang)}</span>
                      <span className="home-chip">
                        {t.departure_date ? formatDate(t.departure_date, lang) : pick(HOME_TRIPS.dateTba)}
                      </span>
                      {t.departure_date ? (
                        <span className={`home-chip ${seats > 0 && seats <= 3 ? '!bg-coral/15 !text-coral' : ''}`}>
                          {seats === 0 ? pick(HOME_TRIPS.full) : pick(HOME_TRIPS.seatsLeft).replace('{n}', String(seats))}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-auto flex min-h-12 items-center justify-between rounded-xl bg-orange/15 px-4 font-medium text-orange-deep">
                      <span lang={lang} className={lang === 'th' ? 'font-serif' : 'font-display'}>
                        {!hidePrice && t.price_aud > 0
                          ? `${pick(HOME_TRIPS.from)} $${Math.round(t.price_aud).toLocaleString('en-AU')}`
                          : pick(HOME_TRIPS.view)}
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              )
            })}
          </SnapRow>
          <SwipeHint text={HOME_TRIPS.swipe} />
        </>
      )}
    </Bleed>
  )
}

export function FollowSection() {
  const pick = useBi()
  const { lang } = useLang()
  const items = [
    {
      href: `${YOUTUBE_URL}?sub_confirmation=1`,
      Icon: YouTubeIcon,
      color: 'text-[#ff3b30]',
      title: HOME_FOLLOW.youtube.title,
      sub: HOME_FOLLOW.youtube.sub,
      cta: HOME_FOLLOW.youtube.cta,
    },
    {
      href: FACEBOOK_PAGE_URL,
      Icon: FacebookIcon,
      color: 'text-[#3d8bff]',
      title: HOME_FOLLOW.facebook.title,
      sub: HOME_FOLLOW.facebook.sub,
      cta: HOME_FOLLOW.facebook.cta,
    },
  ]
  return (
    <Bleed id="follow" className="bg-cream-app pb-16 sm:pb-24">
      <div className="grid gap-6 rounded-[24px] bg-deep-green bg-[linear-gradient(160deg,rgba(230,147,90,.22),rgba(22,38,43,0)_60%)] px-5 py-7 text-cream sm:p-10 md:grid-cols-2 md:items-center md:p-12">
        <div>
          <Kicker text={HOME_FOLLOW.kicker} tone="dark" />
          <h2 lang={lang} className={`mt-2 text-balance text-[24px] font-light leading-snug sm:text-[32px] ${lang === 'th' ? 'font-serif' : 'font-display font-semibold tracking-[-0.02em]'}`}>
            {pick(HOME_FOLLOW.heading)}
          </h2>
          <BiP text={HOME_FOLLOW.body} className="mt-2 text-[15px] text-cream/75" />
        </div>
        <div className="grid gap-2.5">
          {items.map(({ href, Icon, color, title, sub, cta }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-16 items-center gap-3.5 rounded-2xl border border-cream/25 bg-teal-dark px-4 py-3 transition-colors hover:border-orange-soft"
            >
              <Icon className={`h-7 w-7 shrink-0 ${color}`} />
              <span className="min-w-0">
                <span className="block font-display text-[16px] font-semibold">{title}</span>
                <span lang={lang} className={`block truncate text-[13px] text-cream/65 ${lang === 'th' ? 'font-thai' : ''}`}>
                  {pick(sub)}
                </span>
              </span>
              <span lang={lang} className={`ml-auto shrink-0 rounded-full bg-orange px-3.5 py-1.5 text-[13.5px] font-medium text-deep-green ${lang === 'th' ? 'font-serif' : 'font-display'}`}>
                {pick(cta)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Bleed>
  )
}

export function FinalSection() {
  const pick = useBi()
  return (
    <Bleed className="bg-cream-app pb-20 text-center sm:pb-28">
      <HiTitle h={HOME_FINAL.heading} center />
      <BiP text={HOME_FINAL.body} className="mx-auto mt-3 max-w-[46ch] text-[16px] text-ink-soft" />
      <div className="mx-auto mt-6 grid max-w-[520px] gap-2.5 sm:grid-cols-2">
        <a href="#trips" className="home-btn-primary">
          {pick({ en: 'See open trips', th: 'ดูทริปที่เปิดรับ' })}
        </a>
        <a href={FACEBOOK_MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="home-btn-ghost justify-center">
          {pick(HOME_FINAL.ctaChat)}
        </a>
      </div>
    </Bleed>
  )
}
