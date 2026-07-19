import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { getPackingGuide } from '../../data/packingGuides'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

const SETTINGS = [
  { sceneEn: 'Morning golden hour', sceneTh: 'แสงเช้าทอง', f: 'f/4 – f/8', shutter: '1/250s', iso: '100–200', note: 'Soft warm side-light; shoot away from the sun for even skin.' },
  { sceneEn: 'Midday / harsh sun', sceneTh: 'แดดจ้าตอนกลางวัน', f: 'f/8 – f/11', shutter: '1/500s+', iso: '100', note: 'Open shade or backlit with fill to avoid harsh shadows.' },
  { sceneEn: 'Evening golden hour', sceneTh: 'แสงเย็นทอง', f: 'f/2.8 – f/5.6', shutter: '1/200s', iso: '100–400', note: 'Best portraits ~45 min before sunset.' },
  { sceneEn: 'Blue hour', sceneTh: 'ช่วงฟ้าสีคราม', f: 'f/4 – f/5.6', shutter: '1/60 – 1/15s', iso: '400–800', note: 'Tripod once shutter drops below 1/focal length.' },
  { sceneEn: 'Night sky / stars', sceneTh: 'ท้องฟ้ายามค่ำ/ดาว', f: 'f/2.8 or wider', shutter: '15–25s', iso: '1600–3200', note: '500 rule: max shutter ≈ 500 ÷ focal length.' },
  { sceneEn: 'Milky Way', sceneTh: 'ทางช้างเผือก', f: 'f/1.8 – f/2.8', shutter: '20–30s', iso: '3200–6400', note: 'New-moon nights, wide lens, focus to infinity.' },
  { sceneEn: 'Aurora Australis', sceneTh: 'แสงออโรร่า', f: 'f/2.8 or wider', shutter: '5–15s', iso: '1600–3200', note: 'Shorter shutter for fast bands; on select NZ trips.' },
]

export default function CameraGuidePage() {
  const { lang } = useLang()
  const photos = galleryByIds(['ulu-placeholder', 'nz-001', 'tas-002', 'nz-013', 'nz-014', 'syd-009'].filter(Boolean))
  // Fall back if ulu id missing
  const album = photos.length >= 4 ? photos : galleryByIds(['nz-001', 'tas-002', 'nz-013', 'nz-014', 'syd-009', 'tas-003'])
  const slides = [
    { photo: album[0], sceneEn: 'Golden Hour', sceneTh: 'แสงทอง', titleEn: 'Uluru / landscapes', titleTh: 'ทิวทัศน์ยามเช้า', meta: 'f/5.6 · 1/250s · ISO 100' },
    { photo: album[1], sceneEn: 'Blue Hour', sceneTh: 'ฟ้าคราม', titleEn: 'Harbour skyline', titleTh: 'เส้นขอบฟ้า', meta: 'f/5.6 · 1/20s · ISO 400' },
    { photo: album[2], sceneEn: 'Night Sky', sceneTh: 'ท้องฟ้ายามค่ำ', titleEn: 'Tasmania stars', titleTh: 'ดาวแทสเมเนีย', meta: 'f/2.8 · 20s · ISO 3200' },
    { photo: album[3], sceneEn: 'Milky Way', sceneTh: 'ทางช้างเผือก', titleEn: 'Lake Tekapo vibe', titleTh: 'โทนเทคาโป', meta: 'f/1.8 · 25s · ISO 5000' },
    { photo: album[4], sceneEn: 'Aurora', sceneTh: 'แสงใต้', titleEn: 'South Island night', titleTh: 'ท้องฟ้าเกาะใต้', meta: 'f/2.8 · 10s · ISO 2500' },
    { photo: album[5] ?? album[0], sceneEn: 'Midday', sceneTh: 'กลางวัน', titleEn: 'Coastal cliffs', titleTh: 'หน้าผาชายฝั่ง', meta: 'f/11 · 1/500s · ISO 100' },
  ].filter((s) => s.photo)

  const gear = getPackingGuide('NZ-6D5N').groups.find((g) => g.key === 'photo')
  const gearItems = gear
    ? gear.items.en.map((en, i) => ({ en, th: gear.items.th[i] ?? en }))
    : []
  // Extend with checklist extras from mockup
  const checklist = [
    ...gearItems,
    { en: 'Headlamp with red-light mode', th: 'ไฟคาดหัวโหมดแสงแดง' },
    { en: 'Remote shutter or self-timer', th: 'รีโมทชัตเตอร์หรือตั้งเวลาถ่าย' },
  ]

  return (
    <div className="space-y-6 pb-4">
      <Link to="/photo-guide" className="text-xs font-semibold text-teal-700">
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
      </Link>

      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          Photo Guide · Camera
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือตั้งค่ากล้อง' : 'Camera Settings Guide'}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {lang === 'th'
            ? 'ค่าเริ่มต้นสำหรับมือใหม่พก DSLR/mirrorless — จากแสงเช้าถึงดาวและแสงใต้'
            : 'Starting points for beginners with a DSLR or mirrorless — morning light through aurora.'}
        </p>
      </header>

      <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">
        {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
      </p>
      <PhotoSlideshow slides={slides} />

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="min-w-[640px] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-wider text-ink-soft">
              <th className="py-2 pr-3 font-semibold">Scene</th>
              <th className="py-2 pr-3 font-semibold">f</th>
              <th className="py-2 pr-3 font-semibold">Shutter</th>
              <th className="py-2 pr-3 font-semibold">ISO</th>
              <th className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {SETTINGS.map((row) => (
              <tr key={row.sceneEn} className="border-b border-line/70 align-top">
                <td className="py-2.5 pr-3 font-medium text-ink">
                  {lang === 'th' ? row.sceneTh : row.sceneEn}
                </td>
                <td className="py-2.5 pr-3 font-bold text-teal-800">{row.f}</td>
                <td className="py-2.5 pr-3 text-ink">{row.shutter}</td>
                <td className="py-2.5 pr-3 text-ink">{row.iso}</td>
                <td className="py-2.5 text-ink-soft">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'อุปกรณ์เบื้องต้นที่ควรมี' : 'Beginner gear checklist'}
        </h2>
        <ul className="mt-3 space-y-2">
          {checklist.map((item) => (
            <li key={item.en} className="flex gap-2 text-sm text-ink/80">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2.5} />
              <span>
                <b>{lang === 'th' ? item.th : item.en}</b>
                {lang === 'en' && (
                  <em className="mt-0.5 block font-thai text-xs not-italic text-ink-soft">{item.th}</em>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
