import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { POSING_TIPS, SEASON_CARDS } from '../../data/photoGuideContent'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

export default function PosingGuidePage() {
  const { lang } = useLang()
  const album = galleryByIds(['syd-009', 'syd-011', 'syd-012', 'syd-015', 'nsw-006', 'nsw-007'])
  const slides = album.map((photo) => ({
    photo,
    sceneEn: 'Posing',
    sceneTh: 'โพสท่า',
    titleEn: 'Example album from Saen & team',
    titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
    meta: photo.id,
  }))

  return (
    <div className="space-y-6 pb-4">
      <Link
        to="/photo-guide"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 no-underline"
      >
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
      </Link>

      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          {lang === 'th' ? 'คลังเคล็ดลับ · โพสท่า' : 'Photo Guide · Posing & Styling'}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือโพสท่า & แต่งตัว' : 'Posing & Styling Guide'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'สำหรับลูกทริปที่ชอบอยู่หน้ากล้อง — ดูอัลบั้มตัวอย่างก่อน แล้วตามด้วยท่าโพสและโทนเสื้อผ้าตามฤดูกาล'
            : 'For trip customers who love being in front of the camera. Browse the album, then try our photographers’ favorite poses and seasonal color guide.'}
        </p>
      </header>

      <section>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-ink">
            {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
          </p>
          <small className="text-[10.5px] text-ink-soft">
            {lang === 'th' ? 'ปัดเพื่อดูเพิ่ม →' : 'Swipe for more →'}
          </small>
        </div>
        <PhotoSlideshow slides={slides} />
      </section>

      <section>
        <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
          {lang === 'th' ? 'ท่าโพสแนะนำจากช่างภาพ' : 'Photographer-approved poses'}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POSING_TIPS.map((p) => (
            <article
              key={p.n}
              className="rounded-[14px] border border-line bg-card p-4 shadow-[0_8px_18px_-12px_rgba(15,28,30,0.25)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-xs font-bold text-cream">
                {p.n}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-ink">
                {lang === 'th' ? p.titleTh : p.titleEn}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {lang === 'th' ? p.bodyTh : p.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
          {lang === 'th' ? 'โทนเสื้อผ้าตามฤดูกาล' : 'What to wear, by season'}
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          {lang === 'th'
            ? 'จับคู่กับทริปจริงของ Trip2Talk ให้ชุดเข้ากับวิวที่คุณจะถ่าย'
            : 'Matched to real Trip2Talk trips, so your outfit works with the landscape you’ll shoot.'}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SEASON_CARDS.map((s) => (
            <article
              key={s.trip}
              className={`rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-cream`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                {lang === 'th' ? s.monthsTh : s.monthsEn}
              </p>
              <h3 className="mt-1 font-serif text-lg">
                {lang === 'th' ? s.titleTh : s.titleEn}
              </h3>
              <div className="mt-2 flex gap-1.5">
                {s.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-full ring-1 ring-white/40"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-cream/85">
                {lang === 'th' ? s.bodyTh : s.bodyEn}
              </p>
              <span className="mt-3 inline-block rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold">
                {s.trip}
              </span>
            </article>
          ))}
        </div>
      </section>

      <blockquote className="rounded-2xl border border-line bg-mint-100 p-5">
        <p className="font-serif text-base italic leading-relaxed text-ink">
          {lang === 'th'
            ? '“ไม่ต้องพยายามเป็นนางแบบ — พยายามให้ดูเหมือนวันที่สนุกที่สุดของทริป นั่นคือภาพที่คนหยุดเลื่อนดู”'
            : '“Don’t try to be a model — try to look like you’re having the best day of your trip. That’s the photo people actually stop scrolling for.”'}
        </p>
        <footer className="mt-3 text-xs text-ink-soft">
          — {lang === 'th' ? 'ช่างภาพหลักของ Trip2Talk' : 'Trip2Talk lead photographer'}
        </footer>
      </blockquote>
    </div>
  )
}
