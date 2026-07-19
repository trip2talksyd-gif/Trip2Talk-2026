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
    <div className="space-y-0 pb-4">
      <div
        className="px-[18px] pb-5 pt-9 text-center text-cream"
        style={{ background: 'linear-gradient(120deg, #16262b, #2e4d53)' }}
      >
        <div className="mx-auto mb-2 flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-white/30 bg-mint-200 text-[18px] font-extrabold text-teal-900">
          T2
        </div>
        <b className="block text-[14px] font-bold">Trip2Talk Guest</b>
        <span className="block text-[10px] text-mint-200">
          {lang === 'th'
            ? 'จองแบบแขก — ไม่ต้องล็อกอิน'
            : 'Guest booking — no account login required'}
        </span>
        <div className="mt-3 flex justify-center gap-[22px]">
          <div>
            <p className="m-0 text-[15px] font-extrabold">{favorites.length}</p>
            <p className="m-0 mt-px text-[8px] uppercase tracking-[0.05em] text-mint-200">
              {lang === 'th' ? 'บันทึก' : 'Saved'}
            </p>
          </div>
          <div>
            <p className="m-0 text-[15px] font-extrabold">EN/TH</p>
            <p className="m-0 mt-px text-[8px] uppercase tracking-[0.05em] text-mint-200">
              {lang === 'th' ? 'ภาษา' : 'Language'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-[70px] pt-3.5">
        <button
          type="button"
          onClick={toggleLang}
          className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-[11px] text-left"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-mint-100 text-[13px] text-teal-700">
            <Languages className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[11.5px] font-semibold text-ink">
              {lang === 'th' ? 'ภาษา — EN / TH' : 'Language — EN / TH'}
            </b>
            <span className="block font-thai text-[9px] text-ink-soft">
              {lang === 'th' ? 'แตะเพื่อสลับภาษา' : 'Tap to switch language'}
            </span>
          </span>
          <span className="text-[12px] text-ink-soft">›</span>
        </button>

        {MENU.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-[11px]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-mint-100 text-teal-700">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[11.5px] font-semibold text-ink">
                  {lang === 'th' ? item.th : item.en}
                </b>
                <span className="block font-thai text-[9px] text-ink-soft">
                  {lang === 'th' ? item.subTh : item.subEn}
                </span>
              </span>
              <span className="text-[12px] text-ink-soft">›</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
