import { Camera, Car, Check, MapPin, Plane, BedDouble } from 'lucide-react'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { isSydneyTrip, tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import { formatAud, formatDate, seatsRemaining } from '../../lib/toursApi'
import { isPremiumTrip } from '../../data/tripTiers'
import SplitFlapPrice from '../ui/SplitFlapPrice'
import TripBookButton from './TripBookButton'

type Props = {
  tour: Tour
  includes: string[]
}

const AVATAR_COLORS = ['bg-teal-600', 'bg-teal-700', 'bg-coral', 'bg-teal-800']

const SYDNEY_FEATURE_ICONS = [
  { icon: Car, en: 'Route pickup', th: 'รถรับ–ส่งตามเส้นทาง' },
  { icon: MapPin, en: 'Thai Town / Starbucks', th: 'นัดพบ Thai Town / Starbucks' },
  { icon: Camera, en: 'Photographer', th: 'ช่างภาพ' },
] as const

const TRAVEL_FEATURE_ICONS = [
  { icon: Plane, en: 'Flight help', th: 'ช่วยจองบิน' },
  { icon: BedDouble, en: 'Stay included', th: 'รวมที่พัก' },
  { icon: Camera, en: 'Photographer', th: 'ช่างภาพ' },
] as const

export default function TripPricingCard({ tour, includes }: Props) {
  const { lang } = useLang()
  const seats = seatsRemaining(tour)
  const sydney = isSydneyTrip(tour.trip_code)
  const booked = Math.min(tour.booked_seats, 4)
  const more = Math.max(0, tour.booked_seats - 4)
  const icons = sydney ? SYDNEY_FEATURE_ICONS : TRAVEL_FEATURE_ICONS

  return (
    <aside className="rounded-2xl border border-line bg-cream p-5 shadow-[0_12px_40px_rgba(22,38,43,0.1)] lg:sticky lg:top-24">
      {isPremiumTrip(tour.trip_code) && (
        <span className="mb-3 inline-block rounded-md bg-coral px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-cream">
          Flagship Trip
          <span className="mt-0.5 block font-thai text-[8.5px] font-semibold normal-case opacity-90">
            ทริปเรือธง
          </span>
        </span>
      )}

      <p className="text-[12.5px] text-ink-soft">
        {tourDurationLabel(tour, lang)}
        <span className="ml-1 font-thai text-[#8aa39a]">
          {lang === 'th' ? '' : ` · ${tourDurationLabel(tour, 'th')}`}
        </span>
      </p>
      <p className="mt-1 text-[12.5px] font-bold text-ink">
        {tourDestination(tour.trip_code)} · {tour.trip_code}
      </p>

      <div className="group mt-3">
        <SplitFlapPrice amountAud={tour.price_aud} className="text-[28px] font-extrabold text-ink" board />
        <span className="ml-1 text-xs font-semibold text-ink-soft">AUD / person</span>
      </div>
      <p className="mt-1 text-[10.5px] text-ink-soft">
        {lang === 'th'
          ? 'จิ้มหรือโฮเวอร์ตัวเลขดูแอนิเมชัน'
          : 'Tap or hover the price for the split-flap flip'}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {icons.map(({ icon: Icon, en, th }) => (
          <div key={en} className="rounded-[10px] bg-mint-100 px-1 py-2 text-center">
            <Icon className="mx-auto h-4 w-4 text-teal-800" strokeWidth={2} />
            <span className="mt-1 block text-[9px] font-bold leading-snug text-teal-800">{en}</span>
            <small className="block font-thai text-[7.5px] text-ink-soft">{th}</small>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-mint-100/60 p-3">
        <p className="text-xs font-bold text-ink">
          {lang === 'th' ? 'กลุ่มทริปนี้' : 'Join this group'}
        </p>
        <div className="mt-2 space-y-1 text-[11px] text-ink-soft">
          <p>
            📅 {formatDate(tour.departure_date, lang)}
            <span className="font-thai">
              {lang === 'en' ? ' · meetup morning of' : ' · นัดพบเช้าวันเดินทาง'}
            </span>
          </p>
          <p>
            📍{' '}
            {sydney
              ? lang === 'th'
                ? 'Thai Town / Starbucks · รับ–ส่งตามเส้นทางทริป'
                : 'Thai Town / Starbucks · pickup along the route'
              : tourDestination(tour.trip_code)}
            {!sydney && (
              <span className="font-thai">
                {lang === 'en' ? ' · pickup details after deposit' : ' · จุดรับหลังมัดจำ'}
              </span>
            )}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-teal-700">
            {seats} {lang === 'th' ? 'ที่นั่งว่าง' : 'seats left'}
            {sydney && (
              <span className="mt-0.5 block text-[9px] font-medium text-ink-soft">
                {lang === 'th' ? 'สูงสุด 4 คน / ทริป' : 'Max 4 guests / trip'}
              </span>
            )}
          </span>
          <div className="flex -space-x-2">
            {Array.from({ length: Math.max(booked, 1) }).map((_, i) => (
              <span
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-cream ring-2 ring-cream ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
            {more > 0 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-[10px] font-bold text-cream ring-2 ring-cream">
                +{more}
              </span>
            )}
          </div>
        </div>
        {sydney && (
          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-teal-800">
            <Car className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            {lang === 'th'
              ? 'Tesla Model Y · base ซิดนีย์ · ไม่รวมบิน/ที่พัก'
              : 'Tesla Model Y · Sydney-based · no flights or stay'}
          </p>
        )}
      </div>

      {includes.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-dashed border-line pt-3">
          {includes.slice(0, 4).map((item) => (
            <li key={item} className="flex gap-2 text-[11px] text-ink-soft">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-teal-600" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[10.5px] text-ink-soft">
        {lang === 'th' ? 'มัดจำ' : 'Deposit'}: {formatAud(tour.deposit_aud)}
      </p>

      <TripBookButton tour={tour} variant="deep" className="mt-1.5" />
    </aside>
  )
}
