import { Camera, Car, Check, MapPin, MessageCircle, Plane, Star, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { isOneDayTrip } from '../../lib/tourDisplay'
import { FacebookIcon } from '../contact/contactIcons'
import { useLang } from '../../hooks/useLang'
import type { BookingStatus } from '../../types/tour'

type Step = {
  id: string
  icon: LucideIcon
  titleEn: string
  titleTh: string
  bodyEn: string
  bodyTh: string
  link?: { href: string; labelEn: string; labelTh: string }
}

const STEPS: Step[] = [
  {
    id: 'choose',
    icon: MapPin,
    titleEn: 'Choose your trip',
    titleTh: 'เลือกทริป',
    bodyEn: 'You picked your dates and seats.',
    bodyTh: 'คุณเลือกวันและที่นั่งแล้ว',
  },
  {
    id: 'deposit',
    icon: Check,
    titleEn: 'Pay deposit',
    titleTh: 'ชำระมัดจำ',
    bodyEn: 'Deposit secures your seat.',
    bodyTh: 'มัดจำเพื่อล็อคที่นั่ง',
  },
  {
    id: 'facebook',
    icon: MessageCircle,
    titleEn: 'Message us on Facebook',
    titleTh: 'ทัก Facebook',
    bodyEn: 'Send your booking reference to our Page inbox to join the group chat.',
    bodyTh: 'ส่งเลขที่การจองเข้าเพจเพื่อเข้ากลุ่มแชท',
    link: { href: FACEBOOK_PAGE_URL, labelEn: 'Open Facebook Page', labelTh: 'เปิดเพจ Facebook' },
  },
  {
    id: 'setup',
    icon: Users,
    titleEn: 'We set up your group',
    titleTh: 'เราจัดกลุ่มให้',
    bodyEn: 'Flights, installments, pickup point, and baggage rules — coordinated with you.',
    bodyTh: 'ตั๋วเครื่องบิน ผ่อนชำระ จุดรับ และกฎกระเป๋า — คุยกับคุณทีละขั้น',
  },
  {
    id: 'tripday',
    icon: Plane,
    titleEn: 'Trip day',
    titleTh: 'วันเดินทาง',
    bodyEn: 'Meet the group and start shooting.',
    bodyTh: 'พบกลุ่มและเริ่มถ่ายภาพ',
  },
  {
    id: 'photos',
    icon: Camera,
    titleEn: 'Trip ends — photos via Pic-Time',
    titleTh: 'จบทริป — รับภาพผ่าน Pic-Time',
    bodyEn: 'Edited gallery link arrives after the trip.',
    bodyTh: 'ลิงก์อัลบั้มภาพแต่งจะส่งหลังทริป',
  },
  {
    id: 'review',
    icon: Star,
    titleEn: 'Leave a review',
    titleTh: 'รีวิวหลังทริป',
    bodyEn: 'Tell future travellers how it went.',
    bodyTh: 'เล่าประสบการณ์ให้เพื่อนนักเดินทางคนต่อไป',
  },
]

function completedCount(status: BookingStatus | string): number {
  switch (status) {
    case 'fully_paid':
      return 2
    case 'deposit_paid':
      return 2
    case 'pending_payment':
      return 1
    case 'cancelled':
    case 'no_show':
      return 0
    default:
      return 1
  }
}

type Props = {
  bookingStatus: BookingStatus | string
  tripCode?: string
  className?: string
}

export default function BookingJourneyTimeline({
  bookingStatus,
  tripCode = '',
  className = '',
}: Props) {
  const { lang } = useLang()
  const oneDay = tripCode ? isOneDayTrip(tripCode) : false
  const doneThrough = completedCount(bookingStatus)
  const nextIndex = Math.min(doneThrough, STEPS.length - 1)

  return (
    <section className={className}>
      <h3 className="font-serif text-lg text-ink">
        {lang === 'th' ? 'ขั้นตอนถัดไป' : 'What happens next'}
      </h3>
      <ol className="relative mt-4 space-y-0 pl-2">
        <div
          className="absolute bottom-3 left-[19px] top-3 w-px border-l border-dashed border-line"
          aria-hidden
        />
        {STEPS.map((step, index) => {
          const Icon = oneDay && step.id === 'tripday' ? Car : step.icon
          const done = index < doneThrough
          const current = index === nextIndex && doneThrough < STEPS.length
          let title = lang === 'th' ? step.titleTh : step.titleEn
          let body = lang === 'th' ? step.bodyTh : step.bodyEn

          if (oneDay && step.id === 'setup') {
            title = lang === 'th' ? 'ยืนยันจุดนัดพบ' : 'Confirm meetup point'
            body =
              lang === 'th'
                ? 'นัดพบ Thai Town / Starbucks · รถรับ–ส่งตามเส้นทาง · ผ่อนชำระ (ไม่มีบิน/ที่พัก)'
                : 'Meetup Thai Town / Starbucks · route pickup · installments (no flights or hotel)'
          }
          if (oneDay && step.id === 'tripday') {
            title = lang === 'th' ? 'วันทริป' : 'Trip day'
            body =
              lang === 'th'
                ? 'พบที่จุดนัด แล้วขึ้นรถไปตามเส้นทางถ่ายภาพ'
                : 'Meet at the pickup point, then we drive the photo route together.'
          }

          return (
            <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              <span
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? 'bg-teal-900 text-cream'
                    : current
                      ? 'bg-teal-500 text-ink ring-2 ring-teal-500/30'
                      : 'bg-mint-100 text-ink-soft'
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : step.id === 'facebook' ? (
                  <FacebookIcon className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={2} />
                )}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className={`text-sm font-medium ${done || current ? 'text-ink' : 'text-ink-soft'}`}>
                  {title}
                  {done && <span className="ml-1 text-teal-600">✓</span>}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{body}</p>
                {step.link && (current || doneThrough >= 2) && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-medium uppercase tracking-wider text-teal-600"
                  >
                    {lang === 'th' ? step.link.labelTh : step.link.labelEn} →
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
