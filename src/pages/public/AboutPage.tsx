import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import AboutStatsSection from '../../components/about/AboutStatsSection'

export default function AboutPage() {
  const { lang } = useLang()

  const brandStory =
    lang === 'th'
      ? 'Trip2Talk เกิดจากความรักในการถ่ายรูปและการเดินทางของพวกเรา เป็นผลงานสร้างสรรค์จาก Chapter 99 Photography เราเชื่อว่าทุกการเดินทางมีเรื่องราว และทุกเรื่องราวควรถูกบันทึกด้วยภาพถ่ายที่งดงาม'
      : 'Trip2Talk was born from our love of photography and travel — a creative project from Chapter 99 Photography. We believe every journey has a story, and every story deserves to be captured beautifully.'

  const saenBio =
    lang === 'th'
      ? `สวัสดีครับ ผม Saen ช่างภาพผู้หลงใหลในความงามของธรรมชาติและแสงสี ผมเริ่มต้นการเดินทางบนเส้นทางสายการถ่ายภาพด้วยการเรียนรู้ด้วยตนเอง และด้วยความรักในการถ่ายภาพ ผมได้พบกับกลุ่มคนไทยในซิดนีย์ที่มีความสนใจในสิ่งเดียวกัน เราเริ่มต้นออกเดินทางสำรวจและเก็บภาพความงามของซิดนีย์ด้วยกัน และค่อยๆ ขยายขอบเขตการเดินทางออกไปเรื่อยๆ

ตลอด 10 ปีที่ผ่านมา ผมได้พัฒนาทักษะการถ่ายภาพทิวทัศน์ (Landscape) อย่างต่อเนื่อง เข้าใจถึงความท้าทายและความอดทนที่ต้องมี กว่าจะได้ภาพที่สวยงามสักภาพ ต้องอาศัยการวางแผน การรอคอย และการปรับตัวให้เข้ากับสภาพแวดล้อม

ผมเชื่อว่าการถ่ายภาพไม่ใช่แค่การบันทึกภาพ แต่เป็นการบันทึกเรื่องราว ความรู้สึก และประสบการณ์ที่เกิดขึ้นในแต่ละช่วงเวลา`
      : `Hello — I'm Saen, a photographer captivated by nature and light. I taught myself the craft and, through that passion, connected with Thai communities in Sydney who shared the same love for exploring and photographing this city. We started shooting Sydney together and gradually expanded our journeys across Australia.

Over the past 10 years I've honed my landscape photography, learning the patience and planning it takes to capture a truly beautiful image — waiting for the right light, adapting to the environment, and reading the conditions.

For me, photography isn't just recording a scene — it's preserving a story, a feeling, and the experience of that moment in time.`

  const ployBio =
    lang === 'th'
      ? 'Monsicha Chayakorn (พลอย) — Admin & Trip Staff ดูแลการประสานงานคิวจอง และดูแลลูกทริปให้พร้อมก่อนออกเดินทาง'
      : 'Monsicha Chayakorn (Ploy) — Admin & Trip Staff. She coordinates bookings and makes sure every guest is prepared before departure.'

  const whatToKnow =
    lang === 'th'
      ? 'เราไม่ใช่บริษัททัวร์ บริการของเราคือ Photo Trip — เน้นการเดินทางเพื่อถ่ายภาพเป็นหลัก ไม่ใช่ไกด์นำเที่ยวแบบครบวงจร ที่พักเป็นแบบ Hostel/Backpacker/Motel เน้นสะอาดปลอดภัย หากต้องการอัปเกรดห้องพักส่วนตัวสามารถแจ้งและจ่ายเพิ่มได้ อาหารไม่รวมในแพ็กเกจเพื่อให้ทุกคนเลือกทานได้อิสระตามต้องการ'
      : "We're not a traditional tour company — Trip2Talk is a Photo Trip service focused on photography-led travel, not full-service sightseeing. Accommodation is typically hostel, backpacker, or motel standard — clean and safe. Private room upgrades are available on request for an additional fee. Meals are not included so everyone can eat freely according to their preferences."

  return (
    <div className="space-y-8 pb-4">
      <h1 className="font-serif text-2xl text-brand-dark">
        {lang === 'th' ? 'เกี่ยวกับ Trip2Talk' : 'About Trip2Talk'}
      </h1>

      <AboutStatsSection />

      <section className="rounded-editorial border border-deep-green/10 bg-white p-5">
        <h2 className="font-serif text-lg text-brand-dark">
          {lang === 'th' ? 'เรื่องราวของเรา' : 'Our story'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-dark/80">{brandStory}</p>
        <p className="mt-2 text-xs text-cream-muted">Chapter 99 Photography</p>
      </section>

      <section className="rounded-editorial border border-gold/30 bg-gold/10 p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-deep-green font-serif text-xl text-cream">
            S
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-brand-dark">Saen</p>
            <p className="text-sm text-gold-dark">
              {lang === 'th' ? 'หัวหน้าทริป & ช่างภาพ' : 'Trip Leader & Photographer'}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-dark/80">
              {saenBio}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-editorial border border-deep-green/10 bg-white p-5">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-deep-green/80 font-serif text-xl text-cream">
            P
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-brand-dark">
              Monsicha Chayakorn (Ploy)
            </p>
            <p className="text-sm text-gold-dark">
              {lang === 'th' ? 'แอดมิน & ทีมทริป' : 'Admin & Trip Staff'}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-dark/80">{ployBio}</p>
          </div>
        </div>
      </section>

      <section className="rounded-editorial border border-amber/30 bg-amber/10 p-5">
        <h2 className="font-serif text-lg text-brand-dark">
          {lang === 'th' ? 'สิ่งที่ควรรู้' : 'What you should know'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-dark/80">{whatToKnow}</p>
      </section>

      <section className="rounded-editorial border border-deep-green/10 bg-white p-5">
        <h2 className="font-serif text-lg text-brand-dark">
          {lang === 'th' ? 'ติดต่อเรา' : 'Contact'}
        </h2>
        <p className="mt-2 text-sm text-brand-dark/70">
          {lang === 'th'
            ? 'สอบถามทริป ราคา Private หรือการจอง — ติดต่อเราได้ตามด้านล่าง'
            : 'Questions about trips, private pricing, or bookings — reach us below.'}
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-start gap-3 text-brand-dark/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>
              <span className="font-medium">{lang === 'th' ? 'สตูดิโอ' : 'Studio'}</span>
              <br />
              33/14 Jubilee Ave, Warriewood NSW 2102
            </span>
          </li>
          <li className="flex items-center gap-3 text-brand-dark/80">
            <Clock className="h-4 w-4 shrink-0 text-gold" />
            <span>
              {lang === 'th' ? 'จันทร์–ศุกร์ 10:00–17:00' : 'Monday–Friday 10am–5pm'}
            </span>
          </li>
          <li>
            <a
              href="mailto:trip2talksyd@gmail.com"
              className="flex items-center gap-3 text-deep-green hover:underline"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              trip2talksyd@gmail.com
            </a>
          </li>
          <li>
            <a
              href="tel:+61452044382"
              className="flex items-center gap-3 text-deep-green hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              +61 0452 044 382
            </a>
          </li>
        </ul>
        <p className="mt-4 text-xs text-cream-muted">ABN 81 951 461 769</p>
      </section>
    </div>
  )
}
