import { Link } from 'react-router-dom'

/** Phase-1 stub — Experience tab shell until the full feed ships. */
export default function ExperiencePage() {
  return (
    <div className="-mx-4 bg-cream-app px-4 py-10 text-ink-app sm:-mx-6 sm:px-6 lg:mx-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-mid">
        Experience
        <span className="ml-1.5 font-thai font-medium normal-case tracking-normal">ประสบการณ์</span>
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">
        Stories from the road
        <span className="mt-1 block font-thai text-lg font-medium text-ink-app/55">
          เรื่องราวจากทริปถ่ายภาพ
        </span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-app/70">
        Coming next — trip reels, day-by-day highlights, and guest moments from Saen&apos;s
        shoots.
        <span className="mt-1 block font-thai">เร็วๆ นี้ — รีลทริป ไฮไลท์รายวัน และโมเมนต์จากทริปจริง</span>
      </p>
      <Link
        to="/discover"
        className="mt-8 inline-flex rounded-full bg-teal-dark px-5 py-3 text-sm font-semibold text-white"
      >
        Back to Discover
        <span className="ml-1.5 font-thai font-medium">กลับ Discover</span>
      </Link>
    </div>
  )
}
