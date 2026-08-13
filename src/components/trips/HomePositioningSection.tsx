import { Link } from 'react-router-dom'
import { Aperture, Camera, Sparkles, Star } from 'lucide-react'
import { GALLERY_PHOTOS, photoThumbSrc } from '../../data/galleryPhotos'
import { useLang } from '../../hooks/useLang'
import BiDisplayHeading from '../ui/BiDisplayHeading'
import BiText from '../ui/BiText'

const PILLARS = [
  { icon: Camera, titleKey: 'home.positioning.pillar1.title', descKey: 'home.positioning.pillar1.desc' },
  { icon: Aperture, titleKey: 'home.positioning.pillar2.title', descKey: 'home.positioning.pillar2.desc' },
  { icon: Sparkles, titleKey: 'home.positioning.pillar3.title', descKey: 'home.positioning.pillar3.desc' },
] as const

const AVATAR_IDS = ['ulu-001', 'ulu-007', 'ulu-003', 'nz-001'] as const

function AccentBadge() {
  return (
    <span
      className="mx-1.5 inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange-soft shadow-[0_8px_18px_rgba(18,47,42,0.28)] align-middle sm:mx-2 sm:h-[46px] sm:w-[46px]"
      aria-hidden
    >
      <Camera className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.1} />
    </span>
  )
}

/** Positioning statement — we sell photo packages, not sightseeing tours. */
export default function HomePositioningSection() {
  const { tt, lang } = useLang()
  const subtitle = tt('home.positioning.subtitle')
  const body = tt('home.positioning.body')
  const note = tt('home.positioning.note')
  const badge = tt('home.positioning.badge')
  const social = tt('home.positioning.social')
  const primaryCta = tt('home.showcase.cta')
  const secondaryCta = tt('nav.gallery')

  const avatars = AVATAR_IDS.map((id) => GALLERY_PHOTOS.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => p != null,
  )

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-cream px-4 py-12 sm:px-6 sm:py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Pill badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(230,147,90,0.35)] bg-amber-bg py-1.5 pl-2.5 pr-3.5 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#8a5a32]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
          {lang === 'th' ? badge.th : badge.en}
        </span>

        {/* Heading — Fraunces EN + Noto Serif Thai sibling (never nest Thai under Fraunces) */}
        <div className="mt-5 sm:mt-6">
          <h2 className="font-display text-[34px] font-bold leading-[1.06] tracking-[-0.01em] text-teal-darker sm:text-[44px] md:text-[52px]">
            We&apos;re Not a
            <AccentBadge />
            Tour Company
          </h2>
          <p className="mt-2 font-serif text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-teal-darker sm:text-[26px] md:text-[30px]">
            เราไม่ใช่
            <AccentBadge />
            บริษัททัวร์
          </p>
        </div>

        <BiDisplayHeading
          en="Small groups, good light, and photos worth keeping."
          th="กลุ่มเล็ก แสงสวย และรูปที่อยากเก็บไว้จริงๆ"
          as="p"
          thAs="p"
          className="mt-3 max-w-2xl sm:mt-4"
          enClassName="text-[18px] font-medium leading-snug text-ink-soft sm:text-[20px] md:text-[22px]"
          thClassName="mt-1 font-thai text-[15px] font-medium leading-snug text-ink-soft/90 sm:text-[16px]"
        />

        {/* Italic serif subheading — existing subtitle copy */}
        <div className="mt-4 max-w-2xl">
          <p className="font-display text-[18px] font-medium italic leading-snug text-ink-soft sm:text-[20px] md:text-[22px]">
            {subtitle.en}
          </p>
          <p className="mt-1 font-serif text-[15px] font-medium italic leading-snug text-ink-soft/90 sm:text-[16px]">
            {subtitle.th}
          </p>
        </div>

        {/* Body — unchanged copy */}
        <div className="mt-6 max-w-3xl">
          <p className="text-[13.5px] leading-[1.75] text-ink-soft sm:text-sm">{body.en}</p>
          <p className="mt-3 font-thai text-[13px] leading-[1.75] text-ink-soft/90 sm:text-[13.5px]">
            {body.th}
          </p>
        </div>

        {/* CTA row */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/trips"
            className="inline-flex items-center justify-center rounded-full bg-teal-dark px-[26px] py-[15px] text-[14px] font-bold text-white transition hover:bg-teal-darker"
          >
            {lang === 'th' ? primaryCta.th : primaryCta.en}
          </Link>
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-ink bg-transparent px-[26px] py-[15px] text-[14px] font-bold text-ink transition hover:border-teal-dark hover:text-teal-dark"
          >
            <span aria-hidden className="text-[10px] leading-none">
              ▸
            </span>
            {lang === 'th' ? secondaryCta.th : secondaryCta.en}
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center pl-1">
            {avatars.map((photo, i) => (
              <img
                key={photo.id}
                src={photoThumbSrc(photo, { width: 96, quality: 70, format: 'webp' })}
                alt=""
                width={38}
                height={38}
                className="h-[38px] w-[38px] rounded-full border-[3px] border-cream object-cover"
                style={{ marginLeft: i === 0 ? 0 : -10 }}
                loading="lazy"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p
              className={`text-[13px] font-semibold text-teal-darker ${lang === 'th' ? 'font-thai' : ''}`}
            >
              {lang === 'th' ? social.th : social.en}
            </p>
            <div className="mt-0.5 flex items-center gap-0.5" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-orange text-orange"
                  strokeWidth={0}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {PILLARS.map(({ icon: Icon, titleKey, descKey }) => {
            const pTitle = tt(titleKey)
            const pDesc = tt(descKey)
            return (
              <li
                key={titleKey}
                className="rounded-[18px] bg-white px-[18px] py-5 shadow-[0_10px_26px_rgba(18,47,42,0.07)]"
              >
                <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-amber-bg text-orange-deep">
                  <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <BiText
                  as="p"
                  en={pTitle.en}
                  th={pTitle.th}
                  className="mt-3 text-[14px] font-bold text-ink"
                  thClassName="mt-0.5 block font-thai text-[12px] font-medium text-teal-mid"
                />
                <BiText
                  as="p"
                  en={pDesc.en}
                  th={pDesc.th}
                  className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft"
                  thClassName="mt-1 block font-thai text-[11.5px] leading-relaxed text-ink-soft/85"
                />
              </li>
            )
          })}
        </ul>

        {/* Note — unchanged copy */}
        <p className="mt-8 border-t border-line pt-5 text-[12.5px] leading-relaxed text-ink-soft italic sm:text-[13px]">
          {note.en}
          <span className="mt-1.5 block font-thai not-italic text-[12px] leading-relaxed text-ink-soft/90">
            {note.th}
          </span>
        </p>
      </div>
    </section>
  )
}
