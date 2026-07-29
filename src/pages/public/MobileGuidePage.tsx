import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { MOBILE_LANDSCAPE_TIPS, MOBILE_PORTRAIT_TIPS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { photoSrc } from '../../data/galleryPhotos'

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
  const portraits = galleryByIds(['syd-015', 'nsw-006', 'nsw-007', 'syd-012']).slice(0, 4)

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

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
            {lang === 'th' ? 'ถ่ายวิว' : 'Landscape'}
          </h2>
          <div className="relative mt-4 space-y-3 border-l border-dashed border-line pl-5">
            {MOBILE_LANDSCAPE_TIPS.map((tip, i) => (
              <div key={tip.en} className="relative rounded-[12px] border border-line bg-card p-3">
                <span className="absolute -left-[27px] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-teal-800 text-[9px] font-bold text-cream">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-ink">{lang === 'th' ? tip.th : tip.en}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {lang === 'th' ? tip.thBody : tip.enBody}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
            {lang === 'th' ? 'ถ่ายคน' : 'Portrait / People'}
          </h2>
          {portraits.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {portraits.map((photo) => (
                <img
                  key={photo.id}
                  src={photoSrc(photo)}
                  alt=""
                  className="aspect-[200/264] w-full rounded-[10px] object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <div className="relative mt-4 space-y-3 border-l border-dashed border-coral/40 pl-5">
            {MOBILE_PORTRAIT_TIPS.map((tip, i) => (
              <div key={tip.en} className="relative rounded-[12px] border border-line bg-card p-3">
                <span className="absolute -left-[27px] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-cream">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-ink">{lang === 'th' ? tip.th : tip.en}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {lang === 'th' ? tip.thBody : tip.enBody}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
