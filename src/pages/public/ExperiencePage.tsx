import { Link } from 'react-router-dom'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import { useLang } from '../../hooks/useLang'

/** Phase-1 stub — Experience tab shell until the full feed ships. */
export default function ExperiencePage() {
  const { tt } = useLang()
  const badge = tt('experience.badge')
  const title = tt('experience.title')
  const body = tt('experience.body')
  const back = tt('experience.back')

  return (
    <div className="-mx-4 bg-cream-app px-4 py-10 text-ink-app sm:-mx-6 sm:px-6 lg:mx-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-mid">
        {badge.en}
        <span className="ml-1.5 font-thai font-medium normal-case tracking-normal">{badge.th}</span>
      </p>
      <BiDisplayHeading
        en={title.en}
        th={title.th}
        as="h1"
        className="mt-2"
        enClassName="text-3xl font-semibold leading-tight"
        thClassName="mt-1 text-lg font-medium text-ink-app/55"
      />
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-app/70">
        {body.en}
        <span className="mt-1 block font-thai">{body.th}</span>
      </p>
      <Link
        to="/discover"
        className="mt-8 inline-flex rounded-full bg-teal-dark px-5 py-3 text-sm font-semibold text-white"
      >
        {back.en}
        <span className="ml-1.5 font-thai font-medium">{back.th}</span>
      </Link>
    </div>
  )
}
