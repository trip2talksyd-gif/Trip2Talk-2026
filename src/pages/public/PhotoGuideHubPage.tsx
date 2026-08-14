import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoThumbSrc } from '../../data/galleryPhotos'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import BiText from '../../components/ui/BiText'

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
      'Flattering poses our photographers use every trip, plus what colors to wear each season so you pop against the landscape.',
    bodyTh:
      'ท่าโพสที่ช่างภาพใช้ทุกทริป และโทนเสื้อผ้าตามฤดูกาลให้ตัดกับวิว',
    photoId: 'syd-015',
  },
  {
    to: '/photo-guide/camera',
    badgeEn: '7 scenes · 5 modes',
    badgeTh: '7 ฉาก · 5 โหมด',
    badgeClass: 'bg-teal-800',
    tagEn: 'For beginner photographers',
    tagTh: 'มือใหม่กล้องใหญ่',
    titleEn: 'Camera Settings Guide',
    titleTh: 'คู่มือตั้งค่ากล้อง',
    bodyEn:
      'Aperture, shutter & ISO cheat-sheet — plus metering modes for morning light through to stars, Milky Way and aurora.',
    bodyTh:
      'รูรับแสง ชัตเตอร์ ISO และโหมดวัดแสง จากแสงเช้าถึงดาว ทางช้างเผือก และแสงใต้',
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
    bodyEn: 'Simple landscape and portrait tips using just your phone — no extra gear needed.',
    bodyTh: 'เทคนิคทิวทัศน์และพอร์ตเทรตด้วยมือถือ ไม่ต้องมีอุปกรณ์เพิ่ม',
    photoId: 'nsw-010',
  },
] as const

export default function PhotoGuideHubPage() {
  const { tt } = useLang()
  const badgeBi = tt('photoGuide.hub.badge')
  const titleBi = tt('photoGuide.hub.title')
  const subBi = tt('photoGuide.hub.subtitle')
  const readBi = tt('photoGuide.readGuide')
  const albumTitleBi = tt('photoGuide.hub.albumTitle')
  const albumSubBi = tt('photoGuide.hub.albumSub')
  const dragBi = tt('photoGuide.hub.dragHint')
  const fromRoadBi = tt('photoGuide.fromTheRoad')

  const album = galleryByIds(['nz-001', 'nz-013', 'nz-014', 'tas-002', 'tas-003', 'syd-009', 'syd-011'])
  const slides = album.slice(0, 6).map((photo) => ({
    photo,
    sceneEn: fromRoadBi.en,
    sceneTh: fromRoadBi.th,
    titleEn: albumTitleBi.en,
    titleTh: albumTitleBi.th,
    meta: photo.id,
  }))

  return (
    <div className="space-y-8 pb-4">
      <header className="text-center">
        <span className="mb-3.5 inline-flex flex-col items-center gap-0.5 rounded-full bg-mint-100 px-3.5 py-[7px] text-[11.5px] font-bold text-teal-800">
          <span>✨ {badgeBi.en}</span>
          <span className="font-thai text-[10px] font-medium opacity-85">{badgeBi.th}</span>
        </span>
        <BiText
          as="h1"
          en={titleBi.en}
          th={titleBi.th}
          serif
          className="mt-2 text-[22px] text-ink sm:text-3xl"
          thClassName="mt-1 block font-thai text-[13px] font-medium text-ink-soft sm:text-[15px]"
        />
        <BiText
          as="p"
          en={subBi.en}
          th={subBi.th}
          className="mx-auto mt-1 max-w-lg text-[13.5px] leading-relaxed text-ink-soft"
          thClassName="mt-1 block font-thai text-[12px] font-medium text-ink-soft/90"
        />
      </header>

      <div className="grid gap-[22px] md:grid-cols-3">
        {HUB_CARDS.map((card) => {
          const photo = GALLERY_PHOTOS.find((p) => p.id === card.photoId) ?? GALLERY_PHOTOS[0]
          return (
            <Link
              key={card.to}
              to={card.to}
              className="group relative block overflow-hidden rounded-[18px] border border-line bg-card text-inherit shadow-mockup transition-[transform,box-shadow] duration-[180ms] ease-out hover:-translate-y-[5px] hover:shadow-[0_26px_50px_-20px_rgba(15,28,30,0.45)]"
            >
              <span
                className={`absolute left-3.5 top-3.5 z-[2] flex flex-col rounded-[10px] px-3 py-1.5 text-[10px] font-extrabold leading-tight text-cream shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)] ${card.badgeClass}`}
              >
                <span>{card.badgeEn}</span>
                <span className="font-thai text-[9px] font-medium opacity-90">{card.badgeTh}</span>
              </span>
              <img
                src={photoThumbSrc(photo, { width: 720, quality: 70, format: 'webp' })}
                alt={`${card.titleEn} / ${card.titleTh}`}
                className="h-[150px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="px-5 pb-[22px] pt-[18px]">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.05em] text-teal-600">
                  {card.tagEn}
                  <span className="ml-1.5 font-thai normal-case tracking-normal opacity-85">
                    {card.tagTh}
                  </span>
                </p>
                <BiText
                  as="h2"
                  en={card.titleEn}
                  th={card.titleTh}
                  serif
                  className="mt-1.5 text-[15px] text-ink"
                  thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
                />
                <BiText
                  as="p"
                  en={card.bodyEn}
                  th={card.bodyTh}
                  className="mb-3.5 mt-2 text-[12px] leading-relaxed text-ink-soft"
                  thClassName="mt-1 block font-thai text-[11px] font-medium text-ink-soft/90"
                />
                <span className="inline-flex flex-col text-[11.5px] font-bold text-ink">
                  <span>{readBi.en}</span>
                  <span className="font-thai text-[10px] font-medium opacity-85">{readBi.th}</span>
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <section>
        <BiText
          as="h2"
          en={albumTitleBi.en}
          th={albumTitleBi.th}
          serif
          className="text-[15.5px] text-ink sm:text-lg"
          thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={albumSubBi.en}
          th={albumSubBi.th}
          className="mt-1 text-xs text-ink-soft"
          thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft/90"
        />
        <PhotoSlideshow slides={slides} className="mt-2.5" />
        <p className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-ink-soft">
          <span>{dragBi.en}</span>
          <span className="font-thai text-[10px] font-medium opacity-85">{dragBi.th}</span>
        </p>
      </section>
    </div>
  )
}
