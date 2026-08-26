import { CalendarDays, Camera, MapPin, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import BiDisplayHeading from '../ui/BiDisplayHeading'
import { useLang } from '../../hooks/useLang'
import type { Tour } from '../../types/tour'
import {
  isAuroraTrip,
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { formatAud, isListedPriceHidden } from '../../lib/toursApi'
import { isPremiumTrip } from '../../data/tripTiers'
import { photoStyleTagsForTrip } from '../../data/photoSpotsDraft'
import type { StayTier } from '../../data/luxuryStay'

const TAG_LABEL: Record<string, { en: string; th: string }> = {
  Landscape: { en: 'Landscape', th: 'วิวทิวทัศน์' },
  Portrait: { en: 'Portrait', th: 'พอร์ตเทรต' },
  Aurora: { en: 'Aurora', th: 'ออโรร่า' },
  Coastal: { en: 'Coastal', th: 'ชายฝั่ง' },
  Sunrise: { en: 'Sunrise', th: 'พระอาทิตย์ขึ้น' },
  Sunset: { en: 'Sunset', th: 'พระอาทิตย์ตก' },
  Night: { en: 'Night', th: 'กลางคืน' },
  'Milky Way': { en: 'Milky Way', th: 'ทางช้างเผือก' },
  Nature: { en: 'Nature', th: 'ธรรมชาติ' },
}

type Fact = {
  id: string
  icon: LucideIcon
  en: string
  th: string
  subEn?: string
  subTh?: string
}

type Props = {
  tour: Tour
  stayTier?: StayTier
  displayPriceAud?: number
}

function styleTags(tour: Tour): string[] {
  const tags = [...photoStyleTagsForTrip(tour.trip_code)]
  if (isAuroraTrip(tour) && !tags.includes('Aurora')) tags.unshift('Aurora')
  return tags.slice(0, 4)
}

export default function TripQuickFacts({ tour, stayTier = 'standard', displayPriceAud }: Props) {
  const { lang } = useLang()
  const thaiPrimary = lang === 'th'
  const destEn = tourDestinationLabel(tour.trip_code, 'en')
  const destTh = tourDestinationLabel(tour.trip_code, 'th')
  const durationEn = tourDurationLabel(tour, 'en')
  const durationTh = tourDurationLabel(tour, 'th')
  const priceHidden = isListedPriceHidden(tour)
  const premium = isPremiumTrip(tour.trip_code)
  const tags = styleTags(tour)
  const shownPrice = displayPriceAud ?? tour.price_aud
  const luxurySelected = stayTier === 'luxury'

  const facts: Fact[] = []
  if (destEn) {
    facts.push({ id: 'dest', icon: MapPin, en: destEn, th: destTh || destEn })
  }
  if (durationEn) {
    facts.push({ id: 'dur', icon: CalendarDays, en: durationEn, th: durationTh || durationEn })
  }
  if (priceHidden) {
    facts.push({
      id: 'price',
      icon: Wallet,
      en: luxurySelected ? 'Luxury · Price TBA' : premium ? 'Flagship · Price TBA' : 'Standard · Price TBA',
      th: luxurySelected ? 'พรีเมียม · ราคารอประกาศ' : premium ? 'เรือธง · ราคารอประกาศ' : 'มาตรฐาน · ราคารอประกาศ',
    })
  } else if (shownPrice > 0) {
    facts.push({
      id: 'price',
      icon: Wallet,
      en: luxurySelected
        ? `Luxury · ${formatAud(shownPrice)}`
        : premium
          ? `Flagship · ${formatAud(shownPrice)}`
          : `Standard · ${formatAud(shownPrice)}`,
      th: luxurySelected
        ? `พรีเมียม · ${formatAud(shownPrice)}`
        : premium
          ? `เรือธง · ${formatAud(shownPrice)}`
          : `มาตรฐาน · ${formatAud(shownPrice)}`,
    })
  }
  if (tags.length > 0) {
    const labels = tags.map((t) => TAG_LABEL[t] ?? { en: t, th: t })
    facts.push({
      id: 'tags',
      icon: Camera,
      en: labels.map((l) => l.en).join(' · '),
      th: labels.map((l) => l.th).join(' · '),
    })
  }

  if (facts.length === 0) return null

  return (
    <section className="rounded-[18px] border border-line bg-cream-app px-3 py-3 shadow-[0_8px_18px_-12px_rgba(15,28,30,0.3)]">
      <BiDisplayHeading
        as="h2"
        thAs="p"
        en="Trip at a glance"
        th="สรุปทริปสั้นๆ"
        className="mb-2.5"
        enClassName="text-[13px] font-semibold leading-snug text-teal-dark"
        thClassName="mt-0.5 text-[11px] font-medium text-ink-soft"
      />
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        {facts.map((fact) => {
          const Icon = fact.icon
          return (
            <li
              key={fact.id}
              className="min-w-[6.5rem] flex-1 rounded-xl bg-mint-100 px-2.5 py-2"
            >
              <Icon className="mb-1 h-3.5 w-3.5 text-orange" strokeWidth={2.25} aria-hidden />
              {thaiPrimary ? (
                <>
                  <p lang="th" className="overflow-visible font-serif text-[11px] font-medium leading-normal text-teal-dark">
                    {fact.th}
                  </p>
                  <p lang="en" className="mt-0.5 font-display text-[9px] leading-snug text-ink-soft">
                    {fact.en}
                  </p>
                </>
              ) : (
                <>
                  <p lang="en" className="font-display text-[11px] font-medium leading-snug text-teal-dark">
                    {fact.en}
                  </p>
                  <p lang="th" className="mt-0.5 overflow-visible font-serif text-[9px] leading-normal text-ink-soft">
                    {fact.th}
                  </p>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
