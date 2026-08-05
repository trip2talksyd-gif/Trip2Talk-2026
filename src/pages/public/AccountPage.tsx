import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { useFavoriteTripCodes } from '../../hooks/useFavorites'
import { GALLERY_PHOTOS } from '../../data/galleryPhotos'

/** Menu rows — icons match mockup emoji treatment; routes/data unchanged. */
const MENU = [
  {
    to: '/my-trip',
    ic: '🧾',
    en: 'My Trip',
    th: 'ทริปของฉัน',
    subEn: 'Look up booking status',
    subTh: 'ค้นหาสถานะการจอง',
  },
  {
    to: '/payment-methods',
    ic: '💳',
    en: 'Payment Methods',
    th: 'วิธีการชำระเงิน',
    subEn: 'Deposit & installments',
    subTh: 'มัดจำและผ่อนชำระ',
  },
  {
    to: '/notifications',
    ic: '🔔',
    en: 'Notifications',
    th: 'การแจ้งเตือน',
    subEn: 'Reminders on this device',
    subTh: 'แจ้งเตือนบนเครื่องนี้',
  },
  {
    to: '/help',
    ic: '💬',
    en: 'Help & Support',
    th: 'ช่วยเหลือ',
    subEn: 'FAQ + Facebook Page',
    subTh: 'คำถามบ่อย + เพจ Facebook',
  },
  {
    to: '/review',
    ic: '⭐',
    en: 'Write a Review',
    th: 'เขียนรีวิว',
    subEn: 'Coming soon',
    subTh: 'เร็วๆ นี้',
  },
  {
    to: '/terms',
    ic: '📄',
    en: 'Terms of Service',
    th: 'เงื่อนไขการใช้งาน',
    subEn: 'Booking & site terms',
    subTh: 'เงื่อนไขเว็บและการจอง',
  },
  {
    to: '/privacy',
    ic: '🛡',
    en: 'Privacy Policy',
    th: 'นโยบายความเป็นส่วนตัว',
    subEn: 'How we use your data',
    subTh: 'เราใช้ข้อมูลอย่างไร',
  },
  {
    to: '/cancellation',
    ic: '🚫',
    en: 'Cancellation Policy',
    th: 'นโยบายการยกเลิก',
    subEn: 'Refunds by timing',
    subTh: 'คืนเงินตามระยะเวลา',
  },
] as const

export default function AccountPage() {
  const { lang, toggleLang, tt } = useLang()
  const favorites = useFavoriteTripCodes()

  // Mockup .acct-stats — Trips / Saved / Photos. Saved + Photos are real counts;
  // Trips has no per-device source without auth, so it stays a dash placeholder.
  const stats = [
    { value: '—', en: 'Trips', th: 'ทริป' },
    { value: String(favorites.length), en: 'Saved', th: 'บันทึก' },
    { value: String(GALLERY_PHOTOS.length), en: 'Photos', th: 'รูปภาพ' },
  ]

  const guestBadge = tt('account.guestBadge')
  const guestSub = tt('account.guestSub')
  const languageBi = tt('account.language')

  return (
    <div className="acct-shell pb-4">
      {/* .acct-hero */}
      <div className="acct-hero -mx-4 sm:-mx-6 lg:mx-0">
        <div className="acct-avatar" aria-hidden>
          T2
        </div>
        <b>
          {guestBadge.en}
          <span className="mt-0.5 block font-thai text-[0.72em] font-medium opacity-85">
            {guestBadge.th}
          </span>
        </b>
        <span className="acct-sub">
          {guestSub.en}
          <span className="mt-0.5 block font-thai opacity-90">{guestSub.th}</span>
        </span>
        <div className="acct-stats">
          {stats.map((stat) => (
            <div key={stat.en}>
              <p>{stat.value}</p>
              <p>
                {stat.en}
                <span
                  className="mt-px block font-thai text-[8px] normal-case tracking-normal opacity-85"
                  style={{ color: 'var(--mint-200)' }}
                >
                  {stat.th}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* .acct-menu */}
      <div className="acct-menu px-0 sm:px-0">
        <button type="button" onClick={toggleLang} className="acct-menu-item">
          <span className="ic" aria-hidden>
            🌐
          </span>
          <span className="txt">
            <b>
              {languageBi.en}
              <span className="ml-1 font-thai text-[0.85em] font-medium opacity-80">
                {languageBi.th}
              </span>
            </b>
            <span className="font-thai">
              {lang === 'th' ? 'แตะเพื่อสลับเป็น English' : 'Tap to switch to Thai'}
            </span>
          </span>
          <span className="chev" aria-hidden>
            ›
          </span>
        </button>

        {MENU.map((item) => (
          <Link key={item.to} to={item.to} className="acct-menu-item">
            <span className="ic" aria-hidden>
              {item.ic}
            </span>
            <span className="txt">
              <b>
                {item.en}
                <span className="ml-1 font-thai text-[0.85em] font-medium opacity-80">
                  {item.th}
                </span>
              </b>
              <span>
                {item.subEn}
                <span className="ml-1 font-thai opacity-85">{item.subTh}</span>
              </span>
            </span>
            <span className="chev" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
