import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import ContentPage from '../../components/layout/ContentPage'
import PayIdDepositPanel from '../../components/booking/PayIdDepositPanel'
import { FACEBOOK_MESSENGER_URL, FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { CANCELLATION_POLICY } from '../../data/risks'
import { useState } from 'react'

export function TermsPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'ข้อกำหนดและเงื่อนไข' : 'Terms & Conditions'}
      subtitle={
        lang === 'th'
          ? 'เงื่อนไขการใช้เว็บไซต์และการจองทริป Trip2Talk — รายละเอียดเพิ่มอยู่ใน waiver ก่อนจอง'
          : 'Website and booking terms for Trip2Talk. Full trip acknowledgements also appear in the digital waiver before booking.'
      }
    >
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">1. Booking & payment</h2>
        <p>
          By using trip2talk.com.au and related booking tools you agree to provide accurate contact
          details, pay the required deposit to secure a seat, and complete the balance with our team
          before departure (PayID / agreed installments). Seats are not confirmed until deposit is
          received and acknowledged by Trip2Talk staff.
        </p>
        <p className="font-thai text-ink-soft">
          การจองถือว่าคุณยืนยันข้อมูลติดต่อถูกต้อง ชำระมัดจำเพื่อล็อคที่นั่ง และชำระส่วนที่เหลือกับทีมก่อนวันเดินทาง
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">2. Trip participation & waiver</h2>
        <p>
          Guests must complete the digital waiver (liability release, OSHC acknowledgment for student
          visa holders where applicable, medical emergency authorization, and photo/video consent)
          before booking. Force majeure and aurora-viewing trips have additional disclaimers shown in
          the waiver.
        </p>
        <p className="font-thai text-ink-soft">
          ผู้เดินทางต้องลงนาม waiver อิเล็กทรอนิกส์ก่อนจอง รวมถึงการสละสิทธิ์ความรับผิด การยืนยัน OSHC (ถ้าใช้วีซ่านักเรียน)
          การอนุญาตรักษาฉุกเฉิน และความยินยอมใช้รูป/วิดีโอ
        </p>
        <Link to="/waiver" className="inline-block text-teal-700 underline">
          {lang === 'th' ? 'อ่าน waiver / เงื่อนไขทริป →' : 'Read the trip waiver →'}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">3. Cancellation</h2>
        <p>
          Cancellation outcomes depend on how many days before departure you cancel. See our
          cancellation policy for deposit/credit rules.
        </p>
        <Link to="/cancellation" className="inline-block text-teal-700 underline">
          {lang === 'th' ? 'นโยบายยกเลิก →' : 'Cancellation policy →'}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">4. Photos & content</h2>
        <p>
          Photos and trip content are owned by Trip2Talk and our photographers unless otherwise
          agreed in writing. Do not republish trip materials for commercial use without permission.
        </p>
        <p className="font-thai text-ink-soft">
          รูปและคอนเทนต์ทริปเป็นของ Trip2Talk และช่างภาพ ห้ามนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">5. Operator</h2>
        <p>
          Services are provided by Chapter99 trading as Trip2Talk (Saard Saenmuang), ABN 81 951 461
          769, Sydney NSW, Australia. Contact:{' '}
          <a href="mailto:trip2talksyd@gmail.com" className="text-teal-700 underline">
            trip2talksyd@gmail.com
          </a>
          .
        </p>
      </section>

      <p className="rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-2 text-[11px] text-ink-soft">
        Draft for business review — not legal advice. Have an Australian legal professional review
        before treating as final.
        <span className="mt-1 block font-thai">
          ฉบับร่างสำหรับเจ้าของธุรกิจตรวจ — ไม่ใช่คำแนะนำทางกฎหมาย ควรให้ผู้เชี่ยวชาญตรวจก่อนใช้จริง
        </span>
      </p>
    </ContentPage>
  )
}

export function PrivacyPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
      subtitle={
        lang === 'th'
          ? 'ข้อมูลที่เราเก็บ เก็บอย่างไร และใช้ทำอะไร'
          : 'What we collect, where it is stored, and how we use it.'
      }
    >
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">1. Who we are</h2>
        <p>
          Trip2Talk (Chapter99 / Saard Saenmuang, ABN 81 951 461 769) operates trip2talk.com.au from
          Sydney, Australia. Contact:{' '}
          <a href="mailto:trip2talksyd@gmail.com" className="text-teal-700 underline">
            trip2talksyd@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">2. What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-ink">
          <li>Booking details: name, email, phone, trip selection, dates of birth when provided</li>
          <li>
            Safety info: emergency contact, allergies, medical notes, insurance type/membership
            (optional free text)
          </li>
          <li>
            Flight-assist fields when you opt in (legal name, DOB, passport number, nationality) —
            treated as sensitive
          </li>
          <li>Payment records: amounts, method, slips, tax invoice metadata</li>
          <li>Waiver signatures and staff-assisted authorization notes when applicable</li>
          <li>Waitlist name/phone/email if a trip is full</li>
        </ul>
        <p className="font-thai text-ink-soft">
          เราเก็บข้อมูลการจอง ข้อมูลความปลอดภัย (ถ้ากรอก) ข้อมูลช่วยจองตั๋วบินเมื่อคุณเปิดใช้ ประวัติการชำระ และลายเซ็น waiver
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">3. How we use data</h2>
        <p>
          To process bookings and deposits, coordinate trips (usually via our Facebook Page inbox),
          keep guides informed of emergency/allergy notes on trip day, issue tax invoices, and
          improve operations. We do not sell your personal data.
        </p>
        <p className="font-thai text-ink-soft">
          ใช้เพื่อจองทริป ประสานงาน (มักผ่าน Facebook) ให้ไกด์ดูข้อมูลฉุกเฉินวันทริป และออกใบกำกับภาษี — เราไม่ขายข้อมูล
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">4. Storage & security</h2>
        <p>
          Data is stored in Supabase (PostgreSQL) with row-level security; staff tools access
          bookings via authenticated Edge Functions. Hosting for the website is on Vercel. We aim to
          keep project infrastructure in regions suitable for Australian operations; confirm the live
          Supabase project region in the dashboard. Sensitive fields (passport, medical, emergency
          contact) follow the same restricted staff-access pattern as other compliance documents in
          this app.
        </p>
        <p className="font-thai text-ink-soft">
          เก็บใน Supabase พร้อม RLS; พนักงานเข้าถึงผ่าน Edge Function เว็บโฮสต์บน Vercel ข้อมูลอ่อนไหวจำกัดเฉพาะพนักงานที่ล็อกอิน
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">5. Cookies & analytics</h2>
        <p>
          This site does not currently load third-party analytics or advertising cookies. We may use
          essential browser storage for language preference, waiver session state, and staff session
          tokens. If analytics are added later, a consent banner will be introduced.
        </p>
        <p className="font-thai text-ink-soft">
          ขณะนี้ไม่มีคุกกี้วิเคราะห์จากบุคคลที่สาม — ใช้ที่เก็บในเบราว์เซอร์เท่าที่จำเป็นต่อการใช้งาน
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">6. Your rights</h2>
        <p>
          You may ask us to update or delete personal data that is no longer required for legal,
          tax, or safety records. Accounting records may need to be retained for Australian tax
          obligations.
        </p>
      </section>

      <p className="rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-2 text-[11px] text-ink-soft">
        <strong>Owner / legal review required.</strong> This is a draft privacy notice for Trip2Talk
        operations. Accuracy has compliance implications under the Australian Privacy Principles —
        have the business owner (and ideally a legal professional) review before treating as final.
        <span className="mt-1 block font-thai">
          <strong>ต้องให้เจ้าของธุรกิจ (และ ideally ที่ปรึกษากฎหมาย) ตรวจก่อนใช้จริง</strong> —
          นโยบายความเป็นส่วนตัวมีผลด้านกฎหมายในออสเตรเลีย
        </span>
      </p>
    </ContentPage>
  )
}

export function CancellationPage() {
  const { lang } = useLang()
  const policy = CANCELLATION_POLICY[lang]
  return (
    <ContentPage title={policy.title} subtitle={policy.intro}>
      <ul className="space-y-3">
        {policy.rules.map((rule) => (
          <li key={rule.condition} className="rounded-xl border border-line bg-mint-100/50 p-3">
            <p className="font-semibold text-ink">{rule.condition}</p>
            <p className="mt-1 text-ink-soft">{rule.outcome}</p>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function PaymentMethodsPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'วิธีชำระเงิน' : 'Payment Methods'}
      subtitle={
        lang === 'th'
          ? 'มัดจำเพื่อล็อคที่นั่ง — ส่วนที่เหลือผ่อนกับทีมได้'
          : 'We collect a deposit to secure your seat — remaining balance is arranged with our team.'
      }
    >
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
        <p className="font-semibold text-ink">
          {lang === 'th' ? 'มัดจำที่ต้องจ่ายตอนจอง' : 'Deposit due at booking'}
        </p>
        <p className="mt-1 text-ink-soft">
          {lang === 'th'
            ? 'ปกติ $100 AUD × จำนวนผู้เดินทาง (ตามที่แสดงในหน้าทริป) โอนผ่าน PayID ด้านล่าง แล้วอัปโหลดสลิปในหน้าจอง'
            : 'Typically $100 AUD × travellers (as shown on the trip). Pay via PayID below, then upload your slip on the booking page.'}
        </p>
      </div>

      <PayIdDepositPanel variant="page" />

      <p>
        We only collect a deposit to secure your seat — the remaining balance is arranged directly
        with our team, in 2–4 flexible installments.
      </p>
      <p className="font-thai text-ink-soft">
        เราเก็บมัดจำเพื่อล็อคที่นั่ง ส่วนที่เหลือคุยกับทีมได้ ผ่อนได้ 2–4 งวดตามความเหมาะสม
      </p>
      <p>
        <strong>{lang === 'th' ? 'ไม่รวมในราคาทริป:' : 'Not included in trip price:'}</strong>{' '}
        flights, meals, and travel insurance unless a trip page says otherwise.
      </p>
      <p>
        Private room upgrades can be arranged for an extra fee — message us on Facebook after your
        deposit.
      </p>
    </ContentPage>
  )
}

type NotifyPrefs = {
  tripReminders: boolean
  promo: boolean
  photoReady: boolean
}

const DEFAULT_NOTIFY_PREFS: NotifyPrefs = {
  tripReminders: true,
  promo: false,
  photoReady: true,
}

function loadNotifyPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem('t2t_notify_prefs')
    if (!raw) return { ...DEFAULT_NOTIFY_PREFS }
    const parsed = JSON.parse(raw) as Partial<NotifyPrefs>
    return { ...DEFAULT_NOTIFY_PREFS, ...parsed }
  } catch {
    return { ...DEFAULT_NOTIFY_PREFS }
  }
}

export function NotificationsPage() {
  const { lang } = useLang()
  const [prefs, setPrefs] = useState<NotifyPrefs>(loadNotifyPrefs)

  function toggle(key: keyof NotifyPrefs) {
    setPrefs((p: NotifyPrefs) => {
      const next = { ...p, [key]: !p[key] }
      try {
        localStorage.setItem('t2t_notify_prefs', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const rows: { key: keyof NotifyPrefs; en: string; th: string }[] = [
    { key: 'tripReminders', en: 'Trip reminders (departure & meetup)', th: 'แจ้งเตือนวันเดินทางและจุดนัดพบ' },
    { key: 'photoReady', en: 'Photo gallery ready (Pic-Time)', th: 'อัลบั้มภาพพร้อม (Pic-Time)' },
    { key: 'promo', en: 'New trip & promo emails', th: 'อีเมลทริปใหม่และโปรโมชัน' },
  ]

  return (
    <ContentPage
      title={lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
      subtitle={
        lang === 'th'
          ? 'ตั้งค่าบนเครื่องนี้ก่อน — ระบบพุชจริงจะต่อภายหลัง'
          : 'Saved on this device for now — real push delivery comes later.'
      }
    >
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3 py-3"
          >
            <span className="text-sm text-ink">{lang === 'th' ? row.th : row.en}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[row.key]}
              onClick={() => toggle(row.key)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                prefs[row.key] ? 'bg-teal-600' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-cream shadow transition-transform ${
                  prefs[row.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function HelpSupportPage() {
  const { lang } = useLang()
  const faqs = [
    {
      qEn: 'How do I pay the deposit?',
      qTh: 'จ่ายมัดจำยังไง?',
      aEn: 'Use PayID on the booking page, then upload your slip. We confirm seats after verification.',
      aTh: 'จ่าย PayID ในหน้าจอง แล้วอัปโหลดสลิป เราจะยืนยันที่นั่งหลังตรวจยอด',
    },
    {
      qEn: 'Where is the group chat?',
      qTh: 'แชทกลุ่มอยู่ที่ไหน?',
      aEn: 'After deposit, message our Facebook Page with your booking reference — we set up the group there.',
      aTh: 'หลังมัดจำ ทักเพจ Facebook พร้อมเลขที่การจอง — เราจัดกลุ่มแชทที่นั่น',
    },
    {
      qEn: 'Can I get a private room?',
      qTh: 'ขอห้องส่วนตัวได้ไหม?',
      aEn: 'Yes, on most trips for an extra fee — arrange with us on Facebook before departure.',
      aTh: 'ได้ในเกือบทุกทริป มีค่าใช้จ่ายเพิ่ม — คุยกับเราทาง Facebook ก่อนเดินทาง',
    },
  ]

  return (
    <ContentPage
      title={lang === 'th' ? 'ช่วยเหลือและติดต่อ' : 'Help & Support'}
      subtitle={
        lang === 'th'
          ? 'ทีมซัพพอร์ตจริงผ่าน Facebook Page — ไม่มีแชทในแอป'
          : 'Real support runs through our Facebook Page inbox — not an in-app chat.'
      }
    >
      <div className="flex flex-wrap gap-2">
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-embossed !text-[11px]"
        >
          Facebook Page
        </a>
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-mint-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink"
        >
          Messenger
        </a>
      </div>
      <ul className="mt-4 space-y-3">
        {faqs.map((f) => (
          <li key={f.qEn} className="rounded-xl border border-line bg-cream p-3">
            <p className="font-semibold text-ink">{lang === 'th' ? f.qTh : f.qEn}</p>
            <p className="mt-1 text-ink-soft">{lang === 'th' ? f.aTh : f.aEn}</p>
          </li>
        ))}
      </ul>
      <Link to="/my-trip" className="inline-block text-teal-700 underline">
        {lang === 'th' ? 'ค้นหาสถานะทริปของฉัน →' : 'Look up my trip status →'}
      </Link>
    </ContentPage>
  )
}

export function WriteReviewPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'เขียนรีวิว' : 'Write a Review'}
      subtitle={
        lang === 'th'
          ? 'ช่วยแชร์ประสบการณ์ทริป — ตอนนี้รีวิวผ่าน Facebook Page ของเรา'
          : 'Share your trip experience — we collect reviews on our Facebook Page.'
      }
    >
      <div className="rounded-2xl border border-teal-600/30 bg-mint-100 p-6 text-center">
        <p className="font-serif text-lg text-ink">
          {lang === 'th' ? 'รีวิวบน Facebook' : 'Review us on Facebook'}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {lang === 'th'
            ? 'กดลิงก์ด้านล่าง แล้วเขียนรีวิวสั้นๆ บนเพจ Trip2Talk — ช่วยให้นักเรียนคนอื่นเจอเรา'
            : 'Open our Page and leave a short review — it helps other Thai students find us.'}
        </p>
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-[#1877F2] px-5 py-3 text-sm font-bold text-white"
        >
          {lang === 'th' ? 'เปิดเพจ Facebook' : 'Open Facebook Page'}
        </a>
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm font-semibold text-teal-700 underline"
        >
          {lang === 'th' ? 'หรือทัก Messenger' : 'Or message us on Messenger'}
        </a>
        <p className="mt-4 text-[11px] text-ink-soft">
          Google Reviews link is not configured yet (contact.googleReviews is disabled).
          <span className="mt-0.5 block font-thai">ลิงก์ Google Reviews ยังไม่ได้ตั้งค่า</span>
        </p>
      </div>
    </ContentPage>
  )
}

export function NotFoundPage() {
  const { lang } = useLang()
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-serif text-6xl text-teal-500">404</p>
      <h1 className="mt-3 font-serif text-2xl text-ink">
        {lang === 'th' ? 'ไม่พบหน้านี้' : 'Page not found'}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {lang === 'th'
          ? 'ลิงก์อาจหมดอายุ หรือหน้ายังไม่ถูกสร้าง'
          : 'That link may be outdated, or the page is still on the way.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn-embossed">
          {lang === 'th' ? 'หน้าแรก' : 'Home'}
        </Link>
        <Link
          to="/trips"
          className="rounded-full border border-line bg-mint-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink"
        >
          {lang === 'th' ? 'ทริปทั้งหมด' : 'All trips'}
        </Link>
      </div>
    </div>
  )
}
