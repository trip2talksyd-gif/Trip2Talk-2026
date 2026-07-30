import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { enabledSocialProfiles } from '../../data/contactChannels'
import { MOBILE_LANDSCAPE_TIPS, MOBILE_PORTRAIT_TIPS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { photoSrc } from '../../data/galleryPhotos'

/* Mockup tip-timeline accent cycle */
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
  { sceneEn: 'Landscape', sceneTh: 'ทิวทัศน์', tipEn: 'Grid lines + leading lines', tipTh: 'เส้นกริด + เส้นนำสายตา' },
  { sceneEn: 'Portrait', sceneTh: 'พอร์ตเทรต', tipEn: 'Golden hour + Portrait mode', tipTh: 'แสงทอง + โหมดบุคคล' },
  { sceneEn: 'Landscape', sceneTh: 'ทิวทัศน์', tipEn: 'HDR mode + low angle', tipTh: 'HDR + มุมต่ำ' },
  { sceneEn: 'Portrait', sceneTh: 'พอร์ตเทรต', tipEn: 'Burst mode + natural framing', tipTh: 'ถ่ายต่อเนื่อง + จัดเฟรม' },
  { sceneEn: 'Landscape', sceneTh: 'ทิวทัศน์', tipEn: 'Tap-to-focus + exposure lock', tipTh: 'แตะโฟกัส + ล็อกแสง' },
  { sceneEn: 'Portrait', sceneTh: 'พอร์ตเทรต', tipEn: 'Burst mode + off-centre framing', tipTh: 'ถ่ายต่อเนื่อง + นอกกลางเฟรม' },
] as const

function TipTimeline({
  tips,
  icons,
  colorOffset = 0,
  lang,
}: {
  tips: typeof MOBILE_LANDSCAPE_TIPS | typeof MOBILE_PORTRAIT_TIPS
  icons: readonly string[]
  colorOffset?: number
  lang: 'en' | 'th'
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
                <b>{lang === 'th' ? tip.th : tip.en}</b>
                <span>{lang === 'th' ? tip.thBody : tip.enBody}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GuideFollowSocial() {
  const { lang } = useLang()
  const socials = enabledSocialProfiles()
  if (socials.length === 0) return null

  return (
    <section className="guide-follow" aria-label="Follow Trip2Talk">
      <h3>
        Follow Trip2Talk
        <span className="th">{lang === 'th' ? 'ติดตามเรา' : 'ติดตามเรา'}</span>
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
  const { lang } = useLang()
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
      meta: `${photo.location} · ${lang === 'th' ? meta.tipTh : meta.tipEn}`,
    }
  })

  return (
    <div className="space-y-0 pb-4">
      <Link
        to="/photo-guide"
        className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 no-underline"
      >
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
        <span className="font-thai text-[10px] font-medium opacity-85">
          {lang === 'en' ? ' · กลับไปหน้าคลังเคล็ดลับ' : ''}
        </span>
      </Link>

      <header className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          {lang === 'th' ? 'คลังเคล็ดลับ · มือถือ' : 'Photo Guide · Mobile Photography'}
        </p>
        <h1 className="mt-1.5 font-serif text-[22px] text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือถ่ายภาพด้วยมือถือ' : 'Mobile Photography Guide'}
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'ไม่ต้องมีอุปกรณ์เพิ่ม — เทคนิคทิวทัศน์และพอร์ตเทรตที่ลูกทริปใช้ได้แค่ด้วยมือถือ'
            : 'No extra gear needed — simple landscape and portrait techniques any trip customer can use with just their phone.'}
        </p>
      </header>

      {/* 1. Horizontal example album */}
      <div className="old-album-wrap">
        <div className="oa-label">
          <div>
            <b>
              {lang === 'th'
                ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม'
                : 'Example album from Saen & team'}
            </b>
            <span className="oa-sub">
              {lang === 'th'
                ? 'Example album from Saen & team'
                : 'อัลบั้มตัวอย่างจากพี่แสนและทีม'}
            </span>
          </div>
          <small>{lang === 'th' ? 'ปัดเพื่อดูเพิ่ม →' : 'Swipe for more →'}</small>
        </div>
        <div className="gallery-scroll-wrap">
          <div className="gallery-scroll">
            {album.map((photo) => (
              <img
                key={photo.id}
                src={photoSrc(photo)}
                alt={lang === 'th' ? photo.caption_th : photo.caption_en}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Large hero landscape slideshow + caption overlay */}
      <PhotoSlideshow slides={slides} className="mb-1" />

      {/* 3. Two-column tip lists */}
      <div className="mt-4 grid gap-[30px] lg:grid-cols-2">
        <section className="min-w-0">
          <h2 className="m-0 flex flex-wrap items-baseline gap-2 font-serif text-sm text-ink">
            {lang === 'th' ? 'ถ่ายวิว' : 'Landscape'}
            <span className="text-[11px] font-medium text-teal-700">
              {lang === 'th' ? 'Landscape' : 'ถ่ายวิว'}
            </span>
          </h2>
          <TipTimeline
            tips={MOBILE_LANDSCAPE_TIPS}
            icons={LANDSCAPE_ICONS}
            lang={lang}
          />
        </section>

        <section className="min-w-0">
          <h2 className="m-0 flex flex-wrap items-baseline gap-2 font-serif text-sm text-ink">
            {lang === 'th' ? 'ถ่ายคน' : 'Portrait / People'}
            <span className="text-[11px] font-medium text-teal-700">
              {lang === 'th' ? 'Portrait / People' : 'ถ่ายคน'}
            </span>
          </h2>
          {portraits.length > 0 && (
            <div className="mini-portrait-gallery">
              {portraits.map((photo) => (
                <img
                  key={photo.id}
                  src={photoSrc(photo)}
                  alt={lang === 'th' ? photo.caption_th : photo.caption_en}
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <TipTimeline
            tips={MOBILE_PORTRAIT_TIPS}
            icons={PORTRAIT_ICONS}
            colorOffset={1}
            lang={lang}
          />
        </section>
      </div>

      {/* 4. Follow Trip2Talk */}
      <GuideFollowSocial />
    </div>
  )
}
