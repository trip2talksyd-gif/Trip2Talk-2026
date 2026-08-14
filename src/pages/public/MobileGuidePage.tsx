import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { enabledSocialProfiles } from '../../data/contactChannels'
import { MOBILE_LANDSCAPE_TIPS, MOBILE_PORTRAIT_TIPS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import MobileAnglesSection from '../../components/photoGuide/MobileAnglesSection'
import { photoThumbSrc } from '../../data/galleryPhotos'
import BiText from '../../components/ui/BiText'

const DOT_COLORS = ['#20363c', '#e2734a', '#e8935a', '#2e4d53'] as const

const LANDSCAPE_ICONS = ['▦', '☀', '🔍', '🌙', '↗', '📐'] as const
const PORTRAIT_ICONS = ['👤', '🌤', '🙂', '🖼', '🧼', '🎞'] as const

const ALBUM_IDS = [
  'syd-009',
  'nsw-010',
  'nz-013',
  'tas-003',
  'syd-015',
  'nsw-008',
  'nz-014',
] as const

const HERO_SLIDE_META = [
  {
    sceneEn: 'Landscape',
    sceneTh: 'ทิวทัศน์',
    tipEn: 'Grid lines + leading lines',
    tipTh: 'เส้นกริด + เส้นนำสายตา',
  },
  {
    sceneEn: 'Portrait',
    sceneTh: 'พอร์ตเทรต',
    tipEn: 'Golden hour + Portrait mode',
    tipTh: 'แสงทอง + โหมดบุคคล',
  },
  {
    sceneEn: 'Landscape',
    sceneTh: 'ทิวทัศน์',
    tipEn: 'HDR mode + low angle',
    tipTh: 'HDR + มุมต่ำ',
  },
  {
    sceneEn: 'Portrait',
    sceneTh: 'พอร์ตเทรต',
    tipEn: 'Burst mode + natural framing',
    tipTh: 'ถ่ายต่อเนื่อง + จัดเฟรม',
  },
  {
    sceneEn: 'Landscape',
    sceneTh: 'ทิวทัศน์',
    tipEn: 'Tap-to-focus + exposure lock',
    tipTh: 'แตะโฟกัส + ล็อกแสง',
  },
  {
    sceneEn: 'Portrait',
    sceneTh: 'พอร์ตเทรต',
    tipEn: 'Burst mode + off-centre framing',
    tipTh: 'ถ่ายต่อเนื่อง + นอกกลางเฟรม',
  },
] as const

function TipTimeline({
  tips,
  icons,
  colorOffset = 0,
}: {
  tips: typeof MOBILE_LANDSCAPE_TIPS | typeof MOBILE_PORTRAIT_TIPS
  icons: readonly string[]
  colorOffset?: number
}) {
  return (
    <div className="tip-timeline">
      {tips.map((tip, i) => {
        const color = DOT_COLORS[(i + colorOffset) % DOT_COLORS.length]
        return (
          <div key={tip.en} className="tt-row">
            <span className="tt-dot" style={{ background: color }} aria-hidden />
            <div className="tt-card">
              <span className="tt-ic" style={{ background: color }} aria-hidden>
                {icons[i % icons.length]}
              </span>
              <div className="tt-txt">
                <b>
                  {tip.en}
                  <span className="mt-0.5 block font-thai text-[10.5px] font-medium text-ink-soft">
                    {tip.th}
                  </span>
                </b>
                <span>
                  {tip.enBody}
                  <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft/90">
                    {tip.thBody}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GuideFollowSocial() {
  const { tt } = useLang()
  const followBi = tt('photoGuide.follow')
  const socials = enabledSocialProfiles()
  if (socials.length === 0) return null

  return (
    <section className="guide-follow" aria-label="Follow Trip2Talk">
      <h3>
        {followBi.en}
        <span className="th">{followBi.th}</span>
      </h3>
      <div className="social-row">
        {socials.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={`social-tile ${social.tile}`}
            >
              <span className="fold" aria-hidden />
              <Icon />
              <span className="label">{social.label}</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}

export default function MobileGuidePage() {
  const { tt } = useLang()
  const backBi = tt('photoGuide.back')
  const eyebrowBi = tt('photoGuide.mobile.eyebrow')
  const titleBi = tt('photoGuide.mobile.title')
  const subBi = tt('photoGuide.mobile.sub')
  const albumBi = tt('gallery.exampleAlbum')
  const swipeBi = tt('photoGuide.swipeMore')
  const landscapeBi = tt('photoGuide.mobile.landscape')
  const portraitBi = tt('photoGuide.mobile.portrait')

  const album = galleryByIds([...ALBUM_IDS])
  const portraits = galleryByIds([
    'syd-015',
    'nsw-006',
    'nsw-007',
    'syd-012',
    'syd-011',
    'nsw-008',
  ])

  const slides = album.slice(0, 6).map((photo, i) => {
    const meta = HERO_SLIDE_META[i % HERO_SLIDE_META.length]
    return {
      photo,
      sceneEn: meta.sceneEn,
      sceneTh: meta.sceneTh,
      titleEn: photo.caption_en,
      titleTh: photo.caption_th,
      meta: `${photo.location} · ${meta.tipEn} / ${meta.tipTh}`,
    }
  })

  return (
    <div className="space-y-0 pb-4">
      <Link
        to="/photo-guide"
        className="mb-4 inline-flex flex-col text-[11.5px] font-bold text-teal-700 no-underline"
      >
        <span>← {backBi.en}</span>
        <span className="font-thai text-[10px] font-medium opacity-85">{backBi.th}</span>
      </Link>

      <header className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          {eyebrowBi.en}
          <span className="ml-1.5 font-thai normal-case tracking-normal opacity-85">
            {eyebrowBi.th}
          </span>
        </p>
        <BiText
          as="h1"
          en={titleBi.en}
          th={titleBi.th}
          serif
          className="mt-1.5 text-[22px] text-ink sm:text-3xl"
          thClassName="mt-1 block font-thai text-[15px] font-medium text-ink-soft sm:text-lg"
        />
        <BiText
          as="p"
          en={subBi.en}
          th={subBi.th}
          className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft"
          thClassName="mt-1.5 block font-thai text-[12.5px] font-medium text-ink-soft/90"
        />
      </header>

      <div className="old-album-wrap">
        <div className="oa-label">
          <div>
            <b>
              {albumBi.en}
              <span className="oa-sub">{albumBi.th}</span>
            </b>
          </div>
          <small>
            {swipeBi.en}
            <span className="block font-thai text-[9px] font-medium opacity-85">{swipeBi.th}</span>
          </small>
        </div>
        <div className="gallery-scroll-wrap">
          <div className="gallery-scroll">
            {album.map((photo) => (
              <img
                key={photo.id}
                src={photoThumbSrc(photo, { width: 720, quality: 70, format: 'webp' })}
                alt={`${photo.caption_en} / ${photo.caption_th}`}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      <PhotoSlideshow slides={slides} className="mb-1" />

      <div className="mt-4 grid gap-[30px] lg:grid-cols-2">
        <section className="min-w-0">
          <h2 className="m-0 font-serif text-sm text-ink">
            {landscapeBi.en}
            <span className="mt-0.5 block font-thai text-[11px] font-medium text-teal-700">
              {landscapeBi.th}
            </span>
          </h2>
          <TipTimeline tips={MOBILE_LANDSCAPE_TIPS} icons={LANDSCAPE_ICONS} />
        </section>

        <section className="min-w-0">
          <h2 className="m-0 font-serif text-sm text-ink">
            {portraitBi.en}
            <span className="mt-0.5 block font-thai text-[11px] font-medium text-teal-700">
              {portraitBi.th}
            </span>
          </h2>
          {portraits.length > 0 && (
            <div className="mini-portrait-gallery">
              {portraits.map((photo) => (
                <img
                  key={photo.id}
                  src={photoThumbSrc(photo, { width: 480, quality: 68, format: 'webp' })}
                  alt={`${photo.caption_en} / ${photo.caption_th}`}
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <TipTimeline
            tips={MOBILE_PORTRAIT_TIPS}
            icons={PORTRAIT_ICONS}
            colorOffset={1}
          />
        </section>
      </div>

      <MobileAnglesSection />

      <GuideFollowSocial />
    </div>
  )
}
