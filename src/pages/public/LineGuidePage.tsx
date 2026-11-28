import { Clock, Download, Eye, Heart, ImageDown, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { backupDaysText, LINE_GUIDE, LINE_GUIDE_LOGO } from '../../content/lineGuide'

const body = 'text-[18px] leading-relaxed text-ink'
const heading = 'text-[24px] font-semibold leading-snug text-ink'

function Steps({ items }: { items: readonly string[] }) {
  return (
    <ol className={`mt-4 space-y-4 ${body}`}>
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-white">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}

export default function LineGuidePage() {
  const copy = LINE_GUIDE
  return (
    <main lang="th" className="mx-auto w-full max-w-2xl px-5 py-8">
      <img
        src={LINE_GUIDE_LOGO}
        alt="Trip2Talk"
        width={96}
        height={96}
        className="h-24 w-24 rounded-full"
      />
      <h1 className="mt-6 text-[28px] font-semibold leading-snug text-ink">{copy.title}</h1>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <Eye aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.view.heading}
        </h2>
        <Steps items={copy.sections.view.steps} />
      </section>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <Download aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.save.heading}
        </h2>
        <Steps items={copy.sections.save.steps} />
      </section>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <Clock aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.time.heading}
        </h2>
        <Steps items={copy.sections.time.steps} />
        <p className={`mt-4 ${body}`}>
          ทีมงานเก็บไฟล์สำรองไว้ให้ {backupDaysText()} วันหลังวันส่งครับ
        </p>
      </section>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <Printer aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.print.heading}
        </h2>
        <p className={`mt-4 ${body}`}>{copy.sections.print.body}</p>
      </section>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <ImageDown aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.use.heading}
        </h2>
        <Steps items={copy.sections.use.steps} />
      </section>

      <section className="mt-10">
        <h2 className={`flex items-center gap-3 ${heading}`}>
          <Heart aria-hidden className="h-8 w-8 shrink-0" />
          {copy.sections.like.heading}
        </h2>
        <a
          href={copy.facebookUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-ink px-6 py-3 text-center text-[18px] font-semibold text-white"
        >
          {copy.sections.like.button}
        </a>
      </section>

      <footer className="mt-12 border-t border-line pt-8">
        <p className={body}>{copy.sections.footer.body}</p>
        <Link
          to="/trips"
          className="mt-4 flex min-h-12 items-center justify-center rounded-full border-2 border-ink px-6 py-3 text-center text-[18px] font-semibold text-ink"
        >
          {copy.sections.footer.button}
        </Link>
      </footer>
    </main>
  )
}
