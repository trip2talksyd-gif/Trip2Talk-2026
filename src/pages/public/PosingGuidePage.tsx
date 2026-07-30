import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { POSING_TIPS, SEASON_CARDS } from '../../data/photoGuideContent'
import { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { photoSrc } from '../../data/galleryPhotos'

export default function PosingGuidePage() {
  const { lang } = useLang()
  const album = galleryByIds(['syd-009', 'syd-011', 'syd-012', 'syd-015', 'nsw-006', 'nsw-007'])

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

      {/* Mockup posing guide: horizontal album strip (not a hero slideshow) */}
      <div className="old-album-wrap">
        <div className="oa-label">
          <div>
            <b>
              {lang === 'th'
                ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม'
                : 'Example album from Saen & team'}
            </b>
            <span className="oa-sub">
              {lang === 'th'
                ? 'Example album from Saen & team'
                : 'อัลบั้มตัวอย่างจากพี่แสนและทีม'}
            </span>
          </div>
          <small>{lang === 'th' ? 'ปัดเพื่อดูเพิ่ม →' : 'Swipe for more →'}</small>
        </div>
        <div className="gallery-scroll-wrap">
          <div className="gallery-scroll">
            {album.map((photo) => (
              <img
                key={photo.id}
                src={photoSrc(photo)}
                alt={lang === 'th' ? photo.caption_th : photo.caption_en}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-[15.5px] text-ink sm:text-lg">
          {lang === 'th' ? 'ท่าโพสแนะนำจากช่างภาพ' : 'Photographer-approved poses'}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSING_TIPS.map((p) => (
            <article
              key={p.n}
              className="rounded-[14px] border border-line bg-card p-4 pb-[18px] shadow-[0_8px_18px_-12px_rgba(15,28,30,0.25)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-extrabold text-cream">
                {p.n}
              </span>
              <h3 className="mt-2.5 text-[13px] font-semibold text-ink">
                {lang === 'th' ? p.titleTh : p.titleEn}
              </h3>
              <p className="mt-1 text-[11.5px] leading-[1.55] text-ink-soft">
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
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SEASON_CARDS.map((s) => (
            <article
              key={s.trip}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-cream`}
            >
              <p className="text-[9px] uppercase tracking-[0.05em] opacity-85">
                {lang === 'th' ? s.monthsTh : s.monthsEn}
              </p>
              <h3 className="mb-px mt-1 font-serif text-sm">
                {lang === 'th' ? s.titleTh : s.titleEn}
              </h3>
              <div className="my-2.5 flex gap-1.5">
                {s.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-[6px] border-2 border-white/50"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-[10px] leading-[1.5] opacity-95">
                {lang === 'th' ? s.bodyTh : s.bodyEn}
              </p>
              <span className="mt-2.5 inline-block rounded-full bg-white/20 px-2 py-[3px] text-[9px] font-extrabold">
                {s.trip}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* .quote-box — teal-900 panel, cream italic pull-quote */}
      <blockquote className="relative m-0 rounded-2xl bg-teal-900 px-6 py-[22px] text-[#eafcf0]">
        <p className="m-0 mb-2.5 text-sm italic leading-[1.7]">
          {lang === 'th'
            ? '“ไม่ต้องพยายามเป็นนางแบบ — พยายามให้ดูเหมือนวันที่สนุกที่สุดของทริป นั่นคือภาพที่คนหยุดเลื่อนดู”'
            : '“Don’t try to be a model — try to look like you’re having the best day of your trip. That’s the photo people actually stop scrolling for.”'}
        </p>
        <footer className="text-[11.5px] font-bold not-italic opacity-90">
          — {lang === 'th' ? 'ช่างภาพหลักของ Trip2Talk' : 'Trip2Talk lead photographer'}
        </footer>
      </blockquote>
    </div>
  )
}
