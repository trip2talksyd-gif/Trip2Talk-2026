import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'

const POSES = [
  {
    n: 1,
    en: 'Turn 3/4, chin down',
    th: 'หันตัว 3/4 ก้มคางเล็กน้อย',
    body: 'Angle your body away from the camera, turn your face back, chin slightly down and eyes up.',
  },
  {
    n: 2,
    en: "Walk it, don't pose it",
    th: 'เดินไปเรื่อยๆ ไม่ต้องเป๊ะ',
    body: 'Let the photographer catch you mid-stride or mid-laugh — candid beats stiff every time.',
  },
  {
    n: 3,
    en: 'One hand, one hip',
    th: 'มือหนึ่งเท้าเอว',
    body: 'Rest one hand lightly on your hip or in a pocket — creates a relaxed triangle shape.',
  },
  {
    n: 4,
    en: 'Look away from the lens',
    th: 'มองออกไปนอกเฟรม',
    body: 'Gazing at the view makes the photo feel like a real travel moment.',
  },
  {
    n: 5,
    en: "Sit, lean, don't stand stiff",
    th: 'นั่งหรือพิงกำแพง',
    body: 'Use a rock, railing or step — softens posture and gives more angles.',
  },
  {
    n: 6,
    en: 'Layer for movement',
    th: 'ใส่เสื้อผ้าที่มีจังหวะพลิ้ว',
    body: 'Scarves, jackets and dresses catch the wind — ask for a movement shot.',
  },
]

const SEASONS = [
  {
    trip: 'SYD-INFLU-3H',
    months: 'Dec – Feb · Summer',
    titleEn: 'Light & linen',
    titleTh: 'ผ้าลินินสีอ่อน',
    body: 'Sand, cream & terracotta pastels against Sydney harbour blue.',
    gradient: 'from-[#e8935a] to-[#d1602f]',
    swatches: ['#f3e6d3', '#f8f1e6', '#e7b98c', '#d97b4a'],
  },
  {
    trip: 'TAS-3D2N',
    months: 'Mar – May · Autumn',
    titleEn: 'Earth tones',
    titleTh: 'โทนสีดิน',
    body: 'Rust, olive & mustard echo Tasmania’s forests.',
    gradient: 'from-[#7a5230] to-[#4d3220]',
    swatches: ['#a9713f', '#c98f4e', '#6b4226', '#8a3324'],
  },
  {
    trip: 'NZ-6D5N',
    months: 'Jun – Aug · Winter',
    titleEn: 'Jewel tones & layers',
    titleTh: 'โทนอัญมณี ใส่หลายชั้น',
    body: 'Emerald, burgundy & navy pop against NZ snow and aurora green.',
    gradient: 'from-[#1b2a4a] to-[#0d1730]',
    swatches: ['#2e4d8f', '#5c2e6b', '#7a1f2b', '#0f2a3d'],
  },
  {
    trip: 'ULU-4D3N',
    months: 'Sep – Nov · Spring',
    titleEn: 'Soft florals',
    titleTh: 'โทนดอกไม้อ่อนหวาน',
    body: 'Blush, sage & soft yellow for Uluru wildflowers and Melbourne laneways.',
    gradient: 'from-[#c98fa8] to-[#7fae7a]',
    swatches: ['#f2c9d8', '#eef0c9', '#bfe0b8', '#f7e3ea'],
  },
]

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
        className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 no-underline"
      >
        ← {lang === 'th' ? 'กลับไปหน้าคลังเคล็ดลับ' : 'Back to Photo Guide'}
        <span className="font-thai text-[11px] font-medium opacity-85">
          {lang === 'th' ? 'Back to Photo Guide' : 'กลับไปหน้าคลังเคล็ดลับ'}
        </span>
      </Link>

      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          Photo Guide · Posing
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'คู่มือโพสท่า & แต่งตัว' : 'Posing & Styling Guide'}
        </h1>
      </header>

      <section>
        <p className="mb-2 text-sm font-bold text-ink">
          {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
        </p>
        <PhotoSlideshow slides={slides} />
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'ท่าโพสแนะนำจากช่างภาพ' : 'Photographer-approved poses'}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {POSES.map((p) => (
            <article key={p.n} className="rounded-xl border border-line bg-cream p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-xs font-bold text-cream">
                {p.n}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-ink">
                {lang === 'th' ? p.th : p.en}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'โทนเสื้อผ้าตามฤดูกาล' : 'What to wear, by season'}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SEASONS.map((s) => (
            <article
              key={s.trip}
              className={`rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-cream`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{s.months}</p>
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
              <p className="mt-2 text-xs leading-relaxed text-cream/85">{s.body}</p>
              <span className="mt-3 inline-block rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold">
                {s.trip}
              </span>
            </article>
          ))}
        </div>
      </section>

      <blockquote className="rounded-2xl border border-line bg-mint-100 p-5">
        <p className="font-serif text-base italic leading-relaxed text-ink">
          “Don&apos;t try to be a model — try to look like you&apos;re having the best day of your
          trip.”
        </p>
        <footer className="mt-3 text-xs text-ink-soft">
          — Trip2Talk lead photographer
          <span className="block font-thai">ช่างภาพหลักของ Trip2Talk</span>
        </footer>
      </blockquote>
    </div>
  )
}
