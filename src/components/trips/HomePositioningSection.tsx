import { Aperture, Camera, Sparkles } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import BiText from '../ui/BiText'

const PILLARS = [
  { icon: Camera, titleKey: 'home.positioning.pillar1.title', descKey: 'home.positioning.pillar1.desc' },
  { icon: Aperture, titleKey: 'home.positioning.pillar2.title', descKey: 'home.positioning.pillar2.desc' },
  { icon: Sparkles, titleKey: 'home.positioning.pillar3.title', descKey: 'home.positioning.pillar3.desc' },
] as const

/** Positioning statement — we sell photo packages, not sightseeing tours. */
export default function HomePositioningSection() {
  const { tt } = useLang()
  const title = tt('home.positioning.title')
  const subtitle = tt('home.positioning.subtitle')
  const body = tt('home.positioning.body')
  const note = tt('home.positioning.note')

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-mint-100 px-4 py-10 sm:px-6 sm:py-12 md:px-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-teal-600/25 bg-card shadow-mockup">
        <div className="border-b border-teal-600/15 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 px-5 py-7 sm:px-8 sm:py-8 md:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-300">
            Trip2Talk
            <span className="mt-0.5 block font-thai text-[9px] font-bold normal-case tracking-normal text-teal-200/90">
              Photo trips · ทริปถ่ายภาพ
            </span>
          </p>
          <BiText
            as="h2"
            en={title.en}
            th={title.th}
            serif
            className="mt-3 text-2xl font-semibold tracking-tight text-cream sm:text-3xl md:text-[40px]"
            thClassName="mt-1.5 block font-thai text-base font-medium text-teal-200 sm:text-lg"
          />
          <BiText
            as="p"
            en={subtitle.en}
            th={subtitle.th}
            className="mt-3 max-w-xl text-[15px] font-semibold leading-snug text-peach sm:text-base"
            thClassName="mt-1 block font-thai text-[13px] font-medium text-peach/90 sm:text-[14px]"
          />
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-7 md:px-10">
          <p className="text-[13.5px] leading-[1.75] text-ink-soft sm:text-sm">{body.en}</p>
          <p className="mt-3 font-thai text-[13px] leading-[1.75] text-ink-soft/90 sm:text-[13.5px]">
            {body.th}
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {PILLARS.map(({ icon: Icon, titleKey, descKey }) => {
              const pTitle = tt(titleKey)
              const pDesc = tt(descKey)
              return (
                <li
                  key={titleKey}
                  className="rounded-2xl border border-line bg-mint-100/70 px-4 py-4"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-cream">
                    <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </span>
                  <BiText
                    as="p"
                    en={pTitle.en}
                    th={pTitle.th}
                    className="mt-3 text-[13px] font-semibold text-ink"
                    thClassName="mt-0.5 block font-thai text-[11px] font-medium text-teal-700"
                  />
                  <BiText
                    as="p"
                    en={pDesc.en}
                    th={pDesc.th}
                    className="mt-1.5 text-[12px] leading-relaxed text-ink-soft"
                    thClassName="mt-1 block font-thai text-[11px] leading-relaxed text-ink-soft/85"
                  />
                </li>
              )
            })}
          </ul>

          <p className="mt-6 border-t border-line pt-5 text-[12.5px] leading-relaxed text-ink-soft italic sm:text-[13px]">
            {note.en}
            <span className="mt-1.5 block font-thai not-italic text-[12px] leading-relaxed text-ink-soft/90">
              {note.th}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
