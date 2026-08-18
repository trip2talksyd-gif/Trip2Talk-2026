import { Aperture, Camera, Sparkles, Star } from 'lucide-react'
import { GALLERY_PHOTOS, photoThumbSrc } from '../../data/galleryPhotos'
import { useLang } from '../../hooks/useLang'
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
      className="mx-1.5 inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange-soft shadow-[0_8px_18px_rgba(18,47,42,0.28)] align-middle sm:mx-2 sm:h-[40px] sm:w-[40px]"
      aria-hidden
    >
      <Camera className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.1} />
    </span>
  )
}

/** Full positioning story — homepage uses the condensed block; this lives on /about. */
export default function AboutPositioningSection() {
  const { tt, lang } = useLang()
  const subtitle = tt('home.positioning.subtitle')
  const body = tt('home.positioning.body')
  const note = tt('home.positioning.note')
  const social = tt('home.positioning.social')

  const avatars = AVATAR_IDS.map((id) => GALLERY_PHOTOS.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => p != null,
  )

  return (
    <section className="rounded-2xl border border-teal-600/25 bg-cream p-5 sm:p-7">
      <div>
        <h2 className="font-display text-[26px] font-bold leading-snug text-teal-darker sm:text-[32px]">
          We&apos;re Not a
          <AccentBadge />
          Tour Company
        </h2>
        <p
          lang="th"
          className="mt-2 font-serif text-[20px] font-bold leading-normal text-teal-darker sm:text-[24px]"
        >
          เราไม่ใช่
          <AccentBadge />
          บริษัททัวร์
        </p>
      </div>

      <p className="mt-4 font-display text-[16px] font-medium italic leading-snug text-ink-soft sm:text-[18px]">
        {subtitle.en}
      </p>
      <p lang="th" className="mt-1 font-serif text-[14px] font-medium leading-normal text-ink-soft/90">
        {subtitle.th}
      </p>

      <p className="mt-5 text-[13.5px] leading-[1.75] text-ink-soft sm:text-sm">{body.en}</p>
      <p className="mt-3 font-thai text-[13px] leading-[1.75] text-ink-soft/90 sm:text-[13.5px]">{body.th}</p>

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
          <p className={`text-[13px] font-semibold text-teal-darker ${lang === 'th' ? 'font-thai' : ''}`}>
            {lang === 'th' ? social.th : social.en}
          </p>
          <div className="mt-0.5 flex items-center gap-0.5" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-orange text-orange" strokeWidth={0} aria-hidden />
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
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

      <p className="mt-8 border-t border-line pt-5 text-[12.5px] leading-relaxed text-ink-soft italic sm:text-[13px]">
        {note.en}
        <span className="mt-1.5 block font-thai not-italic text-[12px] leading-relaxed text-ink-soft/90">
          {note.th}
        </span>
      </p>
    </section>
  )
}
