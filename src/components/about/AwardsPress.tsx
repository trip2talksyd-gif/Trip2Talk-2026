import { useState } from 'react'
import { Award, Newspaper } from 'lucide-react'
import {
  FOCUS_AWARD_PHOTOS,
  PRESS_CREDITS,
  type FocusAwardCategory,
  type FocusAwardPhoto,
} from '../../data/awardsPress'
import { useLang } from '../../hooks/useLang'
import { storageImageSrc } from '../../lib/storageImage'
import BiDisplayHeading from '../ui/BiDisplayHeading'
import BiText from '../ui/BiText'

const CATEGORY_KEYS: Record<
  FocusAwardCategory,
  'about.awards.cat.seascape' | 'about.awards.cat.bw' | 'about.awards.cat.creative'
> = {
  seascape: 'about.awards.cat.seascape',
  bw: 'about.awards.cat.bw',
  creative: 'about.awards.cat.creative',
}

function AwardThumb({ photo, lang }: { photo: FocusAwardPhoto; lang: 'en' | 'th' }) {
  const [failed, setFailed] = useState(false)
  const alt = lang === 'th' ? photo.altTh : photo.altEn

  return (
    <li className="w-[70%] shrink-0 snap-center sm:w-auto">
      <div className="overflow-hidden rounded-xl border border-line bg-white/80">
        {failed ? (
          <div
            className="flex aspect-[4/3] items-center justify-center bg-teal-dark/5 px-2 text-center"
            aria-hidden
          >
            <span className="font-display text-[10px] font-medium uppercase tracking-wide text-ink-soft">
              {photo.id}
            </span>
          </div>
        ) : (
          <img
            src={storageImageSrc(photo.src)}
            alt={alt}
            width={800}
            height={600}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover object-center"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </li>
  )
}

export default function AwardsPress() {
  const { tt, lang } = useLang()
  const heading = tt('about.awards.heading')
  const stat = tt('about.awards.stat')
  const galleryLabel = tt('about.awards.gallery')
  const pressHeading = tt('about.awards.press.heading')
  const seascape = tt('about.awards.cat.seascape')
  const bw = tt('about.awards.cat.bw')
  const creative = tt('about.awards.cat.creative')

  return (
    <section className="rounded-2xl border border-line bg-cream p-5 sm:p-6">
      <BiDisplayHeading
        as="h2"
        thAs="p"
        en={heading.en}
        th={heading.th}
        enClassName="text-lg font-semibold text-teal-dark sm:text-xl"
        thClassName="mt-0.5 text-[14px] font-medium text-ink-soft"
      />

      <div className="mt-4 flex gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange"
          aria-hidden
        >
          <Award className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <BiDisplayHeading
            as="p"
            thAs="p"
            en={stat.en}
            th={stat.th}
            enClassName="text-[15px] font-semibold leading-snug text-ink sm:text-base"
            thClassName="mt-1 text-[13px] font-medium leading-normal text-ink/80"
          />
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-soft">
            <li>
              <BiText
                as="span"
                en={seascape.en}
                th={seascape.th}
                className="text-[12px] text-ink-soft"
                thClassName="mt-px block font-thai text-[11px] text-ink-soft/90"
              />
            </li>
            <li>
              <BiText
                as="span"
                en={bw.en}
                th={bw.th}
                className="text-[12px] text-ink-soft"
                thClassName="mt-px block font-thai text-[11px] text-ink-soft/90"
              />
            </li>
            <li>
              <BiText
                as="span"
                en={creative.en}
                th={creative.th}
                className="text-[12px] text-ink-soft"
                thClassName="mt-px block font-thai text-[11px] text-ink-soft/90"
              />
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700">
        {galleryLabel.en}
      </p>
      <p lang="th" className="mt-0.5 font-thai text-[11px] font-medium text-teal-700/90">
        {galleryLabel.th}
      </p>
      <ul className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible">
        {FOCUS_AWARD_PHOTOS.map((photo) => (
          <AwardThumb key={photo.id} photo={photo} lang={lang} />
        ))}
      </ul>
      <p className="sr-only">
        {FOCUS_AWARD_PHOTOS.map((p) => tt(CATEGORY_KEYS[p.category])[lang]).join(', ')}
      </p>

      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-3 flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-teal-dark" strokeWidth={2} aria-hidden />
          <BiText
            as="p"
            en={pressHeading.en}
            th={pressHeading.th}
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700"
            thClassName="mt-px block font-thai text-[10px] font-bold normal-case tracking-normal text-teal-700/90"
          />
        </div>
        <ul className="space-y-3">
          {PRESS_CREDITS.map((item) => {
            const name = tt(item.nameKey)
            const context = tt(item.contextKey)
            return (
              <li key={item.id} className="border-l-2 border-orange/70 pl-3">
                <BiDisplayHeading
                  as="p"
                  thAs="p"
                  en={name.en}
                  th={name.th}
                  enClassName="text-[13.5px] font-semibold leading-snug text-ink"
                  thClassName="mt-0.5 text-[12.5px] font-medium leading-normal text-ink/80"
                />
                <BiText
                  as="p"
                  en={context.en}
                  th={context.th}
                  className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft"
                  thClassName="mt-px block font-thai text-[12px] leading-relaxed text-ink-soft/90"
                />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
