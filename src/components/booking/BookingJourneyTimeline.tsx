import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { isOneDayTrip } from '../../lib/tourDisplay'
import { useLang } from '../../hooks/useLang'
import type { BookingStatus } from '../../types/tour'

type Step = {
  id: string
  titleEn: string
  titleTh: string
  bodyEn?: string
  bodyTh?: string
  link?: { href: string; labelEn: string; labelTh: string }
}

const STEPS: Step[] = [
  {
    id: 'choose',
    titleEn: 'Choose your trip',
    titleTh: 'เลือกทริป',
  },
  {
    id: 'deposit',
    titleEn: 'Pay deposit',
    titleTh: 'มัดจำ',
  },
  {
    id: 'facebook',
    titleEn: 'Message us on Facebook',
    titleTh: 'Inbox Facebook เพจ',
    bodyEn: 'Send your screenshot to start the group chat.',
    bodyTh: 'ส่งภาพแคปหน้าจอเพื่อเริ่มกลุ่มแชท',
    link: { href: FACEBOOK_PAGE_URL, labelEn: 'Open Facebook Page', labelTh: 'เปิดเพจ Facebook' },
  },
  {
    id: 'setup',
    titleEn: 'We set up your trip group',
    titleTh: 'ทีมสร้างกลุ่มทริปให้คุณ',
    bodyEn: 'Flight booking help, installment payments, pickup point & airline baggage rules.',
    bodyTh: 'ช่วยจองตั๋วบิน แจ้งงวดชำระเงิน นัดจุดรับส่ง และกฎน้ำหนักสัมภาระ',
  },
  {
    id: 'tripday',
    titleEn: 'Trip day',
    titleTh: 'วันออกเดินทาง',
    bodyEn: 'Prep checklist, briefing & safety reminders.',
    bodyTh: 'เช็คลิสต์เตรียมตัว บรีฟฟิ่ง และคำเตือนด้านความปลอดภัย',
  },
  {
    id: 'photos',
    titleEn: 'Trip ends',
    titleTh: 'จบทริป',
    bodyEn: 'We send your photo gallery link via Pic-Time.',
    bodyTh: 'ส่งลิงก์รูปภาพจากทริปผ่าน Pic-Time',
  },
  {
    id: 'review',
    titleEn: 'Leave a review',
    titleTh: 'รีวิวและขอบคุณ',
  },
]

/** How many leading steps are complete for a given booking status. */
function completedCount(status: BookingStatus | string): number {
  switch (status) {
    case 'fully_paid':
      return 2
    case 'deposit_paid':
      return 2
    case 'pending_payment':
      // User has submitted the deposit — choose + deposit done; Facebook is current.
      return 2
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
    <section className={`journey-wrap ${className}`.trim()}>
      <div className="jw-title">
        What happens next
        <span className="th">ขั้นตอนหลังจากนี้</span>
      </div>
      <div className="journey-steps" role="list">
        {STEPS.map((step, index) => {
          const done = index < doneThrough
          const current = index === nextIndex && doneThrough < STEPS.length
          let titleEn = step.titleEn
          let titleTh = step.titleTh
          let bodyEn = step.bodyEn
          let bodyTh = step.bodyTh

          if (oneDay && step.id === 'setup') {
            titleEn = 'Confirm meetup point'
            titleTh = 'ยืนยันจุดนัดพบ'
            bodyEn =
              'Meetup Thai Town / Starbucks · route pickup · installments (no flights or hotel)'
            bodyTh =
              'นัดพบ Thai Town / Starbucks · รถรับ–ส่งตามเส้นทาง · ผ่อนชำระ (ไม่มีบิน/ที่พัก)'
          }
          if (oneDay && step.id === 'tripday') {
            titleEn = 'Trip day'
            titleTh = 'วันทริป'
            bodyEn = 'Meet at the pickup point, then we drive the photo route together.'
            bodyTh = 'พบที่จุดนัด แล้วขึ้นรถไปตามเส้นทางถ่ายภาพ'
          }

          const stepClass = ['j-step', done ? 'done' : '', current ? 'current' : '']
            .filter(Boolean)
            .join(' ')

          return (
            <div key={step.id} className={stepClass} role="listitem">
              <span className="jn" aria-hidden>
                {done ? '✓' : index + 1}
              </span>
              <div className="jtxt">
                <b>
                  {lang === 'th' ? titleTh : titleEn}
                  <span
                    className="th"
                    style={{ display: 'block', fontWeight: 500 }}
                  >
                    {lang === 'th' ? titleEn : titleTh}
                  </span>
                </b>
                {(bodyEn || bodyTh) && (
                  <>
                    <span>{lang === 'th' ? bodyTh : bodyEn}</span>
                    <span className="th">{lang === 'th' ? bodyEn : bodyTh}</span>
                  </>
                )}
                {step.link && (current || doneThrough >= 2) && (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex text-[9.5px] font-semibold text-[#1877F2]"
                  >
                    {lang === 'th' ? step.link.labelTh : step.link.labelEn} →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
