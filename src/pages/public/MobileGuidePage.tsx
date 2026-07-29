import { Link } from 'react-router-dom'
import {
  Aperture,
  Camera,
  Crop,
  Grid3x3,
  LayoutGrid,
  Moon,
  MoveUpRight,
  Search,
  Sparkles,
  Sun,
  Sunrise,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { MOBILE_LANDSCAPE_TIPS, MOBILE_PORTRAIT_TIPS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { photoSrc } from '../../data/galleryPhotos'

/* Mockup .tt-dot / .tt-ic cycle through the four brand accents */
const DOT_COLORS = ['#20363c', '#e2734a', '#e8935a', '#2e4d53'] as const

const LANDSCAPE_ICONS: LucideIcon[] = [Grid3x3, Sun, Search, Moon, MoveUpRight, Crop]
const PORTRAIT_ICONS: LucideIcon[] = [Aperture, Sunrise, UserRound, LayoutGrid, Sparkles, Camera]

export default function MobileGuidePage() {
  const { lang } = useLang()
  const mixed = galleryByIds(['syd-009', 'nsw-010', 'nz-013', 'tas-003', 'syd-015', 'nsw-008', 'nz-014'])
  const slides = mixed.slice(0, 6).map((photo, i) => ({
    photo,
    sceneEn: i % 2 === 0 ? 'Landscape' : 'Portrait',
    sceneTh: i % 2 === 0 ? 'ทิวทัศน์' : 'พอร์ตเทรต',
    titleEn: 'Example album from Saen & team',
    titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
    meta: photo.id,
  }))
  const portraits = galleryByIds([
    'syd-015',
    'nsw-006',
    'nsw-007',
    'syd-012',
    'syd-011',
    'nsw-008',
  ])

  return (
    <div className="space-y-6 pb-4">
      <Link
        to="/photo-guide"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 no-underline"
      >
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
      </Link>

      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          {lang === 'th' ? 'คลังเคล็ดลับ · มือถือ' : 'Photo Guide · Mobile Photography'}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือถ่ายภาพด้วยมือถือ' : 'Mobile Photography Guide'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          {lang === 'th'
            ? 'ไม่ต้องมีอุปกรณ์เพิ่ม — เทคนิคทิวทัศน์และพอร์ตเทรตที่ลูกทริปใช้ได้แค่ด้วยมือถือ'
            : 'No extra gear needed — simple landscape and portrait techniques any trip customer can use with just their phone.'}
        </p>
      </header>

      <section>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-ink">
            {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
          </p>
          <small className="text-[10.5px] text-ink-soft">
            {lang === 'th' ? 'ปัดเพื่อดูเพิ่ม →' : 'Swipe for more →'}
          </small>
        </div>
        <PhotoSlideshow slides={slides} />
      </section>

      <div className="grid gap-[30px] lg:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-2 font-serif text-sm text-ink">
            {lang === 'th' ? 'ถ่ายวิว' : 'Landscape'}
          </h2>
          <div className="tip-timeline mt-4">
            {MOBILE_LANDSCAPE_TIPS.map((tip, i) => {
              const color = DOT_COLORS[i % DOT_COLORS.length]
              const Icon = LANDSCAPE_ICONS[i % LANDSCAPE_ICONS.length]
              return (
                <div key={tip.en} className="tt-row">
                  <span className="tt-dot" style={{ background: color }} aria-hidden />
                  <div className="tt-card">
                    <span className="tt-ic" style={{ background: color }} aria-hidden>
                      <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block text-[12.5px] font-bold leading-[1.3] text-ink">
                        {lang === 'th' ? tip.th : tip.en}
                      </b>
                      <span className="mt-[3px] block text-[11px] leading-[1.5] text-ink-soft">
                        {lang === 'th' ? tip.thBody : tip.enBody}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 font-serif text-sm text-ink">
            {lang === 'th' ? 'ถ่ายคน' : 'Portrait / People'}
          </h2>
          {portraits.length > 0 && (
            <div className="mini-portrait-gallery mb-4 mt-2.5">
              {portraits.map((photo) => (
                <img key={photo.id} src={photoSrc(photo)} alt="" loading="lazy" />
              ))}
            </div>
          )}
          <div className="tip-timeline mt-4">
            {MOBILE_PORTRAIT_TIPS.map((tip, i) => {
              const color = DOT_COLORS[(i + 1) % DOT_COLORS.length]
              const Icon = PORTRAIT_ICONS[i % PORTRAIT_ICONS.length]
              return (
                <div key={tip.en} className="tt-row">
                  <span className="tt-dot" style={{ background: color }} aria-hidden />
                  <div className="tt-card">
                    <span className="tt-ic" style={{ background: color }} aria-hidden>
                      <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block text-[12.5px] font-bold leading-[1.3] text-ink">
                        {lang === 'th' ? tip.th : tip.en}
                      </b>
                      <span className="mt-[3px] block text-[11px] leading-[1.5] text-ink-soft">
                        {lang === 'th' ? tip.thBody : tip.enBody}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
