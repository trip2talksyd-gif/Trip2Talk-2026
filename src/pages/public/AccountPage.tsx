import { Link } from 'react-router-dom'
import {
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  Languages,
  Shield,
  Star,
  Ticket,
  XCircle,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useFavoriteTripCodes } from '../../hooks/useFavorites'

const MENU = [
  { to: '/my-trip', icon: Ticket, en: 'My Trip', th: 'ทริปของฉัน', subEn: 'Look up booking status', subTh: 'ค้นหาสถานะการจอง' },
  { to: '/payment-methods', icon: CreditCard, en: 'Payment Methods', th: 'วิธีการชำระเงิน', subEn: 'Deposit & installments', subTh: 'มัดจำและผ่อนชำระ' },
  { to: '/notifications', icon: Bell, en: 'Notifications', th: 'การแจ้งเตือน', subEn: 'Reminders on this device', subTh: 'แจ้งเตือนบนเครื่องนี้' },
  { to: '/help', icon: HelpCircle, en: 'Help & Support', th: 'ช่วยเหลือ', subEn: 'FAQ + Facebook Page', subTh: 'คำถามบ่อย + เพจ Facebook' },
  { to: '/review', icon: Star, en: 'Write a Review', th: 'เขียนรีวิว', subEn: 'Coming soon', subTh: 'เร็วๆ นี้' },
  { to: '/terms', icon: FileText, en: 'Terms of Service', th: 'เงื่อนไขการใช้งาน', subEn: 'Booking & site terms', subTh: 'เงื่อนไขเว็บและการจอง' },
  { to: '/privacy', icon: Shield, en: 'Privacy Policy', th: 'นโยบายความเป็นส่วนตัว', subEn: 'How we use your data', subTh: 'เราใช้ข้อมูลอย่างไร' },
  { to: '/cancellation', icon: XCircle, en: 'Cancellation Policy', th: 'นโยบายการยกเลิก', subEn: 'Refunds by timing', subTh: 'คืนเงินตามระยะเวลา' },
] as const

export default function AccountPage() {
  const { lang, toggleLang } = useLang()
  const favorites = useFavoriteTripCodes()

  return (
    <div className="space-y-5 pb-4">
      <div className="overflow-hidden rounded-2xl bg-teal-900 p-5 text-cream">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-lg font-bold text-ink">
            T2
          </div>
          <div>
            <p className="font-serif text-xl">Trip2Talk Guest</p>
            <p className="text-xs text-cream/65">
              {lang === 'th'
                ? 'จองแบบแขก — ไม่ต้องล็อกอิน'
                : 'Guest booking — no account login required'}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="font-serif text-2xl">{favorites.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-cream/55">
              {lang === 'th' ? 'บันทึก' : 'Saved'}
            </p>
          </div>
          <div>
            <p className="font-serif text-2xl">EN / TH</p>
            <p className="text-[10px] uppercase tracking-wider text-cream/55">
              {lang === 'th' ? 'ภาษา' : 'Language'}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleLang}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-cream px-3 py-3 text-left"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-100 text-teal-800">
          <Languages className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            {lang === 'th' ? 'ภาษา — EN / TH' : 'Language — EN / TH'}
          </span>
          <span className="block text-xs text-ink-soft">
            {lang === 'th' ? 'แตะเพื่อสลับภาษา' : 'Tap to switch language'}
          </span>
        </span>
        <span className="text-ink-soft">›</span>
      </button>

      <ul className="space-y-1.5">
        {MENU.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center gap-3 rounded-xl border border-line bg-cream px-3 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-100 text-teal-800">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {lang === 'th' ? item.th : item.en}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {lang === 'th' ? item.subTh : item.subEn}
                  </span>
                </span>
                <span className="text-ink-soft">›</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
