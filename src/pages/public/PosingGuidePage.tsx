import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { POSING_TIPS, SEASON_CARDS } from '../../data/photoGuideContent'
import { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { photoSrc } from '../../data/galleryPhotos'
import BiText from '../../components/ui/BiText'

export default function PosingGuidePage() {
  const { tt } = useLang()
  const backBi = tt('photoGuide.back')
  const eyebrowBi = tt('photoGuide.posing.eyebrow')
  const titleBi = tt('photoGuide.posing.title')
  const subBi = tt('photoGuide.posing.sub')
  const albumBi = tt('gallery.exampleAlbum')
  const swipeBi = tt('photoGuide.swipeMore')
  const posesBi = tt('photoGuide.posing.posesTitle')
  const seasonTitleBi = tt('photoGuide.posing.seasonTitle')
  const seasonSubBi = tt('photoGuide.posing.seasonSub')
  const quoteBi = tt('photoGuide.posing.quote')
  const quoteByBi = tt('photoGuide.posing.quoteBy')

  const album = galleryByIds(['syd-009', 'syd-011', 'syd-012', 'syd-015', 'nsw-006', 'nsw-007'])

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
          thClassName="mt-1 block font-thai text-[16px] font-medium text-ink-soft sm:text-lg"
        />
        <BiText
          as="p"
          en={subBi.en}
          th={subBi.th}
          className="mt-2 max-w-2xl text-base leading-[1.65] text-ink"
          thClassName="mt-1.5 block font-thai text-[14px] font-medium leading-[1.65] text-ink-soft"
        />
      </header>

      <div className="old-album-wrap">
        <div className="oa-label">
          <div>
            <b className="!text-[14px]">
              {albumBi.en}
              <span className="oa-sub !text-[12.5px]">{albumBi.th}</span>
            </b>
          </div>
          <small className="!text-[12px]">
            {swipeBi.en}
            <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft">
              {swipeBi.th}
            </span>
          </small>
        </div>
        <div className="gallery-scroll-wrap">
          <div className="gallery-scroll">
            {album.map((photo) => (
              <img
                key={photo.id}
                src={photoSrc(photo)}
                alt={`${photo.caption_en} / ${photo.caption_th}`}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      <section>
        <BiText
          as="h2"
          en={posesBi.en}
          th={posesBi.th}
          serif
          className="text-lg text-ink sm:text-xl"
          thClassName="mt-0.5 block font-thai text-[13.5px] font-medium text-ink-soft"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSING_TIPS.map((p) => (
            <article
              key={p.n}
              className="rounded-[14px] border border-line bg-card p-4 pb-5 shadow-[0_8px_18px_-12px_rgba(15,28,30,0.25)] sm:p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-[13px] font-extrabold text-cream">
                {p.n}
              </span>
              <BiText
                as="h3"
                en={p.titleEn}
                th={p.titleTh}
                className="mt-3 text-[15px] font-semibold leading-snug text-ink"
                thClassName="mt-1 block font-thai text-[13.5px] font-medium text-ink-soft"
              />
              <BiText
                as="p"
                en={p.bodyEn}
                th={p.bodyTh}
                className="mt-1.5 text-[13.5px] leading-[1.65] text-ink"
                thClassName="mt-1 block font-thai text-[12.5px] font-medium leading-[1.65] text-ink-soft"
              />
            </article>
          ))}
        </div>
      </section>

      <section>
        <BiText
          as="h2"
          en={seasonTitleBi.en}
          th={seasonTitleBi.th}
          serif
          className="text-lg text-ink sm:text-xl"
          thClassName="mt-0.5 block font-thai text-[13.5px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={seasonSubBi.en}
          th={seasonSubBi.th}
          className="mt-1 text-[13.5px] leading-[1.6] text-ink-soft"
          thClassName="mt-0.5 block font-thai text-[12.5px] font-medium leading-[1.6] text-ink-soft"
        />
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SEASON_CARDS.map((s) => (
            <article
              key={s.trip}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-cream`}
            >
              <p className="text-[10.5px] uppercase tracking-[0.05em] opacity-90">
                {s.monthsEn}
                <span className="mt-0.5 block font-thai text-[10px] normal-case tracking-normal opacity-95">
                  {s.monthsTh}
                </span>
              </p>
              <BiText
                as="h3"
                en={s.titleEn}
                th={s.titleTh}
                serif
                className="mb-px mt-1 text-[15px]"
                thClassName="mt-0.5 block font-thai text-[12.5px] font-medium opacity-95"
              />
              <div className="my-2.5 flex gap-1.5">
                {s.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-[6px] border-2 border-white/50"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <BiText
                as="p"
                en={s.bodyEn}
                th={s.bodyTh}
                className="text-[12px] leading-[1.55] opacity-95"
                thClassName="mt-1 block font-thai text-[11.5px] font-medium leading-[1.55] opacity-90"
              />
              <span className="mt-2.5 inline-block rounded-full bg-white/20 px-2 py-[3px] text-[10px] font-extrabold">
                {s.trip}
              </span>
            </article>
          ))}
        </div>
      </section>

      <blockquote className="relative m-0 rounded-2xl bg-teal-900 px-6 py-[22px] text-[#eafcf0]">
        <BiText
          as="p"
          en={quoteBi.en}
          th={quoteBi.th}
          className="m-0 mb-2.5 text-base italic leading-[1.7]"
          thClassName="mt-2 block font-thai text-[13.5px] font-medium not-italic opacity-95"
        />
        <footer className="text-[13px] font-bold not-italic opacity-90">
          — {quoteByBi.en}
          <span className="mt-0.5 block font-thai text-[12px] font-medium opacity-85">
            {quoteByBi.th}
          </span>
        </footer>
      </blockquote>
    </div>
  )
}
