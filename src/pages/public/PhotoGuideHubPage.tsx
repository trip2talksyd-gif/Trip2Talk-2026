import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

const HUB_CARDS = [
  {
    to: '/photo-guide/posing',
    badgeEn: '6 tips',
    badgeTh: '6 เทคนิค',
    badgeClass: 'bg-coral',
    tagEn: 'For travelers',
    tagTh: 'สายโพส',
    titleEn: 'Posing & Styling Guide',
    titleTh: 'คู่มือโพสท่า & แต่งตัว',
    bodyEn:
      'Flattering poses our photographers use every trip, plus what colours to wear each season.',
    bodyTh: 'ท่าโพสที่ช่างภาพใช้ทุกทริป และโทนเสื้อผ้าตามฤดูกาล',
    photoId: 'syd-015',
  },
  {
    to: '/photo-guide/camera',
    badgeEn: '7 scenes',
    badgeTh: '7 ฉาก',
    badgeClass: 'bg-teal-800',
    tagEn: 'For beginner photographers',
    tagTh: 'มือใหม่กล้องใหญ่',
    titleEn: 'Camera Settings Guide',
    titleTh: 'คู่มือตั้งค่ากล้อง',
    bodyEn: 'Aperture, shutter & ISO from morning light through stars, Milky Way and aurora.',
    bodyTh: 'รูรับแสง ชัตเตอร์ และ ISO จากแสงเช้าถึงดาว ทางช้างเผือก และแสงใต้',
    photoId: 'nz-001',
  },
  {
    to: '/photo-guide/mobile',
    badgeEn: 'Free',
    badgeTh: 'ฟรี',
    badgeClass: 'bg-teal-600',
    tagEn: 'For everyone',
    tagTh: 'ใช้มือถือ',
    titleEn: 'Mobile Photography Guide',
    titleTh: 'คู่มือถ่ายภาพด้วยมือถือ',
    bodyEn: 'Landscape and portrait tips using just your phone — no extra gear needed.',
    bodyTh: 'เทคนิคทิวทัศน์และพอร์ตเทรตด้วยมือถือ ไม่ต้องมีอุปกรณ์เพิ่ม',
    photoId: 'nsw-010',
  },
] as const

export default function PhotoGuideHubPage() {
  const { lang } = useLang()
  const album = galleryByIds(['nz-001', 'nz-013', 'nz-014', 'tas-002', 'tas-003', 'syd-009', 'syd-011'])
  const slides = album.slice(0, 6).map((photo, i) => ({
    photo,
    sceneEn: 'From the road',
    sceneTh: 'จากทริปจริง',
    titleEn: 'Example album from Saen & team',
    titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
    meta: photo.id,
  }))

  return (
    <div className="space-y-8 pb-4">
      <header className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600">
          Let&apos;s Learn and Practice
        </p>
        <h1 className="mt-2 font-serif text-3xl text-ink">
          {lang === 'th' ? 'คลังเคล็ดลับถ่ายภาพ' : 'Photo Guide'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          {lang === 'th'
            ? 'มาเรียนรู้และฝึกฝนไปด้วยกัน — ลิงก์จากหน้าแรกและหน้าเตรียมตัว ไม่ใช่แท็บใหม่ในเมนูล่าง'
            : 'Tied to Trip2Talk’s tagline — linked from Home and Trip Prep, not a new bottom-nav icon.'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {HUB_CARDS.map((card) => {
          const photo = GALLERY_PHOTOS.find((p) => p.id === card.photoId) ?? GALLERY_PHOTOS[0]
          return (
            <Link
              key={card.to}
              to={card.to}
              className="group relative overflow-hidden rounded-2xl border border-line bg-cream shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <span
                className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold text-cream shadow ${card.badgeClass}`}
              >
                {lang === 'th' ? card.badgeTh : card.badgeEn}
              </span>
              <img
                src={photoSrc(photo)}
                alt={card.titleEn}
                className="aspect-[5/3.4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                  {lang === 'th' ? card.tagTh : card.tagEn}
                </p>
                <h2 className="mt-1 font-serif text-lg text-ink">
                  {lang === 'th' ? card.titleTh : card.titleEn}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {lang === 'th' ? card.bodyTh : card.bodyEn}
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-teal-700">
                  {lang === 'th' ? 'อ่านคู่มือ →' : 'Read guide →'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <section>
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'อัลบั้มรูปจากพี่แสน' : 'Photos from Saen'}
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          {lang === 'th'
            ? 'ตัวอย่างอัลบั้มจากพี่แสนและทีม — ปัดหรือดูสไลด์ด้านล่าง'
            : 'Example album from Saen & team — auto-crossfade below'}
        </p>
        <PhotoSlideshow slides={slides} className="mt-3" />
      </section>
    </div>
  )
}
