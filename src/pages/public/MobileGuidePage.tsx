import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

const LANDSCAPE_TIPS = [
  { en: 'Use grid lines + leading lines', th: 'เปิดเส้นกริด + เส้นนำสายตา' },
  { en: 'Keep the horizon level', th: 'ตั้งเส้นขอบฟ้าให้ตรง' },
  { en: 'Shoot during golden / blue hour', th: 'ถ่ายช่วงแสงทองหรือฟ้าคราม' },
  { en: 'Tap to focus on the mid-ground', th: 'แตะโฟกัสที่ระยะกลาง' },
]

const PORTRAIT_TIPS = [
  { en: 'Face soft light, not harsh sun', th: 'หันหน้าเข้าหาแสงนุ่ม ไม่ใช่แดดจัด' },
  { en: 'Leave space in the direction of gaze', th: 'เว้นที่ว่างทางที่สายตามอง' },
  { en: 'Portrait mode sparingly — keep edges clean', th: 'โหมดพอร์ตเทรตพอประมาณ ขอบภาพให้สะอาด' },
  { en: 'Get closer than you think', th: 'เข้าใกล้กว่าที่คิด' },
]

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

  return (
    <div className="space-y-6 pb-4">
      <Link
        to="/photo-guide"
        className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 no-underline"
      >
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
        <span className="font-thai text-[11px] font-medium opacity-85">
          {lang === 'th' ? 'Back to Photo Guide' : 'กลับไปหน้าคลังเคล็ดลับ'}
        </span>
      </Link>

      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          Photo Guide · Mobile
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือถ่ายภาพด้วยมือถือ' : 'Mobile Photography Guide'}
        </h1>
      </header>

      <section>
        <p className="mb-2 text-sm font-bold text-ink">
          {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
        </p>
        <PhotoSlideshow slides={slides} />
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg text-ink">
            {lang === 'th' ? 'ทิวทัศน์' : 'Landscape'}
          </h2>
          <ol className="relative mt-4 space-y-4 border-l border-dashed border-line pl-5">
            {LANDSCAPE_TIPS.map((tip, i) => (
              <li key={tip.en} className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-ink">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-ink">{lang === 'th' ? tip.th : tip.en}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">
            {lang === 'th' ? 'พอร์ตเทรต' : 'Portrait'}
          </h2>
          <ol className="relative mt-4 space-y-4 border-l border-dashed border-coral/40 pl-5">
            {PORTRAIT_TIPS.map((tip, i) => (
              <li key={tip.en} className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-cream">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-ink">{lang === 'th' ? tip.th : tip.en}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
