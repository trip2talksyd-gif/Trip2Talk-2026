import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CAMERA_GEAR, CAMERA_SETTINGS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

export default function CameraGuidePage() {
  const { lang } = useLang()
  const album = galleryByIds(['nz-001', 'tas-002', 'nz-013', 'nz-014', 'syd-009', 'tas-003'])
  const slides = [
    {
      photo: album[0],
      sceneEn: 'Golden Hour',
      sceneTh: 'แสงทอง',
      titleEn: 'Uluru / landscapes',
      titleTh: 'ทิวทัศน์ยามเช้า',
      meta: 'f/5.6 · 1/250s · ISO 100',
    },
    {
      photo: album[1],
      sceneEn: 'Blue Hour',
      sceneTh: 'ฟ้าคราม',
      titleEn: 'Harbour skyline',
      titleTh: 'เส้นขอบฟ้า',
      meta: 'f/5.6 · 1/20s · ISO 400',
    },
    {
      photo: album[2],
      sceneEn: 'Night Sky',
      sceneTh: 'ท้องฟ้ายามค่ำ',
      titleEn: 'Tasmania stars',
      titleTh: 'ดาวแทสเมเนีย',
      meta: 'f/2.8 · 20s · ISO 3200',
    },
    {
      photo: album[3],
      sceneEn: 'Milky Way',
      sceneTh: 'ทางช้างเผือก',
      titleEn: 'Lake Tekapo vibe',
      titleTh: 'โทนเทคาโป',
      meta: 'f/1.8 · 25s · ISO 5000',
    },
    {
      photo: album[4],
      sceneEn: 'Aurora',
      sceneTh: 'แสงใต้',
      titleEn: 'South Island night',
      titleTh: 'ท้องฟ้าเกาะใต้',
      meta: 'f/2.8 · 10s · ISO 2500',
    },
    {
      photo: album[5] ?? album[0],
      sceneEn: 'Midday',
      sceneTh: 'กลางวัน',
      titleEn: 'Coastal cliffs',
      titleTh: 'หน้าผาชายฝั่ง',
      meta: 'f/11 · 1/500s · ISO 100',
    },
  ].filter((s) => s.photo)

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
          {lang === 'th' ? 'คลังเคล็ดลับ · ตั้งค่ากล้อง' : 'Photo Guide · Camera Settings'}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือตั้งค่ากล้อง' : 'Camera Settings Guide'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          {lang === 'th'
            ? 'ค่าเริ่มต้นสำหรับมือใหม่พก DSLR/mirrorless — จากแสงเช้าถึงดาว ทางช้างเผือก และแสงใต้ในทริป NZ & แทสเมเนีย'
            : 'A starting-point cheat-sheet for beginners with a DSLR or mirrorless — morning light through stars, Milky Way and aurora on our NZ & Tasmania trips.'}
        </p>
      </header>

      <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">
        {lang === 'th'
          ? 'ตัวอย่างภาพจากทริปของพี่แสน'
          : "Example shots from Saen's trips"}
      </p>
      <PhotoSlideshow slides={slides} />

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="min-w-[640px] w-full border-collapse overflow-hidden rounded-[14px] border border-line bg-card text-left text-xs shadow-mockup">
          <thead>
            <tr className="bg-mint-100 text-[10px] uppercase tracking-wider text-ink-soft">
              <th className="px-3 py-2.5 font-semibold">
                {lang === 'th' ? 'ช่วงเวลา/ฉาก' : 'Time / scene'}
              </th>
              <th className="px-3 py-2.5 font-semibold">f</th>
              <th className="px-3 py-2.5 font-semibold">Shutter</th>
              <th className="px-3 py-2.5 font-semibold">ISO</th>
              <th className="px-3 py-2.5 font-semibold">
                {lang === 'th' ? 'หมายเหตุ' : 'Notes'}
              </th>
            </tr>
          </thead>
          <tbody>
            {CAMERA_SETTINGS.map((row) => (
              <tr key={row.sceneEn} className="border-t border-line align-top">
                <td className="px-3 py-2.5 font-medium text-ink">
                  {lang === 'th' ? row.sceneTh : row.sceneEn}
                </td>
                <td className="px-3 py-2.5 font-bold text-teal-800">{row.f}</td>
                <td className="px-3 py-2.5 text-ink">{row.shutter}</td>
                <td className="px-3 py-2.5 text-ink">{row.iso}</td>
                <td className="px-3 py-2.5 text-ink-soft">
                  {lang === 'th' ? row.noteTh : row.noteEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-soft">
        {lang === 'th'
          ? 'เป็นค่าเริ่มต้นเท่านั้น ปรับตามเลนส์และกล้องของแต่ละคน'
          : 'Starting points only — adjust for your specific lens and camera’s low-light performance.'}
      </p>

      <section>
        <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
          {lang === 'th' ? 'อุปกรณ์เบื้องต้นที่ควรมี' : 'Beginner gear checklist'}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CAMERA_GEAR.map((item) => (
            <li
              key={item.en}
              className="flex gap-2 rounded-[12px] border border-line bg-card px-3 py-2.5 text-sm text-ink"
            >
              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] bg-mint-100 text-teal-700">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <b className="font-semibold">{lang === 'th' ? item.th : item.en}</b>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
