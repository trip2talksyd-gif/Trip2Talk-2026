import { Link } from 'react-router-dom'
import {
  Check,
  CircleDot,
  Crosshair,
  Grid3x3,
  Square,
  SunMedium,
  type LucideIcon,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  CAMERA_GEAR,
  CAMERA_METERING_MODES,
  CAMERA_SETTINGS,
} from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import BiText from '../../components/ui/BiText'

const METERING_ICONS: Record<(typeof CAMERA_METERING_MODES)[number]['id'], LucideIcon> = {
  multi: Grid3x3,
  center: CircleDot,
  average: Square,
  highlight: SunMedium,
  spot: Crosshair,
}

export default function CameraGuidePage() {
  const { tt } = useLang()
  const backBi = tt('photoGuide.back')
  const eyebrowBi = tt('photoGuide.camera.eyebrow')
  const titleBi = tt('photoGuide.camera.title')
  const subBi = tt('photoGuide.camera.sub')
  const examplesBi = tt('photoGuide.camera.examples')
  const disclaimerBi = tt('photoGuide.camera.disclaimer')
  const gearBi = tt('photoGuide.camera.gear')
  const meteringTitleBi = tt('photoGuide.camera.metering.title')
  const meteringIntroBi = tt('photoGuide.camera.metering.intro')
  const bestForBi = tt('photoGuide.camera.metering.bestFor')
  const menuBi = tt('photoGuide.camera.metering.menu')
  const swipeBi = tt('photoGuide.camera.metering.swipe')
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
          className="mt-2 max-w-2xl text-base leading-[1.65] text-ink"
          thClassName="mt-1.5 block font-thai text-[14px] font-medium leading-[1.65] text-ink-soft"
        />
      </header>

      <div>
        <p className="mb-1.5 text-[12.5px] font-bold uppercase tracking-[0.04em] text-teal-700">
          {examplesBi.en}
          <span className="mt-0.5 block font-thai text-[11.5px] font-medium normal-case tracking-normal text-ink-soft">
            {examplesBi.th}
          </span>
        </p>
        <PhotoSlideshow slides={slides} />
      </div>

      <div className="hide-scrollbar -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr>
              {tableHeads.map((head) => (
                <th
                  key={head.en}
                  className="border-b-2 border-line px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-soft"
                >
                  {head.en}
                  <span className="mt-0.5 block font-thai text-[10.5px] font-medium normal-case tracking-normal text-ink-soft">
                    {head.th}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMERA_SETTINGS.map((row) => (
              <tr key={row.sceneEn} className="border-b border-line align-top last:border-b-0">
                <td className="whitespace-nowrap px-3 py-3.5 text-[13.5px] font-bold leading-snug text-ink">
                  {row.sceneEn}
                  <span className="mt-1 block font-thai text-[12.5px] font-medium text-ink-soft">
                    {row.sceneTh}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-[13.5px] font-bold text-teal-700">{row.f}</td>
                <td className="px-3 py-3.5 text-[13.5px] text-ink">{row.shutter}</td>
                <td className="px-3 py-3.5 text-[13.5px] text-ink">{row.iso}</td>
                <td className="px-3 py-3.5 text-[12.5px] leading-[1.6] text-ink">
                  {row.noteEn}
                  <span className="mt-1 block font-thai text-[12px] font-medium leading-[1.6] text-ink-soft">
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
        className="!mt-1.5 text-[12.5px] leading-[1.55] text-ink-soft"
        thClassName="mt-0.5 block font-thai text-[11.5px] font-medium text-ink-soft"
      />

      <section>
        <BiText
          as="h2"
          en={meteringTitleBi.en}
          th={meteringTitleBi.th}
          serif
          className="text-lg text-ink sm:text-xl"
          thClassName="mt-0.5 block font-thai text-[13.5px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={meteringIntroBi.en}
          th={meteringIntroBi.th}
          className="mt-1.5 max-w-2xl text-[15px] leading-[1.65] text-ink"
          thClassName="mt-1 block font-thai text-[14px] font-medium leading-[1.65] text-ink-soft"
        />
        <p className="mt-3 text-[12.5px] font-semibold text-teal-700 sm:hidden">
          {swipeBi.en}
          <span className="mt-0.5 block font-thai text-[11.5px] font-medium text-ink-soft">
            {swipeBi.th}
          </span>
        </p>

        {/* Mobile: thumb-scroll snap cards · sm+: responsive grid */}
        <div className="hide-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {CAMERA_METERING_MODES.map((mode) => {
            const Icon = METERING_ICONS[mode.id]
            return (
              <article
                key={mode.id}
                className="w-[min(82vw,300px)] shrink-0 snap-start rounded-[14px] border border-line bg-card p-4 pb-5 shadow-[0_8px_18px_-12px_rgba(15,28,30,0.25)] sm:w-auto sm:p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-cream">
                  <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </span>
                <BiText
                  as="h3"
                  en={mode.nameEn}
                  th={mode.nameTh}
                  className="mt-2.5 text-[15.5px] font-semibold leading-snug text-ink"
                  thClassName="mt-1 block font-thai text-[14px] font-medium text-ink-soft"
                />
                <BiText
                  as="p"
                  en={mode.bodyEn}
                  th={mode.bodyTh}
                  className="mt-1.5 text-[15px] leading-[1.65] text-ink"
                  thClassName="mt-1 block font-thai text-[14px] font-medium leading-[1.65] text-ink-soft"
                />

                <div className="mt-3 rounded-[10px] bg-mint-100 px-3 py-2.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-coral">
                    {bestForBi.en}
                    <span className="ml-1.5 font-thai text-[10.5px] normal-case tracking-normal text-coral/90">
                      {bestForBi.th}
                    </span>
                  </p>
                  <BiText
                    as="p"
                    en={mode.bestEn}
                    th={mode.bestTh}
                    className="mt-1 text-[14.5px] leading-[1.6] text-ink"
                    thClassName="mt-0.5 block font-thai text-[13.5px] font-medium leading-[1.6] text-ink"
                  />
                </div>

                <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.05em] text-teal-700">
                  {menuBi.en}
                  <span className="ml-1.5 font-thai text-[10.5px] normal-case tracking-normal text-teal-700/90">
                    {menuBi.th}
                  </span>
                </p>
                <p className="mt-1 break-words font-mono text-[12.5px] leading-[1.55] text-ink">
                  {mode.menuPath}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section>
        <BiText
          as="h2"
          en={gearBi.en}
          th={gearBi.th}
          serif
          className="text-lg text-ink sm:text-xl"
          thClassName="mt-0.5 block font-thai text-[13.5px] font-medium text-ink-soft"
        />
        <ul className="mt-3 grid gap-[11px] sm:grid-cols-2">
          {CAMERA_GEAR.map((item) => (
            <li key={item.en} className="flex items-start gap-2 text-[14px] leading-[1.55]">
              <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] bg-mint-100 text-teal-700">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <BiText
                en={item.en}
                th={item.th}
                className="font-semibold text-ink"
                thClassName="mt-0.5 block font-thai text-[13px] font-medium text-ink-soft"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
