import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CAMERA_GEAR, CAMERA_SETTINGS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import BiText from '../../components/ui/BiText'

export default function CameraGuidePage() {
  const { tt } = useLang()
  const backBi = tt('photoGuide.back')
  const eyebrowBi = tt('photoGuide.camera.eyebrow')
  const titleBi = tt('photoGuide.camera.title')
  const subBi = tt('photoGuide.camera.sub')
  const examplesBi = tt('photoGuide.camera.examples')
  const disclaimerBi = tt('photoGuide.camera.disclaimer')
  const gearBi = tt('photoGuide.camera.gear')
  const colScene = tt('photoGuide.camera.table.scene')
  const colAperture = tt('photoGuide.camera.table.aperture')
  const colShutter = tt('photoGuide.camera.table.shutter')
  const colIso = tt('photoGuide.camera.table.iso')
  const colNotes = tt('photoGuide.camera.table.notes')

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

  const tableHeads = [
    { en: colScene.en, th: colScene.th },
    { en: colAperture.en, th: colAperture.th },
    { en: colShutter.en, th: colShutter.th },
    { en: colIso.en, th: colIso.th },
    { en: colNotes.en, th: colNotes.th },
  ]

  return (
    <div className="space-y-6 pb-4">
      <Link
        to="/photo-guide"
        className="inline-flex flex-col text-[11.5px] font-bold text-teal-700 no-underline"
      >
        <span>← {backBi.en}</span>
        <span className="font-thai text-[10px] font-medium opacity-85">{backBi.th}</span>
      </Link>

      <header>
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
          className="mt-1 text-2xl text-ink sm:text-3xl"
          thClassName="mt-1 block font-thai text-[15px] font-medium text-ink-soft sm:text-lg"
        />
        <BiText
          as="p"
          en={subBi.en}
          th={subBi.th}
          className="mt-2 max-w-2xl text-sm text-ink-soft"
          thClassName="mt-1.5 block font-thai text-[12.5px] font-medium text-ink-soft/90"
        />
      </header>

      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-teal-700">
          {examplesBi.en}
          <span className="mt-0.5 block font-thai text-[10px] font-medium normal-case tracking-normal opacity-85">
            {examplesBi.th}
          </span>
        </p>
        <PhotoSlideshow slides={slides} />
      </div>

      <div className="hide-scrollbar -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              {tableHeads.map((head) => (
                <th
                  key={head.en}
                  className="border-b-2 border-line px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft"
                >
                  {head.en}
                  <span className="mt-0.5 block font-thai text-[9px] font-medium normal-case tracking-normal opacity-85">
                    {head.th}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMERA_SETTINGS.map((row) => (
              <tr key={row.sceneEn} className="border-b border-line align-top last:border-b-0">
                <td className="whitespace-nowrap px-3 py-[11px] text-[11.5px] font-bold text-ink">
                  {row.sceneEn}
                  <span className="mt-0.5 block font-thai text-[10.5px] font-medium text-ink-soft">
                    {row.sceneTh}
                  </span>
                </td>
                <td className="px-3 py-[11px] text-[11.5px] font-bold text-teal-700">{row.f}</td>
                <td className="px-3 py-[11px] text-[11.5px] text-ink">{row.shutter}</td>
                <td className="px-3 py-[11px] text-[11.5px] text-ink">{row.iso}</td>
                <td className="px-3 py-[11px] text-[10.5px] leading-relaxed text-ink-soft">
                  {row.noteEn}
                  <span className="mt-1 block font-thai text-[10px] font-medium text-ink-soft/90">
                    {row.noteTh}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BiText
        as="p"
        en={disclaimerBi.en}
        th={disclaimerBi.th}
        className="!mt-1.5 text-[11px] text-ink-soft"
        thClassName="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft/90"
      />

      <section>
        <BiText
          as="h2"
          en={gearBi.en}
          th={gearBi.th}
          serif
          className="text-[15.5px] text-ink sm:text-lg"
          thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
        />
        <ul className="mt-3 grid gap-[11px] sm:grid-cols-2">
          {CAMERA_GEAR.map((item) => (
            <li key={item.en} className="flex items-start gap-2 text-[12.5px] leading-[1.5]">
              <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] bg-mint-100 text-teal-700">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <BiText
                en={item.en}
                th={item.th}
                className="font-semibold text-ink"
                thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
