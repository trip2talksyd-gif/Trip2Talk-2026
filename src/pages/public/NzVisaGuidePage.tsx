import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { NZ_VISA_TUTORIAL_YOUTUBE_ID, NZ_VISITOR_VISA_URL } from '../../data/photoGuideContent'
import LazyYouTubeEmbed from '../../components/photoGuide/LazyYouTubeEmbed'
import BiText from '../../components/ui/BiText'

export default function NzVisaGuidePage() {
  const { tt } = useLang()
  const backBi = tt('photoGuide.back')
  const eyebrowBi = tt('photoGuide.nzVisa.eyebrow')
  const titleBi = tt('photoGuide.nzVisa.title')
  const subBi = tt('photoGuide.nzVisa.sub')
  const bodyBi = tt('photoGuide.nzVisa.body')
  const processTitleBi = tt('photoGuide.nzVisa.processTitle')
  const processBi = tt('photoGuide.nzVisa.process')
  const disclaimerBi = tt('photoGuide.nzVisa.disclaimer')
  const officialBi = tt('photoGuide.nzVisa.officialCta')
  const videoTitleBi = tt('photoGuide.nzVisa.videoTitle')
  const videoCreditBi = tt('photoGuide.nzVisa.videoCredit')
  const videoNoteBi = tt('photoGuide.nzVisa.videoNote')

  useEffect(() => {
    document.title = `${titleBi.en} — Trip2Talk`
    return () => {
      document.title = 'Trip2Talk'
    }
  }, [titleBi.en])

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

      <aside className="rounded-editorial border border-line bg-mint-100/80 p-4">
        <BiText
          as="p"
          en={disclaimerBi.en}
          th={disclaimerBi.th}
          className="text-sm leading-relaxed text-ink/80"
          thClassName="mt-1 block font-thai text-[12px] leading-relaxed text-ink/70"
        />
      </aside>

      <a
        href={NZ_VISITOR_VISA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-teal-700"
      >
        {officialBi.en}
        <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span className="font-thai text-[11px] font-medium opacity-85">{officialBi.th}</span>
      </a>

      <section>
        <BiText
          as="h2"
          en={videoTitleBi.en}
          th={videoTitleBi.th}
          className="text-sm font-semibold text-ink"
          thClassName="mt-0.5 block font-thai text-[12px] font-medium text-ink-soft"
        />
        <p className="mt-1 text-[11px] font-medium text-ink-soft">
          5 Steps วิธีทำวีซ่า New Zealand Online ผ่านใน 1 วัน
        </p>
        <div className="mt-2.5">
          <LazyYouTubeEmbed
            videoId={NZ_VISA_TUTORIAL_YOUTUBE_ID}
            title="5 Steps วิธีทำวีซ่า New Zealand Online ผ่านใน 1 วัน"
          />
        </div>
        <BiText
          as="p"
          en={videoCreditBi.en}
          th={videoCreditBi.th}
          className="mt-2 text-[12px] leading-relaxed text-ink-soft"
          thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft/90"
        />
        <BiText
          as="p"
          en={videoNoteBi.en}
          th={videoNoteBi.th}
          className="mt-1.5 text-[12px] leading-relaxed text-ink-soft"
          thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft/90"
        />
      </section>

      <BiText
        as="p"
        en={bodyBi.en}
        th={bodyBi.th}
        className="max-w-2xl text-[15px] leading-[1.7] text-ink"
        thClassName="mt-2 block font-thai text-[14px] font-medium leading-[1.7] text-ink-soft"
      />

      <section className="rounded-[14px] border border-line bg-card p-4 shadow-[0_8px_18px_-12px_rgba(15,28,30,0.25)] sm:p-5">
        <BiText
          as="h2"
          en={processTitleBi.en}
          th={processTitleBi.th}
          serif
          className="text-lg text-ink sm:text-xl"
          thClassName="mt-0.5 block font-thai text-[13.5px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={processBi.en}
          th={processBi.th}
          className="mt-2 text-[13.5px] leading-[1.65] text-ink"
          thClassName="mt-1 block font-thai text-[12.5px] font-medium leading-[1.65] text-ink-soft"
        />
      </section>

      <aside className="rounded-editorial border border-line bg-mint-100/80 p-4">
        <BiText
          as="p"
          en={disclaimerBi.en}
          th={disclaimerBi.th}
          className="text-sm leading-relaxed text-ink/80"
          thClassName="mt-1 block font-thai text-[12px] leading-relaxed text-ink/70"
        />
      </aside>
    </div>
  )
}
