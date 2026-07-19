import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'
import CountUpStat from '../../components/ui/CountUpStat'

export default function AboutPage() {
  const { lang } = useLang()
  const heroPhoto =
    GALLERY_PHOTOS.find((p) => p.id === 'nz-013') ??
    GALLERY_PHOTOS.find((p) => p.id === 'syd-009') ??
    GALLERY_PHOTOS[0]

  const brandStory =
    lang === 'th'
      ? 'Trip2Talk เกิดจากความรักในการถ่ายรูปและการเดินทางของพวกเรา เป็นผลงานสร้างสรรค์จาก Chapter 99 Photography เราเชื่อว่าทุกการเดินทางมีเรื่องราว และทุกเรื่องราวควรถูกบันทึกด้วยภาพถ่ายที่งดงาม'
      : 'Trip2Talk started with one idea: travelers shouldn\'t have to choose between exploring and getting great photos of themselves doing it. Every trip pairs a small group (max 6) with a professional photographer and styling support, so you can focus on the moment.'

  const brandStoryTh =
    'Trip2Talk เริ่มจากไอเดียง่ายๆ ว่านักเดินทางไม่ควรต้องเลือกระหว่างการไปเที่ยวกับการได้ภาพสวยๆ ทุกทริปมีกลุ่มเล็ก (สูงสุด 6 คน) พร้อมช่างภาพมืออาชีพและทีมสไตล์ลิ่งดูแล คุณแค่โฟกัสกับช่วงเวลานั้น'

  const saenBio =
    lang === 'th'
      ? `สวัสดีครับ ผม Saen ช่างภาพผู้หลงใหลในความงามของธรรมชาติและแสงสี ผมเริ่มต้นการเดินทางบนเส้นทางสายการถ่ายภาพด้วยการเรียนรู้ด้วยตนเอง และด้วยความรักในการถ่ายภาพ ผมได้พบกับกลุ่มคนไทยในซิดนีย์ที่มีความสนใจในสิ่งเดียวกัน

ตลอด 10 ปีที่ผ่านมา ผมได้พัฒนาทักษะการถ่ายภาพทิวทัศน์อย่างต่อเนื่อง — ผมเชื่อว่าการถ่ายภาพไม่ใช่แค่การบันทึกภาพ แต่เป็นการบันทึกเรื่องราว ความรู้สึก และประสบการณ์`
      : `Hello — I'm Saen, a photographer captivated by nature and light. I taught myself the craft and, through that passion, connected with Thai communities in Sydney who shared the same love for exploring and photographing this city.

Over the past 10 years I've honed landscape photography. For me, photography isn't just recording a scene — it's preserving a story, a feeling, and the experience of that moment in time.`

  const ployBio =
    lang === 'th'
      ? 'Monsicha Chayakorn (พลอย) — Admin & Trip Staff ดูแลการประสานงานคิวจอง และดูแลลูกทริปให้พร้อมก่อนออกเดินทาง'
      : 'Monsicha Chayakorn (Ploy) — Admin & Trip Staff. She coordinates bookings and makes sure every guest is prepared before departure.'

  const whatToKnow =
    lang === 'th'
      ? 'เราไม่ใช่บริษัททัวร์ บริการของเราคือ Photo Trip — เน้นการเดินทางเพื่อถ่ายภาพเป็นหลัก ที่พักเป็นแบบ Hostel/Backpacker/Motel เน้นสะอาดปลอดภัย หากต้องการอัปเกรดห้องพักส่วนตัวสามารถแจ้งและจ่ายเพิ่มได้ อาหารไม่รวมในแพ็กเกจ'
      : "We're not a traditional tour company — Trip2Talk is a Photo Trip service focused on photography-led travel. Accommodation is typically hostel, backpacker, or motel standard — clean and safe. Private room upgrades are available on request. Meals are not included."

  return (
    <div className="space-y-8 pb-4">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
          About Trip2Talk
        </p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          {lang === 'th' ? 'เกี่ยวกับ Trip2Talk' : 'About Trip2Talk'}
        </h1>
      </header>

      <div className="grid gap-9 lg:grid-cols-2 lg:items-center">
        {heroPhoto && (
          <img
            src={photoSrc(heroPhoto)}
            alt="Trip2Talk team on location"
            className="aspect-[700/520] w-full rounded-[18px] object-cover shadow-mockup"
          />
        )}
        <div>
          <h2 className="m-0 font-serif text-[22px] text-ink">
            {lang === 'th' ? 'ทริปถ่ายภาพ ที่จัดการให้ครบ' : 'Photo trips, handled end-to-end'}
          </h2>
          <p className="mb-3.5 mt-1.5 font-thai text-[14px] text-teal-700">
            ทริปถ่ายภาพ ที่จัดการให้ครบทุกขั้นตอน
          </p>
          <p className="mb-3 text-[13.5px] leading-[1.75] text-ink-soft">{brandStory}</p>
          {lang === 'en' && (
            <p className="mb-3 font-thai text-[13.5px] leading-[1.75] text-ink-soft">{brandStoryTh}</p>
          )}
          <div className="mt-4 flex gap-[26px]">
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={13} />
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft">
                {lang === 'th' ? 'ทริป' : 'Trips'}
              </p>
            </div>
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={10} suffix="+" />
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft">
                {lang === 'th' ? 'ช่างภาพ' : 'Photographers'}
              </p>
            </div>
            <div>
              <p className="m-0 text-[20px] font-extrabold text-ink">
                <CountUpStat end={500} suffix="+" />
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.04em] text-ink-soft">
                {lang === 'th' ? 'นักเดินทาง' : 'Travelers'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-900 font-serif text-xl text-cream">
            S
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-ink">Saen</p>
            <p className="text-sm text-teal-700">
              {lang === 'th' ? 'หัวหน้าทริป & ช่างภาพ' : 'Trip Leader & Photographer'}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{saenBio}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-800 font-serif text-xl text-cream">
            P
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-ink">Monsicha Chayakorn (Ploy)</p>
            <p className="text-sm text-teal-700">
              {lang === 'th' ? 'แอดมิน & ทีมทริป' : 'Admin & Trip Staff'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{ployBio}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-teal-600/30 bg-teal-500/10 p-5">
        <h2 className="font-serif text-lg text-ink">
          {lang === 'th' ? 'สิ่งที่ควรรู้' : 'What you should know'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{whatToKnow}</p>
      </section>

      <section className="rounded-2xl border border-line bg-cream p-5">
        <h2 className="font-serif text-lg text-ink">{lang === 'th' ? 'ติดต่อเรา' : 'Contact'}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3 text-ink/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>
              <span className="font-medium">{lang === 'th' ? 'สตูดิโอ' : 'Studio'}</span>
              <br />
              33/14 Jubilee Ave, Warriewood NSW 2102
            </span>
          </li>
          <li className="flex items-center gap-3 text-ink/80">
            <Clock className="h-4 w-4 shrink-0 text-teal-600" />
            <span>{lang === 'th' ? 'จันทร์–ศุกร์ 10:00–17:00' : 'Monday–Friday 10am–5pm'}</span>
          </li>
          <li>
            <a
              href="mailto:trip2talksyd@gmail.com"
              className="flex items-center gap-3 text-teal-700 hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0 text-teal-600" />
              trip2talksyd@gmail.com
            </a>
          </li>
          <li>
            <a href="tel:+61452044382" className="flex items-center gap-3 text-teal-700 hover:underline">
              <Phone className="h-4 w-4 shrink-0 text-teal-600" />
              +61 0452 044 382
            </a>
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink-soft">ABN 81 951 461 769 · Chapter 99 Photography</p>
      </section>
    </div>
  )
}
