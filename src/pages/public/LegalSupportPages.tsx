import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import ContentPage from '../../components/layout/ContentPage'
import { CONTACT_CHANNELS } from '../../data/contactChannels'
import { CANCELLATION_POLICY } from '../../data/risks'
import { useState } from 'react'

export function TermsPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'เงื่อนไขการใช้งาน' : 'Terms of Service'}
      subtitle={
        lang === 'th'
          ? 'สรุปเงื่อนไขการใช้เว็บไซต์และบริการ Trip2Talk — รายละเอียดเต็มอยู่ในเอกสาร waiver ก่อนจอง'
          : 'Summary of how Trip2Talk services work. Full trip terms appear in the digital waiver before booking.'
      }
    >
      <p>
        By using trip2talk.com.au and related booking tools you agree to book as a guest with accurate
        contact details, pay the required deposit to secure a seat, and complete the balance with our
        team before departure.
      </p>
      <p>
        Photos and trip content are owned by Trip2Talk and our photographers unless otherwise agreed.
        Do not republish trip materials for commercial use without written permission.
      </p>
      <p className="font-thai text-ink-soft">
        การจองถือว่าคุณยืนยันข้อมูลติดต่อถูกต้อง ชำระมัดจำเพื่อล็อคที่นั่ง และชำระส่วนที่เหลือกับทีมก่อนวันเดินทาง
      </p>
      <Link to="/waiver" className="inline-block text-teal-700 underline">
        {lang === 'th' ? 'อ่าน waiver / เงื่อนไขทริป →' : 'Read the trip waiver →'}
      </Link>
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
          ? 'เราเก็บเฉพาะข้อมูลที่จำเป็นต่อการจองและติดต่อทริป'
          : 'We only collect what we need to run your booking and trip communications.'
      }
    >
      <p>
        We store your name, email, phone, and trip preferences to process bookings, deposits, and
        group coordination (usually via our Facebook Page inbox). Payment slips may be stored
        securely for reconciliation.
      </p>
      <p>
        We do not sell your data. Staff access booking details only to deliver the trip. You can ask
        us to update or delete personal data that is no longer required for legal or accounting
        records.
      </p>
      <p className="font-thai text-ink-soft">
        เราไม่ขายข้อมูลของคุณ พนักงานเข้าถึงข้อมูลการจองเท่าที่จำเป็นต่อการจัดทริป
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
            ? 'ปกติ $100 AUD × จำนวนผู้เดินทาง (ตามที่แสดงในหน้าทริป) ชำระผ่าน PayID แล้วอัปโหลดสลิปได้'
            : 'Typically $100 AUD × travellers (as shown on the trip). Pay via PayID and upload your slip.'}
        </p>
      </div>
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
  const facebook = CONTACT_CHANNELS.find((c) => c.id === 'facebook')?.href
  const messenger = CONTACT_CHANNELS.find((c) => c.id === 'messenger')?.href
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
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-embossed !text-[11px]"
          >
            Facebook Page
          </a>
        )}
        {messenger && (
          <a
            href={messenger}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line bg-mint-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink"
          >
            Messenger
          </a>
        )}
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
          ? 'ระบบรีวิวในแอปยังไม่เปิด — ยังไม่มีตาราง reviews ในฐานข้อมูล'
          : 'In-app reviews are not live yet — no reviews table exists in the database.'
      }
    >
      <div className="rounded-2xl border border-dashed border-teal-600/40 bg-mint-100 p-6 text-center">
        <p className="font-serif text-lg text-ink">Coming soon</p>
        <p className="mt-2 text-sm text-ink-soft">
          {lang === 'th'
            ? 'ระหว่างนี้ ทักเพจ Facebook หรือ Google Reviews ได้เลยหลังทริป'
            : 'For now, message our Facebook Page or leave a Google review after your trip.'}
        </p>
        <Link to="/help" className="mt-4 inline-block text-sm font-semibold text-teal-700">
          {lang === 'th' ? 'ไปหน้าช่วยเหลือ →' : 'Help & Support →'}
        </Link>
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
