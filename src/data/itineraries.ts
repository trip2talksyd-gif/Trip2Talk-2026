import { resolveTemplateTripCode } from '../lib/tripCode'

export type ItinerarySeason = 'spring' | 'summer' | 'autumn' | 'winter'

export const ITINERARY_SEASONS: ItinerarySeason[] = ['spring', 'summer', 'autumn', 'winter']

export const SEASON_LABELS: Record<
  ItinerarySeason,
  { en: string; th: string; months: { en: string; th: string } }
> = {
  spring: {
    en: 'Spring',
    th: 'ฤดูใบไม้ผลิ',
    months: { en: 'Sep–Nov', th: 'ก.ย.–พ.ย.' },
  },
  summer: {
    en: 'Summer',
    th: 'ฤดูร้อน',
    months: { en: 'Dec–Feb', th: 'ธ.ค.–ก.พ.' },
  },
  autumn: {
    en: 'Autumn',
    th: 'ฤดูใบไม้ร่วง',
    months: { en: 'Mar–May', th: 'มี.ค.–พ.ค.' },
  },
  winter: {
    en: 'Winter',
    th: 'ฤดูหนาว',
    months: { en: 'Jun–Aug', th: 'มิ.ย.–ส.ค.' },
  },
}

export type SeasonItineraryVariant = {
  days: ItineraryDay[]
  label?: { en: string; th: string }
  seasonNote?: { en: string; th: string }
}

export type TripItinerary = {
  detailed: boolean
  /** Flat day-by-day — used by most trips */
  days?: ItineraryDay[]
  /** Season-keyed variants — used by NZ-6D5N */
  seasonalItineraries?: Partial<Record<ItinerarySeason, SeasonItineraryVariant>>
  headerNote?: { en: string; th: string }
}

export function isSeasonalItinerary(itinerary: TripItinerary): boolean {
  return (
    itinerary.seasonalItineraries != null &&
    Object.values(itinerary.seasonalItineraries).some((v) => v?.days?.length)
  )
}

/** Southern-hemisphere season from a departure date (NZ) */
export function seasonFromDate(date: string | null | undefined): ItinerarySeason {
  if (!date) return 'spring'
  const month = new Date(date.includes('T') ? date : `${date}T12:00:00`).getMonth() + 1
  if (month >= 9 && month <= 11) return 'spring'
  if (month === 12 || month <= 2) return 'summer'
  if (month >= 3 && month <= 5) return 'autumn'
  return 'winter'
}

export function getAvailableSeasons(itinerary: TripItinerary): ItinerarySeason[] {
  if (!itinerary.seasonalItineraries) return []
  return ITINERARY_SEASONS.filter((s) => (itinerary.seasonalItineraries?.[s]?.days.length ?? 0) > 0)
}

export function getDefaultSeason(itinerary: TripItinerary, nextDate?: string | null): ItinerarySeason {
  const available = getAvailableSeasons(itinerary)
  if (available.length === 0) return 'spring'
  const fromDate = seasonFromDate(nextDate)
  if (available.includes(fromDate)) return fromDate
  return available[0]
}

export function getItineraryDays(
  itinerary: TripItinerary,
  season?: ItinerarySeason,
): ItineraryDay[] {
  if (isSeasonalItinerary(itinerary) && season) {
    return itinerary.seasonalItineraries?.[season]?.days ?? []
  }
  return itinerary.days ?? []
}

export function getSeasonVariant(
  itinerary: TripItinerary,
  season: ItinerarySeason,
): SeasonItineraryVariant | undefined {
  return itinerary.seasonalItineraries?.[season]
}

export type ItineraryEventCategory = 'flight' | 'stay' | 'activity' | 'meal'

export type ItineraryEvent = {
  time: string
  description: { en: string; th: string }
  /** Optional activity type for Trip Plan timeline icons. Defaults to 'activity'. */
  category?: ItineraryEventCategory
}

export type ItineraryDay = {
  day: number
  title: { en: string; th: string }
  subtitle: { en: string; th: string }
  events: ItineraryEvent[]
  note?: { en: string; th: string }
}

/** NZ-6D5N Autumn & Winter share the same South Island route */
const NZ_AUTUMN_WINTER_DAYS: ItineraryDay[] = [
  {
    day: 1,
    title: {
      en: 'Day 1 — Colors of Autumn',
      th: 'วัน 1 — สีสันแห่งฤดูใบไม้ร่วง',
    },
    subtitle: {
      en: 'Queenstown → Arrowtown → Wanaka',
      th: 'Queenstown → Arrowtown → Wanaka',
    },
    events: [
      {
        time: '08:00',
        category: 'flight',
        description: {
          en: 'Jetstar arrival Queenstown — trip begins, SUV pickup',
          th: 'ถึง Queenstown — เริ่มทริป รับรถ SUV',
        },
      },
      {
        time: '10:00',
        category: 'activity',
        description: {
          en: 'Arrowtown — famous autumn foliage, street & tree-tunnel photography in orange/red tones',
          th: 'Arrowtown — ใบไม้เปลี่ยนสีดัง ถ่ายถนนและอุโมงค์ต้นไม้โทนส้ม-แดง',
        },
      },
      {
        time: '14:00',
        category: 'flight',
        description: {
          en: 'Afternoon drive into Wanaka',
          th: 'บ่ายขับเข้า Wanaka',
        },
      },
      {
        time: '17:00',
        category: 'activity',
        description: {
          en: "That Wanaka Tree — lone tree in the lake icon shot",
          th: 'That Wanaka Tree — มุมไอคอนต้นไม้โดดเดี่ยวกลางน้ำ',
        },
      },
      {
        time: '20:00',
        category: 'meal',
        description: {
          en: 'Group dinner in Wanaka',
          th: 'มื้อเย็นกลุ่มที่ Wanaka',
        },
      },
      {
        time: '22:00',
        category: 'stay',
        description: {
          en: 'Check in — overnight Wanaka',
          th: 'เช็คอิน — ค้างคืน Wanaka',
        },
      },
    ],
  },
  {
    day: 2,
    title: {
      en: 'Day 2 — Crossing to the Glacier',
      th: 'วัน 2 — ข้ามสู่ธารน้ำแข็ง',
    },
    subtitle: {
      en: 'Wanaka → Fox Glacier via autumn forest routes',
      th: 'Wanaka → Fox Glacier ผ่านป่าใบไม้ร่วง',
    },
    events: [
      {
        time: '08:00',
        description: {
          en: 'Depart Wanaka — cross to the West Coast through autumn-coloured forest routes',
          th: 'ออกจาก Wanaka — ข้ามไปชายฝั่งตะวันตกผ่านเส้นทางป่าใบไม้ร่วง',
        },
      },
      {
        time: '13:00',
        description: {
          en: 'Arrive Fox Glacier region — lunch stop',
          th: 'ถึง Fox Glacier — มื้อกลางวัน',
        },
      },
      {
        time: '16:00',
        description: {
          en: "Photograph the ancient glacier's grandeur",
          th: 'ถ่ายความยิ่งใหญ่ของธารน้ำแข็งโบราณ',
        },
      },
      {
        time: '18:30',
        description: {
          en: 'West Coast golden hour session',
          th: 'ถ่าย Golden hour ชายฝั่งตะวันตก',
        },
      },
    ],
  },
  {
    day: 3,
    title: {
      en: 'Day 3 — Golden Grassland Route',
      th: 'วัน 3 — เส้นทางทุ่งหญ้าสีทอง',
    },
    subtitle: {
      en: 'Fox Glacier → Lindis Pass → Lake Pukaki',
      th: 'Fox Glacier → Lindis Pass → Lake Pukaki',
    },
    events: [
      {
        time: '08:00',
        description: {
          en: 'Drive back through central South Island via Lindis Pass golden grassland ridge route',
          th: 'ขับกลับผ่านเกาะใต้ตอนกลาง ทาง Lindis Pass สันเขาทุ่งหญ้าสีทอง',
        },
      },
      {
        time: '13:00',
        description: {
          en: 'Lindis Pass lookout — panoramic grassland photography',
          th: 'จุดชม Lindis Pass — ถ่ายทุ่งหญ้า panorama',
        },
      },
      {
        time: '17:30',
        description: {
          en: "Lake Pukaki — turquoise water in evening light",
          th: 'Lake Pukaki — น้ำสีฟ้าเขียวยามเย็น',
        },
      },
    ],
  },
  {
    day: 4,
    title: {
      en: 'Day 4 — Embrace of the Snow Mountains',
      th: 'วัน 4 — ในอ้อมกอดขุนเขาหิมะ',
    },
    subtitle: {
      en: "Lake Pukaki → Peter's Lookout → Aoraki/Mount Cook",
      th: "Lake Pukaki → Peter's Lookout → Aoraki/Mount Cook",
    },
    events: [
      {
        time: '07:00',
        description: {
          en: 'Drive toward the snow peaks from Lake Pukaki',
          th: 'ขับมุ่งหน้าสู่ยอดเขาหิมะจาก Lake Pukaki',
        },
      },
      {
        time: '10:00',
        description: {
          en: "Peter's Lookout — long road leading to the mountains",
          th: "Peter's Lookout — ถนนยาวสู่ขุนเขา",
        },
      },
      {
        time: '13:00',
        description: {
          en: 'Enter Aoraki/Mount Cook National Park — close nature photography trail',
          th: 'เข้าอุทยาน Aoraki/Mount Cook — เดินถ่ายธรรมชาติระยะใกล้',
        },
      },
      {
        time: '17:30',
        description: {
          en: 'Evening light session in the alpine valley',
          th: 'ถ่ายแสงยามเย็นในหุบเขาบนภูเขา',
        },
      },
    ],
  },
  {
    day: 5,
    title: {
      en: 'Day 5 — Stone Church and Lake of Stars',
      th: 'วัน 5 — โบสถ์หินและทะเลสาบแห่งดวงดาว',
    },
    subtitle: {
      en: 'Mount Cook → Lake Tekapo → heading south',
      th: 'Mount Cook → Lake Tekapo → มุ่งหน้าใต้',
    },
    events: [
      {
        time: '07:00',
        description: {
          en: 'Morning at Lake Tekapo — Church of the Good Shepherd amid autumn lakeside colours',
          th: 'เช้าที่ Lake Tekapo — Church of the Good Shepherd ท่ามกลางสีสันฤดูใบไม้ร่วงริมทะเลสาบ',
        },
      },
      {
        time: '11:00',
        description: {
          en: 'Drive south toward the Fiordland gateway region',
          th: 'ขับลงใต้สู่บริเวณทางเข้า Fiordland',
        },
      },
      {
        time: '16:00',
        description: {
          en: 'Overnight near Te Anau / Fiordland gateway',
          th: 'พักค้างใกล้ Te Anau / ทางเข้า Fiordland',
        },
      },
    ],
  },
  {
    day: 6,
    title: {
      en: 'Day 6 — Fiordland Wonder',
      th: 'วัน 6 — มหัศจจรรย์ Fiordland',
    },
    subtitle: {
      en: 'Milford Sound → Queenstown → departure',
      th: 'Milford Sound → Queenstown → กลับ',
    },
    events: [
      {
        time: '06:00',
        description: {
          en: 'Early departure for Milford Sound cruise amid steep cliffs and waterfalls',
          th: 'ออกเช้าล่องเรือ Milford Sound ท่ามกลางหน้าผาและน้ำตก',
        },
      },
      {
        time: '12:00',
        description: {
          en: 'Drive back to Queenstown',
          th: 'ขับกลับ Queenstown',
        },
      },
      {
        time: '14:00',
        description: {
          en: 'Souvenir shopping & free time in Queenstown',
          th: 'ช้อปของที่ระลึก & เวลาว่าง Queenstown',
        },
      },
      {
        time: '16:00',
        description: {
          en: 'Transfer to Queenstown Airport — Jetstar flight to Sydney',
          th: 'รถไปสนามบิน Queenstown — บิน Jetstar กลับซิดนีย์',
        },
      },
    ],
  },
]

/**
 * TAS-LH 3D2N — explicit alias of TAS-LH-4D3N with the farewell buffer day removed.
 * Day 3 folds MONA / Hobart daylight into the departure afternoon (2 nights only).
 * Keys TAS-LH-3D2N-DEC / TAS-LH-3D2N-WIN are registered manually below — do NOT rely on
 * resolveTemplateTripCode (3D2N does not prefix-match 4D3N).
 */
const TAS_LH_3D2N_ITINERARY: TripItinerary = {
  detailed: true,
  headerNote: {
    en: '3 days / 2 nights — condensed Launceston→Hobart photo route (from the 4D3N itinerary).',
    th: '3 วัน 2 คืน — เส้นทางถ่ายภาพ Launceston→Hobart ฉบับย่อ (จากทริป 4D3N)',
  },
  days: [
    {
      day: 1,
      title: { en: 'Day 1 — Lavender Dreams & Heritage Lines', th: 'วัน 1 — ทุ่งลาเวนเดอร์ & เส้นนำสายตา' },
      subtitle: { en: 'Bridestowe, Richmond Bridge, first aurora hunt', th: 'Bridestowe Richmond Bridge ล่าแสงใต้ครั้งแรก' },
      events: [
        { time: '08:00', description: { en: 'Arrive Launceston — Bridestowe Lavender Estate shoot', th: 'ถึง Launceston — ถ่ายที่ Bridestowe Lavender Estate' } },
        { time: '13:00', description: { en: 'Lunch & travel to Richmond', th: 'มื้อกลางวัน & ไป Richmond' } },
        { time: '15:30', description: { en: 'Richmond Bridge — leading lines technique coaching', th: 'Richmond Bridge — สอนเทคนิค leading lines' } },
        { time: '20:00', description: { en: 'First Aurora Hunt + camera setup coaching', th: 'ล่าแสงใต้ครั้งแรก + สอนตั้งค่ากล้อง' } },
      ],
    },
    {
      day: 2,
      title: { en: 'Day 2 — Cradle Mountain', th: 'วัน 2 — Cradle Mountain' },
      subtitle: { en: 'Water reflections, wildlife & second aurora mission', th: 'สะท้อนน้ำ ธรรมชาติ & ภารกิจล่าแสงใต้รอบสอง' },
      events: [
        { time: '06:00', description: { en: 'Depart for Cradle Mountain — wait for reflection shots', th: 'ออกสู่ Cradle Mountain — รอจังหวะสะท้อนน้ำ' } },
        { time: '10:00', description: { en: 'Dove Lake circuit photography', th: 'ถ่ายภาพรอบ Dove Lake' } },
        { time: '14:00', description: { en: 'Wildlife & nature photography session', th: 'ถ่ายภาพสัตว์ป่าและธรรมชาติ' } },
        { time: '21:00', description: { en: 'Second Aurora Mission at new location', th: 'ภารกิจล่าแสงใต้รอบสอง จุดใหม่' } },
      ],
      note: {
        en: 'Pack thermal layers — Cradle Mountain can be near freezing',
        th: 'เตรียมเสื้อกันหนาว — Cradle Mountain อาจใกล้ 0°C',
      },
    },
    {
      day: 3,
      title: { en: 'Day 3 — MONA, Hobart & Departure', th: 'วัน 3 — MONA Hobart & ออกเดินทาง' },
      subtitle: { en: 'Chiaroscuro morning, then Jetstar home', th: 'เช้า chiaroscuro แล้วบิน Jetstar กลับ' },
      events: [
        { time: '09:00', description: { en: 'MONA museum — chiaroscuro technique session', th: 'MONA — สอนเทคนิค chiaroscuro' } },
        { time: '12:30', description: { en: 'Hobart Market / Cascade Brewery — quick street frames', th: 'ตลาด Hobart / Cascade Brewery — เก็บภาพสตรีทสั้นๆ' } },
        { time: '15:00', description: { en: 'Transfer to Hobart Airport', th: 'รถไปสนามบิน Hobart' } },
        { time: '17:00', description: { en: 'Jetstar flight Hobart → Sydney — trip concludes', th: 'บิน Jetstar โฮบาร์ต → ซิดนีย์ — จบทริป' } },
      ],
    },
  ],
}

export const TRIP_ITINERARIES: Record<string, TripItinerary> = {
  'ULU-4D3N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — Sydney → Ayers Rock', th: 'วัน 1 — ซิดนีย์ → แอร์สร็อก' },
        subtitle: { en: 'Sydney → Ayers Rock', th: 'ซิดนีย์ → แอร์สร็อก' },
        events: [
          {
            time: 'Morning',
            category: 'flight',
            description: {
              en: 'Direct flight Sydney → Ayers Rock',
              th: 'บินตรงจาก Sydney สู่ Ayers Rock',
            },
          },
          {
            time: 'Afternoon',
            category: 'activity',
            description: { en: 'Car rental pickup', th: 'รับรถ' },
          },
          {
            time: 'Sunset',
            category: 'activity',
            description: {
              en: 'Chase the sunset light at Uluru Sunset Area',
              th: 'ล่าแสงเย็นที่ Uluru Sunset Area',
            },
          },
          {
            time: 'Night',
            category: 'activity',
            description: {
              en: 'First night under the Milky Way in the desert',
              th: 'คืนแรกกับทางช้างเผือกกลางทะเลทราย',
            },
          },
        ],
        note: { en: 'Stay: Outback Lodge', th: 'พัก: Outback Lodge' },
      },
      {
        day: 2,
        title: {
          en: 'Day 2 — Field of Light & Kata Tjuta',
          th: 'วัน 2 — Field of Light และ Kata Tjuta',
        },
        subtitle: {
          en: 'Field of Light & Kata Tjuta',
          th: 'Field of Light และ Kata Tjuta',
        },
        events: [
          {
            time: '05:15',
            category: 'activity',
            description: {
              en: 'Early wake-up for Uluru sunrise viewing',
              th: 'ตื่นเช้ามืด ชมพระอาทิตย์ขึ้นที่ Uluru',
            },
          },
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Full-day Kata Tjuta trail exploration',
              th: 'เดินป่าสำรวจ Kata Tjuta ทั้งวัน',
            },
          },
          {
            time: 'Sunset',
            category: 'activity',
            description: {
              en: 'Kata Tjuta sunset (bring warm layers!)',
              th: 'ชมพระอาทิตย์ตกที่ Kata Tjuta (เตรียมชุดกันหนาว)',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Field of Light illuminated night walk',
              th: 'เดินชมแสงไฟ Field of Light ยามค่ำคืน',
            },
          },
        ],
        note: { en: 'Stay: Outback Lodge', th: 'พัก: Outback Lodge' },
      },
      {
        day: 3,
        title: {
          en: 'Day 3 — Uluru Sunrise & Base Walk',
          th: 'วัน 3 — แสงแรกอุลูรู และ Base Walk',
        },
        subtitle: {
          en: 'Uluru Sunrise & Base Walk',
          th: 'แสงแรกอุลูรู และ Base Walk',
        },
        events: [
          {
            time: 'Sunrise',
            category: 'activity',
            description: { en: 'Sunrise light at Uluru', th: 'ชมแสงแรกที่ Uluru Sunrise' },
          },
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Uluru Base Walk — up close around the rock',
              th: 'ลุย Base Walk รอบฐานหินอุลูรูแบบใกล้ชิด',
            },
          },
          {
            time: 'Night',
            category: 'activity',
            description: {
              en: 'Full Milky Way night photography session',
              th: 'ล่าทางช้างเผือกแบบจัดเต็มช่วงค่ำ',
            },
          },
        ],
        note: { en: 'Stay: Outback Lodge', th: 'พัก: Outback Lodge' },
      },
      {
        day: 4,
        title: {
          en: 'Day 4 — Kata Tjuta Dune & Departure',
          th: 'วัน 4 — เนินทราย Kata Tjuta และเดินทางกลับ',
        },
        subtitle: {
          en: 'Kata Tjuta Dune & Departure',
          th: 'เนินทราย Kata Tjuta และเดินทางกลับ',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Morning light at Kata Tjuta Dune',
              th: 'ชมแสงเช้าที่ Kata Tjuta Dune',
            },
          },
          {
            time: 'Midday',
            category: 'activity',
            description: {
              en: 'Visit Camel Express camel farm',
              th: 'แวะเยี่ยมชมปางอูฐ Camel Express',
            },
          },
          {
            time: 'Afternoon',
            category: 'flight',
            description: {
              en: 'Transfer to airport, fly back to Sydney',
              th: 'เดินทางสู่สนามบิน บินกลับ Sydney',
            },
          },
        ],
      },
    ],
  },
  'MEL-4D3N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — The Twelve Apostles', th: 'วัน 1 — The Twelve Apostles' },
        subtitle: { en: 'SYD to MEL, Great Ocean Road golden hour', th: 'ซิดนีย์สู่เมลเบิร์น Golden hour ที่ Twelve Apostles' },
        events: [
          { time: '06:00', description: { en: 'Jetstar flight Sydney → Melbourne', th: 'บิน Jetstar ซิดนีย์ → เมลเบิร์น' } },
          { time: '09:30', description: { en: 'Pick up rental car & depart for Great Ocean Road', th: 'รับรถเช่า & ออกสู่ Great Ocean Road' } },
          { time: '16:30', description: { en: 'Twelve Apostles — evening golden hour shoot', th: 'Twelve Apostles — ถ่าย Golden hour ช่วงเย็น' } },
          { time: '19:30', description: { en: 'Dinner near Port Campbell', th: 'มื้อเย็นใกล้ Port Campbell' } },
          { time: '21:30', description: { en: 'Milky Way photography (conditions permitting)', th: 'ถ่ายทางช้างเผือก (ตามสภาพอากาศ)' } },
        ],
        note: {
          en: 'Overnight near Twelve Apostles',
          th: 'พัก 1 คืนใกล้ Twelve Apostles',
        },
      },
      {
        day: 2,
        title: { en: 'Day 2 — Pink Lake', th: 'วัน 2 — Pink Lake' },
        subtitle: { en: 'Blue hour at Apostles, sunset at Pink Lake', th: 'Blue hour ที่ Apostles พระอาทิตย์ตกที่ Pink Lake' },
        events: [
          { time: '05:45', description: { en: 'Morning blue hour — Twelve Apostles revisit', th: 'Blue hour เช้า — กลับไป Twelve Apostles' } },
          { time: '08:00', description: { en: 'Checkout & breakfast', th: 'เช็คเอาท์ & อาหารเช้า' } },
          { time: '11:00', description: { en: 'Drive to Pink Lake region', th: 'ขับรถไปยัง Pink Lake' } },
          { time: '17:30', description: { en: 'Pink Lake sunset + reflection shoot', th: 'พระอาทิตย์ตก Pink Lake & ถ่ายสะท้อนน้ำ' } },
          { time: '21:00', description: { en: 'Milky Way reflection session (conditions permitting)', th: 'ถ่ายทางช้างเผือกสะท้อนน้ำ (ตามสภาพอากาศ)' } },
        ],
        note: {
          en: 'Overnight near Pink Lake',
          th: 'พัก 1 คืนใกล้ Pink Lake',
        },
      },
      {
        day: 3,
        title: { en: 'Day 3 — Melbourne City', th: 'วัน 3 — เมลเบิร์นซิตี้' },
        subtitle: { en: 'Street art, State Library, iconic landmarks', th: 'สตรีทอาร์ต State Library แลนด์มาร์กเมือง' },
        events: [
          { time: '09:00', description: { en: 'Drive into Melbourne city centre', th: 'ขับเข้าเมลเบิร์นซิตี้' } },
          { time: '11:00', description: { en: 'Hotel check-in & lunch', th: 'เช็คอินโรงแรม & มื้อกลางวัน' } },
          { time: '14:00', description: { en: 'Street art laneways & Hosier Lane', th: 'ซอยสตรีทอาร์ต & Hosier Lane' } },
          { time: '16:00', description: { en: 'State Library Victoria & Princes Bridge', th: 'State Library Victoria & Princes Bridge' } },
          { time: '18:00', description: { en: 'Flinders Street Station golden hour', th: 'Flinders Street Station ช่วง Golden hour' } },
        ],
        note: {
          en: 'Overnight in Melbourne CBD',
          th: 'พัก 1 คืนในเมลเบิร์น CBD',
        },
      },
      {
        day: 4,
        title: { en: 'Day 4 — Departure', th: 'วัน 4 — กลับซิดนีย์' },
        subtitle: { en: 'Quiet morning streets, return car, fly home', th: 'เมืองเงียบยามเช้า คืนรถ บินกลับ' },
        events: [
          { time: '06:30', description: { en: 'Early morning city photography — quiet streets, soft light', th: 'ถ่ายเมืองยามเช้า — ถนนเงียบ แสงนุ่ม' } },
          { time: '09:00', description: { en: 'Checkout & drive to Melbourne Airport', th: 'เช็คเอาท์ & ขับไปสนามบินเมลเบิร์น' } },
          { time: '10:30', description: { en: 'Return rental car', th: 'คืนรถเช่า' } },
          { time: '12:00', description: { en: 'Jetstar flight Melbourne → Sydney', th: 'บิน Jetstar เมลเบิร์น → ซิดนีย์' } },
          { time: '13:30', description: { en: 'Arrive Sydney — trip concludes', th: 'ถึงซิดนีย์ — จบทริป' } },
        ],
      },
    ],
  },
  'TAS-3D2N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — Heritage & The Peak', th: 'วัน 1 — มรดกโลก & ยอดเขา' },
        subtitle: { en: 'Port Arthur, Hobart Market, Mt Wellington aurora', th: 'Port Arthur ตลาด Hobart ล่าแสงใต้ Mt Wellington' },
        events: [
          { time: '07:00', description: { en: 'Jetstar arrival — private SUV pickup at Hobart Airport', th: 'ถึงโฮบาร์ต — รถ SUV รับที่สนามบิน' } },
          { time: '09:30', description: { en: 'Port Arthur Historic Site — heritage photography', th: 'Port Arthur Historic Site — ถ่ายภาพมรดกโลก' } },
          { time: '14:00', description: { en: 'Hobart Market — street & portrait opportunities', th: 'ตลาด Hobart — ถ่ายสตรีทและภาพบุคคล' } },
          { time: '17:30', description: { en: 'Mount Wellington (kunanyi) sunset', th: 'พระอาทิตย์ตก Mount Wellington (kunanyi)' } },
          { time: '21:00', description: { en: 'Aurora hunting session on Mt Wellington', th: 'ภารกิจล่าแสงใต้บน Mt Wellington' } },
        ],
        note: {
          en: 'Stay at Design Home Airbnb — pack warm layers for summit',
          th: 'พัก Design Home Airbnb — เตรียมเสื้อกันหนาวสำหรับยอดเขา',
        },
      },
      {
        day: 2,
        title: { en: 'Day 2 — Bruny Island', th: 'วัน 2 — Bruny Island' },
        subtitle: { en: 'Ferry, The Neck, lighthouse & second aurora attempt', th: 'เรือข้ามฟอร์ด The Neck ประภาคาร & ล่าแสงใต้รอบสอง' },
        events: [
          { time: '07:30', description: { en: 'Ferry to Bruny Island', th: 'เรือข้ามฟอร์ดไป Bruny Island' } },
          { time: '09:30', description: { en: 'The Neck 360° viewpoint', th: 'จุดชม The Neck 360°' } },
          { time: '12:00', description: { en: 'Bruny Island Lighthouse', th: 'Bruny Island Lighthouse' } },
          { time: '14:30', description: { en: 'Optional oyster & cheese tasting', th: 'ชิมหอยนางรมและชีส (ทางเลือก)' } },
          { time: '21:30', description: { en: 'Second aurora hunt on Mt Wellington', th: 'ล่าแสงใต้รอบสองบน Mt Wellington' } },
        ],
      },
      {
        day: 3,
        title: { en: 'Day 3 — Art, Culture & Farewell', th: 'วัน 3 — ศิลปะ วัฒนธรรม & ลาก่อน' },
        subtitle: { en: 'MONA, waterfront lunch, afternoon flight to Sydney', th: 'MONA มื้อกลางวันริมน้ำ บินกลับซิดนีย์' },
        events: [
          { time: '09:00', description: { en: 'MONA museum visit & photography', th: 'เยี่ยมชมและถ่ายภาพที่ MONA' } },
          { time: '12:30', description: { en: 'Lunch at Hobart Waterfront', th: 'มื้อกลางวันริมน้ำ Hobart' } },
          { time: '15:00', description: { en: 'Transfer to Hobart Airport', th: 'รถไปสนามบิน Hobart' } },
          { time: '17:00', description: { en: 'Jetstar flight Hobart → Sydney', th: 'บิน Jetstar โฮบาร์ต → ซิดนีย์' } },
        ],
      },
    ],
  },
  'TAS-LH-4D3N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — Lavender Dreams & Heritage Lines', th: 'วัน 1 — ทุ่งลาเวนเดอร์ & เส้นนำสายตา' },
        subtitle: { en: 'Bridestowe, Richmond Bridge, first aurora hunt', th: 'Bridestowe Richmond Bridge ล่าแสงใต้ครั้งแรก' },
        events: [
          { time: '08:00', description: { en: 'Arrive Launceston — Bridestowe Lavender Estate shoot', th: 'ถึง Launceston — ถ่ายที่ Bridestowe Lavender Estate' } },
          { time: '13:00', description: { en: 'Lunch & travel to Richmond', th: 'มื้อกลางวัน & ไป Richmond' } },
          { time: '15:30', description: { en: 'Richmond Bridge — leading lines technique coaching', th: 'Richmond Bridge — สอนเทคนิค leading lines' } },
          { time: '20:00', description: { en: 'First Aurora Hunt + camera setup coaching', th: 'ล่าแสงใต้ครั้งแรก + สอนตั้งค่ากล้อง' } },
        ],
      },
      {
        day: 2,
        title: { en: 'Day 2 — Cradle Mountain', th: 'วัน 2 — Cradle Mountain' },
        subtitle: { en: 'Water reflections, wildlife & second aurora mission', th: 'สะท้อนน้ำ ธรรมชาติ & ภารกิจล่าแสงใต้รอบสอง' },
        events: [
          { time: '06:00', description: { en: 'Depart for Cradle Mountain — wait for reflection shots', th: 'ออกสู่ Cradle Mountain — รอจังหวะสะท้อนน้ำ' } },
          { time: '10:00', description: { en: 'Dove Lake circuit photography', th: 'ถ่ายภาพรอบ Dove Lake' } },
          { time: '14:00', description: { en: 'Wildlife & nature photography session', th: 'ถ่ายภาพสัตว์ป่าและธรรมชาติ' } },
          { time: '21:00', description: { en: 'Second Aurora Mission at new location', th: 'ภารกิจล่าแสงใต้รอบสอง จุดใหม่' } },
        ],
        note: {
          en: 'Pack thermal layers — Cradle Mountain can be near freezing',
          th: 'เตรียมเสื้อกันหนาว — Cradle Mountain อาจใกล้ 0°C',
        },
      },
      {
        day: 3,
        title: { en: 'Day 3 — Art, Culture & Golden Hour', th: 'วัน 3 — ศิลปะ วัฒนธรรม & Golden Hour' },
        subtitle: { en: 'MONA chiaroscuro, Hobart Market, Mt Wellington sunset', th: 'MONA chiaroscuro ตลาด Hobart พระอาทิตย์ตก Mt Wellington' },
        events: [
          { time: '09:00', description: { en: 'MONA museum — chiaroscuro technique session', th: 'MONA — สอนเทคนิค chiaroscuro' } },
          { time: '13:00', description: { en: 'Hobart Market + Cascade Brewery street photography', th: 'ตลาด Hobart + ถ่ายสตรีท Cascade Brewery' } },
          { time: '17:30', description: { en: 'Sunset at Mt Wellington', th: 'พระอาทิตย์ตก Mt Wellington' } },
          { time: '21:30', description: { en: 'Final night Aurora Hunt', th: 'ล่าแสงใต้คืนสุดท้าย' } },
        ],
      },
      {
        day: 4,
        title: { en: 'Day 4 — Farewell Tasmania', th: 'วัน 4 — ลาแทสเมเนีย' },
        subtitle: { en: 'Final Hobart captures & departure', th: 'เก็บภาพสุดท้ายที่ Hobart & ออกเดินทาง' },
        events: [
          { time: '08:00', description: { en: 'Morning final capture in Hobart', th: 'ถ่ายภาพครั้งสุดท้ายยามเช้าที่ Hobart' } },
          { time: '10:00', description: { en: 'Waterfront walk & coffee', th: 'เดินริมน้ำ & กาแฟ' } },
          { time: '12:00', description: { en: 'Transfer to Hobart Airport — Jetstar to Sydney', th: 'ไปสนามบิน Hobart — บิน Jetstar กลับซิดนีย์' } },
        ],
      },
    ],
  },
  'TAS-SU-4D3N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — Into the Highlands', th: 'วัน 1 — สู่ที่ราบสูง' },
        subtitle: { en: 'Launceston → Cradle Mountain', th: 'Launceston → Cradle Mountain' },
        events: [
          {
            time: '07:00',
            category: 'flight',
            description: {
              en: 'Jetstar arrival Launceston — private SUV pickup',
              th: 'ถึง Launceston — รถ SUV รับที่สนามบิน',
            },
          },
          {
            time: '10:00',
            category: 'activity',
            description: {
              en: 'Drive to Cradle Mountain — scenic highland route',
              th: 'ขับสู่ Cradle Mountain — เส้นทางที่ราบสูง',
            },
          },
          {
            time: '13:00',
            category: 'activity',
            description: {
              en: 'Dove Lake circuit — reflection photography',
              th: 'เดินรอบ Dove Lake — ถ่ายภาพสะท้อนน้ำ',
            },
          },
          {
            time: '17:00',
            category: 'activity',
            description: {
              en: 'Ronny Creek — wombat & wildlife spotting golden hour',
              th: 'Ronny Creek — ส่องวอมแบตและสัตว์ป่าช่วง Golden hour',
            },
          },
        ],
        note: {
          en: 'Stay near Cradle Mountain Village — pack warm layers, highland nights are cold even in summer',
          th: 'พักใกล้ Cradle Mountain Village — เตรียมเสื้อกันหนาว กลางคืนบนที่สูงหนาวแม้ในฤดูร้อน',
        },
      },
      {
        day: 2,
        title: { en: 'Day 2 — Down to the East Coast', th: 'วัน 2 — ลงสู่ชายฝั่งตะวันออก' },
        subtitle: { en: 'Cradle Mountain → Bay of Fires', th: 'Cradle Mountain → Bay of Fires' },
        events: [
          {
            time: '06:00',
            category: 'activity',
            description: {
              en: 'Sunrise session at Dove Lake before departure',
              th: 'ถ่ายพระอาทิตย์ขึ้นที่ Dove Lake ก่อนออกเดินทาง',
            },
          },
          {
            time: '09:00',
            category: 'activity',
            description: {
              en: 'Scenic drive across to the East Coast',
              th: 'ขับข้ามเกาะสู่ชายฝั่งตะวันออก',
            },
          },
          {
            time: '15:00',
            category: 'activity',
            description: {
              en: 'Bay of Fires — orange lichen granite boulders photography',
              th: 'Bay of Fires — ถ่ายก้อนหินแกรนิตไลเคนสีส้ม',
            },
          },
          {
            time: '18:30',
            category: 'activity',
            description: {
              en: 'Binalong Bay sunset session',
              th: 'ถ่ายพระอาทิตย์ตกที่ Binalong Bay',
            },
          },
        ],
        note: { en: 'Stay in St Helens', th: 'พักที่ St Helens' },
      },
      {
        day: 3,
        title: { en: 'Day 3 — Fire-Orange Coastline', th: 'วัน 3 — ชายฝั่งสีส้มไฟ' },
        subtitle: {
          en: 'Bay of Fires full day & Milky Way',
          th: 'Bay of Fires เต็มวัน & ทางช้างเผือก',
        },
        events: [
          {
            time: '06:00',
            category: 'activity',
            description: {
              en: 'Sunrise at the Bay of Fires lookout',
              th: 'ชมพระอาทิตย์ขึ้นที่จุดชม Bay of Fires',
            },
          },
          {
            time: '10:00',
            category: 'activity',
            description: {
              en: 'Coastal walk — rockpools & turquoise water detail shots',
              th: 'เดินชายฝั่ง — ถ่ายแอ่งหินและน้ำสีฟ้าเขียว',
            },
          },
          {
            time: '21:00',
            category: 'activity',
            description: {
              en: 'Milky Way photography session (conditions permitting)',
              th: 'ถ่ายทางช้างเผือก (ตามสภาพอากาศ)',
            },
          },
        ],
      },
      {
        day: 4,
        title: { en: 'Day 4 — Farewell Tasmania', th: 'วัน 4 — ลาแทสเมเนีย' },
        subtitle: {
          en: 'Cataract Gorge, Launceston, departure',
          th: 'Cataract Gorge Launceston และเดินทางกลับ',
        },
        events: [
          {
            time: '08:00',
            category: 'activity',
            description: { en: 'Drive back to Launceston', th: 'ขับกลับ Launceston' },
          },
          {
            time: '10:00',
            category: 'activity',
            description: {
              en: 'Cataract Gorge — final photo stop',
              th: 'Cataract Gorge — จุดถ่ายภาพสุดท้าย',
            },
          },
          {
            time: '13:00',
            category: 'flight',
            description: {
              en: 'Transfer to airport, fly back to Sydney',
              th: 'เดินทางสู่สนามบิน บินกลับ Sydney',
            },
          },
        ],
      },
    ],
  },
  'BER-3D2N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — South Coast Arrival', th: 'วัน 1 — ถึงชายฝั่งใต้' },
        subtitle: { en: 'Sydney → Bermagui', th: 'ซิดนีย์ → Bermagui' },
        events: [
          {
            time: '07:00',
            category: 'activity',
            description: {
              en: 'Depart Sydney — scenic drive south along the coast',
              th: 'ออกจากซิดนีย์ — ขับชมวิวชายฝั่งลงใต้',
            },
          },
          {
            time: '13:00',
            category: 'meal',
            description: {
              en: 'Arrive Bermagui — lunch at the fishing harbour',
              th: 'ถึง Bermagui — มื้อกลางวันที่ท่าเรือประมง',
            },
          },
          {
            time: '17:00',
            category: 'activity',
            description: {
              en: 'Camel Rock & Horse Head Rock — sunset photography',
              th: 'Camel Rock และ Horse Head Rock — ถ่ายพระอาทิตย์ตก',
            },
          },
        ],
        note: { en: 'Stay in Bermagui', th: 'พักที่ Bermagui' },
      },
      {
        day: 2,
        title: { en: 'Day 2 — Blue Pool & National Park', th: 'วัน 2 — Blue Pool และอุทยานแห่งชาติ' },
        subtitle: {
          en: 'Bermagui Blue Pool, Mimosa Rocks, night sky',
          th: 'Blue Pool Mimosa Rocks และท้องฟ้ายามค่ำ',
        },
        events: [
          {
            time: '08:00',
            category: 'activity',
            description: {
              en: 'Bermagui Blue Pool — cliffside ocean pool photography',
              th: 'Blue Pool — ถ่ายสระน้ำริมหน้าผา',
            },
          },
          {
            time: '11:00',
            category: 'activity',
            description: {
              en: 'Mimosa Rocks National Park coastal walk',
              th: 'เดินชายฝั่ง Mimosa Rocks National Park',
            },
          },
          {
            time: '17:00',
            category: 'activity',
            description: {
              en: 'Gulaga lookout — golden hour over the coastline',
              th: 'จุดชม Gulaga — Golden hour เหนือชายฝั่ง',
            },
          },
          {
            time: '21:00',
            category: 'activity',
            description: {
              en: 'Milky Way photography session (conditions permitting)',
              th: 'ถ่ายทางช้างเผือก (ตามสภาพอากาศ)',
            },
          },
        ],
      },
      {
        day: 3,
        title: { en: 'Day 3 — Morning Light & Return', th: 'วัน 3 — แสงเช้าและเดินทางกลับ' },
        subtitle: {
          en: 'Harbour sunrise, drive back to Sydney',
          th: 'พระอาทิตย์ขึ้นที่ท่าเรือ ขับกลับซิดนีย์',
        },
        events: [
          {
            time: '06:00',
            category: 'activity',
            description: {
              en: 'Sunrise at Bermagui fishing harbour',
              th: 'ถ่ายพระอาทิตย์ขึ้นที่ท่าเรือ Bermagui',
            },
          },
          {
            time: '09:00',
            category: 'meal',
            description: {
              en: 'Breakfast & final coastal shots',
              th: 'มื้อเช้า & เก็บภาพชายฝั่งสุดท้าย',
            },
          },
          {
            time: '10:30',
            category: 'activity',
            description: { en: 'Depart for Sydney', th: 'ออกเดินทางกลับซิดนีย์' },
          },
        ],
      },
    ],
  },
  'CAN-2D1N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: {
          en: 'Day 1 — Golden Fields of the Central West',
          th: 'วัน 1 — ทุ่งสีทองแห่งเซ็นทรัลเวสต์',
        },
        subtitle: { en: 'Sydney → Cowra → Canowindra', th: 'ซิดนีย์ → Cowra → Canowindra' },
        events: [
          {
            time: '07:00',
            category: 'activity',
            description: { en: 'Depart Sydney for Cowra', th: 'ออกจากซิดนีย์สู่ Cowra' },
          },
          {
            time: '11:00',
            category: 'activity',
            description: {
              en: 'Cowra Japanese Garden photography',
              th: 'ถ่ายภาพที่ Cowra Japanese Garden',
            },
          },
          {
            time: '14:00',
            category: 'activity',
            description: {
              en: 'Drive to Canowindra — canola field scouting',
              th: 'ขับสู่ Canowindra — สำรวจทุ่งคาโนล่า',
            },
          },
          {
            time: '17:30',
            category: 'activity',
            description: {
              en: 'Golden hour among the canola fields',
              th: 'ถ่าย Golden hour ท่ามกลางทุ่งคาโนล่า',
            },
          },
        ],
        note: {
          en: 'Stay in Canowindra — canola typically blooms Aug–Sep, confirm bloom status before departure',
          th: 'พักที่ Canowindra — คาโนล่ามักบานช่วง ส.ค.–ก.ย. เช็คสถานะดอกก่อนออกเดินทาง',
        },
      },
      {
        day: 2,
        title: { en: 'Day 2 — Balloon Capital Sunrise', th: 'วัน 2 — แสงเช้าเมืองหลวงบอลลูน' },
        subtitle: {
          en: 'Sunrise fields, Carrington Park, return to Sydney',
          th: 'ทุ่งยามเช้า Carrington Park และเดินทางกลับ',
        },
        events: [
          {
            time: '06:00',
            category: 'activity',
            description: {
              en: 'Sunrise over the canola fields — Canowindra is known as the ballooning capital, hot air balloons often drift overhead',
              th: 'พระอาทิตย์ขึ้นเหนือทุ่งคาโนล่า — Canowindra ขึ้นชื่อเรื่องบอลลูนลมร้อนที่มักลอยผ่าน',
            },
          },
          {
            time: '09:00',
            category: 'meal',
            description: {
              en: 'Breakfast in Canowindra town',
              th: 'มื้อเช้าในตัวเมือง Canowindra',
            },
          },
          {
            time: '10:30',
            category: 'activity',
            description: {
              en: 'Carrington Park lookout — panoramic valley view',
              th: 'จุดชม Carrington Park — วิวหุบเขา panorama',
            },
          },
          {
            time: '12:00',
            category: 'activity',
            description: { en: 'Depart for Sydney', th: 'ออกเดินทางกลับซิดนีย์' },
          },
        ],
      },
    ],
  },
  'TAS-LH-3D2N-DEC': TAS_LH_3D2N_ITINERARY,
  'TAS-LH-3D2N-WIN': TAS_LH_3D2N_ITINERARY,
  'TAS-SP-3D2N': {
    detailed: true,
    headerNote: {
      en: 'Private photo trip (max 5) — Launceston → North-West Coast → Hobart. Flights and meals not included. Arrive Launceston before 08:30 on Day 1 (Sunday); depart Hobart after 18:30 on Day 3 (Tuesday).',
      th: 'ทริปถ่ายภาพส่วนตัว (สูงสุด 5 ท่าน) — Launceston → ชายฝั่งตะวันตกเฉียงเหนือ → Hobart ไม่รวมตั๋วเครื่องบินและอาหาร ถึง Launceston ก่อน 08:30 ของวัน 1 (อาทิตย์) และออกจาก Hobart หลัง 18:30 ของวัน 3 (อังคาร)',
    },
    days: [
      {
        day: 1,
        title: {
          en: 'Day 1 — Table Cape Tulips & Cradle Mountain',
          th: 'วัน 1 — ทิวลิป Table Cape & Cradle Mountain',
        },
        subtitle: {
          en: 'Launceston → Table Cape Tulip Farm → Cradle Mountain',
          th: 'Launceston → Table Cape Tulip Farm → Cradle Mountain',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Arrive Launceston Airport before 08:30 — pick up the rental car and drive the north coast',
              th: 'ถึงสนามบิน Launceston ก่อน 08:30 — รับรถเช่าแล้วขับรถขึ้นชายฝั่งเหนือ',
            },
          },
          {
            time: 'Late morning',
            category: 'activity',
            description: {
              en: 'Table Cape Tulip Farm — tulip fields on a clifftop extinct volcano overlooking Bass Strait',
              th: 'Table Cape Tulip Farm — ทุ่งทิวลิปบนหน้าผาภูเขาไฟเก่า มองออกไปยัง Bass Strait',
            },
          },
          {
            time: 'Afternoon',
            category: 'activity',
            description: {
              en: 'Drive south into Cradle Mountain National Park — shuttle to Dove Lake for lakeside and summit photography walks',
              th: 'ขับรถลงใต้เข้าอุทยาน Cradle Mountain — รถรับส่งไป Dove Lake เดินถ่ายภาพริมทะเลสาบและขึ้นยอดเขา',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Check in at Discovery Parks – Cradle Mountain (Standard Cabin, sleeps 6)',
              th: 'เช็กอิน Discovery Parks – Cradle Mountain (Standard Cabin นอนได้ 6 คน)',
            },
          },
        ],
        note: {
          en: 'Stay: Discovery Parks – Cradle Mountain (Standard Cabin). Pack warm layers — highland evenings are cold in spring.',
          th: 'ที่พัก: Discovery Parks – Cradle Mountain (Standard Cabin) เตรียมเสื้อกันหนาว — เย็นบนที่สูงยังหนาวแม้ฤดูใบไม้ผลิ',
        },
      },
      {
        day: 2,
        title: {
          en: 'Day 2 — Murals, Heritage Bridges & Hobart',
          th: 'วัน 2 — จิตรกรรมฝาผนัง สะพานโบราณ & Hobart',
        },
        subtitle: {
          en: 'Cradle Mountain → Sheffield → Ross → Richmond Bridge → Hobart',
          th: 'Cradle Mountain → Sheffield → Ross → Richmond Bridge → Hobart',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Drive through Sheffield — the “Town of Murals” — street-art photography stop',
              th: 'ขับรถผ่าน Sheffield — “เมืองแห่งจิตรกรรมฝาผนัง” — แวะถ่ายภาพศิลปะริมถนน',
            },
          },
          {
            time: 'Midday',
            category: 'activity',
            description: {
              en: 'Heritage Highway south — Ross Bridge (carved sandstone) plus a well-known local bakery stop',
              th: 'ลงใต้ตาม Heritage Highway — Ross Bridge (สะพานหินทรายสลัก) และแวะเบเกอรี่ท้องถิ่นชื่อดัง',
            },
          },
          {
            time: 'Afternoon',
            category: 'activity',
            description: {
              en: 'Richmond Bridge — Australia’s oldest stone-span bridge (1823) — walk the historic town',
              th: 'Richmond Bridge — สะพานหินโค้งที่เก่าแก่ที่สุดในออสเตรเลีย (ค.ศ. 1823) — เดินชมเมืองประวัติศาสตร์',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Arrive Hobart — dinner around Victoria Dock / Salamanca; stay at Rydges Hobart (One-Bedroom Suite)',
              th: 'ถึง Hobart — ดินเนอร์แถว Victoria Dock / Salamanca พัก Rydges Hobart (One-Bedroom Suite)',
            },
          },
        ],
        note: {
          en: 'Stay: Rydges Hobart (One-Bedroom Suite).',
          th: 'ที่พัก: Rydges Hobart (One-Bedroom Suite)',
        },
      },
      {
        day: 3,
        title: {
          en: 'Day 3 — kunanyi/Mt Wellington, Port Arthur & Departure',
          th: 'วัน 3 — kunanyi/Mt Wellington, Port Arthur & ออกเดินทาง',
        },
        subtitle: {
          en: 'Mt Wellington → Port Arthur → Hobart Airport',
          th: 'Mt Wellington → Port Arthur → สนามบิน Hobart',
        },
        events: [
          {
            time: 'Early morning',
            category: 'activity',
            description: {
              en: 'Drive up kunanyi/Mt Wellington for a 360° view over Hobart',
              th: 'ขับรถขึ้น kunanyi/Mt Wellington มอง Hobart แบบ 360°',
            },
          },
          {
            time: 'Late morning–afternoon',
            category: 'activity',
            description: {
              en: 'Tasman Peninsula — Port Arthur Historic Site (former penal colony ruins by the sea)',
              th: 'คาบสมุทร Tasman — Port Arthur Historic Site (ซากอาณานิคมนักโทษริมทะเล)',
            },
          },
          {
            time: 'Evening',
            category: 'flight',
            description: {
              en: 'Return to Hobart Airport, drop off the rental car — depart after 18:30 for Sydney',
              th: 'กลับสนามบิน Hobart คืนรถเช่า — ออกเที่ยวบินหลัง 18:30 กลับซิดนีย์',
            },
          },
        ],
        note: {
          en: 'Book a Hobart departure after 18:30 so there is time after Port Arthur.',
          th: 'จองเที่ยวบินออกจาก Hobart หลัง 18:30 เพื่อมีเวลาหลัง Port Arthur',
        },
      },
    ],
  },
  'NZ-10D9N': {
    detailed: true,
    headerNote: {
      en: '10 days / 9 nights — North + South Island grand photo road trip (Auckland → Christchurch → Queenstown). Standard rate listed for groups of 4–6. Flights not included.',
      th: '10 วัน 9 คืน — ทริปถ่ายภาพใหญ่เกาะเหนือ+เกาะใต้ (Auckland → Christchurch → Queenstown) ราคามาตรฐานสำหรับกลุ่ม 4–6 ท่าน ไม่รวมตั๋วเครื่องบิน',
    },
    days: [
      {
        day: 1,
        title: {
          en: 'Day 1 — Auckland Arrival & Mt. Eden Twilight',
          th: 'วัน 1 — ถึง Auckland & พลบค่ำที่ Mt. Eden',
        },
        subtitle: {
          en: 'Auckland city exploration & harbour twilight',
          th: 'สำรวจเมือง Auckland และถ่ายพลบค่ำริมท่าเรือ',
        },
        events: [
          {
            time: 'Arrival',
            category: 'flight',
            description: {
              en: 'Fly into Auckland (AKL) — private SUV pickup into the city',
              th: 'บินเข้า Auckland (AKL) — รถ SUV ส่วนตัวรับเข้าเมือง',
            },
          },
          {
            time: 'Golden hour',
            category: 'activity',
            description: {
              en: 'Mt. Eden volcanic crater lookout — 360° golden hour view over Auckland',
              th: 'จุดชมปล่องภูเขาไฟ Mt. Eden — มุมมอง 360° ช่วง Golden hour ทั่ว Auckland',
            },
          },
          {
            time: 'Twilight',
            category: 'activity',
            description: {
              en: 'Street photography at Auckland Harbour Bridge & Westhaven Marina',
              th: 'ถ่ายสตรีทที่ Auckland Harbour Bridge และ Westhaven Marina',
            },
          },
        ],
        note: { en: 'Stay: Auckland', th: 'ที่พัก: Auckland' },
      },
      {
        day: 2,
        title: {
          en: 'Day 2 — Hobbiton to Taranaki',
          th: 'วัน 2 — Hobbiton สู่ Taranaki',
        },
        subtitle: {
          en: 'Auckland → Hobbiton Movie Set → New Plymouth',
          th: 'Auckland → Hobbiton Movie Set → New Plymouth',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Drive to Matamata — Hobbiton Movie Set portraits at hobbit-hole doors and the stone bridge',
              th: 'ขับรถไป Matamata — ถ่ายพอร์ตเทรต Hobbiton ที่ประตูบ้านฮอบบิทและสะพานหิน',
            },
          },
          {
            time: 'Afternoon',
            category: 'activity',
            description: {
              en: 'Continue to the Taranaki region — Cape Egmont Lighthouse with snow-capped Mt. Taranaki behind it',
              th: 'ต่อไปยังแคว้น Taranaki — ประภาคาร Cape Egmont พร้อม Mt. Taranaki ยอดหิมะเป็นฉากหลัง',
            },
          },
        ],
        note: { en: 'Stay: New Plymouth', th: 'ที่พัก: New Plymouth' },
      },
      {
        day: 3,
        title: {
          en: 'Day 3 — Pouakai Tarns & Fly South',
          th: 'วัน 3 — Pouakai Tarns และบินลงใต้',
        },
        subtitle: {
          en: 'Mt. Taranaki reflection → Auckland → Christchurch',
          th: 'สะท้อน Mt. Taranaki → Auckland → Christchurch',
        },
        events: [
          {
            time: 'Daylight',
            category: 'activity',
            description: {
              en: 'Hike to Pouakai Tarns for the signature Mt. Taranaki reflection — volcano mirrored on the tarn — plus drone footage',
              th: 'เดินขึ้น Pouakai Tarns ถ่ายภาพสะท้อน Mt. Taranaki ลายเซ็น — ภูเขาไฟสะท้อนบนผิวน้ำ — พร้อมภาพโดรน',
            },
          },
          {
            time: 'Afternoon',
            category: 'flight',
            description: {
              en: 'Drive to Auckland Airport, return Leg 1 rental car, fly to Christchurch (CHC), pick up Leg 2 rental car',
              th: 'ขับรถไปสนามบิน Auckland คืนรถเช่าช่วงที่ 1 บินไป Christchurch (CHC) แล้วรับรถเช่าช่วงที่ 2',
            },
          },
        ],
        note: { en: 'Stay: Christchurch', th: 'ที่พัก: Christchurch' },
      },
      {
        day: 4,
        title: {
          en: 'Day 4 — Lake Tekapo & Milky Way Hunt',
          th: 'วัน 4 — Lake Tekapo และล่าทางช้างเผือก',
        },
        subtitle: {
          en: 'Christchurch → Lake Tekapo — Church of the Good Shepherd',
          th: 'Christchurch → Lake Tekapo — Church of the Good Shepherd',
        },
        events: [
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Drive to turquoise Lake Tekapo — photograph the historic Church of the Good Shepherd',
              th: 'ขับรถสู่ Lake Tekapo สีฟ้าอมเขียว — ถ่ายโบสถ์ประวัติศาสตร์ Church of the Good Shepherd',
            },
          },
          {
            time: 'Night',
            category: 'activity',
            description: {
              en: 'Milky Way session at Mt. John Observatory inside an official dark sky reserve',
              th: 'ถ่ายทางช้างเผือกที่ Mt. John Observatory ในเขตท้องฟ้ามืดอย่างเป็นทางการ',
            },
          },
        ],
        note: {
          en: 'Stay: Lake Tekapo — pack warm layers for the night shoot',
          th: 'ที่พัก: Lake Tekapo — เตรียมเสื้อกันหนาวสำหรับถ่ายกลางคืน',
        },
      },
      {
        day: 5,
        title: {
          en: 'Day 5 — Lake Pukaki to Aoraki/Mt. Cook',
          th: 'วัน 5 — Lake Pukaki สู่ Aoraki/Mt. Cook',
        },
        subtitle: {
          en: "Peter's Lookout & Hooker Valley Track",
          th: "Peter's Lookout และเส้นทาง Hooker Valley",
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: "Photograph Peter's Lookout — the road leading straight to Mt. Cook along Lake Pukaki",
              th: "ถ่าย Peter's Lookout — ถนนมุ่งตรงสู่ Mt. Cook ตามแนว Lake Pukaki",
            },
          },
          {
            time: 'Afternoon',
            category: 'activity',
            description: {
              en: 'Hike Hooker Valley Track — portraits on the swing bridges over the glacial river toward Hooker Lake',
              th: 'เดิน Hooker Valley Track — ถ่ายพอร์ตเทรตบนสะพานแขวนข้ามแม่น้ำธารน้ำแข็งสู่ Hooker Lake',
            },
          },
        ],
        note: { en: 'Stay: Mt. Cook Village', th: 'ที่พัก: Mt. Cook Village' },
      },
      {
        day: 6,
        title: {
          en: 'Day 6 — Lindis Pass to That Wanaka Tree',
          th: 'วัน 6 — Lindis Pass สู่ That Wanaka Tree',
        },
        subtitle: {
          en: 'Mt. Cook → Lindis Pass → Wanaka',
          th: 'Mt. Cook → Lindis Pass → Wanaka',
        },
        events: [
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Drive the golden tussock switchbacks of Lindis Pass to Wanaka',
              th: 'ขับรถผ่านทางโค้งหญ้าทัสซ็อกสีทองของ Lindis Pass สู่ Wanaka',
            },
          },
          {
            time: 'Sunset',
            category: 'activity',
            description: {
              en: 'Sunset at That Wanaka Tree — the iconic lone tree standing in the lake',
              th: 'พระอาทิตย์ตกที่ That Wanaka Tree — ต้นไม้โดดเดี่ยวในทะเลสาบ',
            },
          },
        ],
        note: { en: 'Stay: Wanaka', th: 'ที่พัก: Wanaka' },
      },
      {
        day: 7,
        title: {
          en: 'Day 7 — Crown Range to Te Anau',
          th: 'วัน 7 — Crown Range สู่ Te Anau',
        },
        subtitle: {
          en: 'Wanaka → Crown Range Road → Arrowtown → Te Anau',
          th: 'Wanaka → Crown Range Road → Arrowtown → Te Anau',
        },
        events: [
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Drive the high-altitude Crown Range Road — stop in historic gold-mining Arrowtown',
              th: 'ขับรถขึ้น Crown Range Road ที่สูง — แวะ Arrowtown เมืองเก่าเหมืองทอง',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Continue to Te Anau — calm evening reflections on Lake Te Anau, gateway to Fiordland',
              th: 'ต่อไป Te Anau — สะท้อนน้ำยามเย็นบน Lake Te Anau ประตูสู่ Fiordland',
            },
          },
        ],
        note: { en: 'Stay: Te Anau', th: 'ที่พัก: Te Anau' },
      },
      {
        day: 8,
        title: {
          en: 'Day 8 — Milford Sound to Queenstown',
          th: 'วัน 8 — Milford Sound สู่ Queenstown',
        },
        subtitle: {
          en: 'Milford Road, Mirror Lakes & Fjords Cruise',
          th: 'ถนน Milford Mirror Lakes และล่องเรือฟยord',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Drive Milford Road — Mirror Lakes and the wide grasslands of Eglinton Valley',
              th: 'ขับรถตามถนน Milford — Mirror Lakes และทุ่งหญ้ากว้างของ Eglinton Valley',
            },
          },
          {
            time: 'Midday',
            category: 'activity',
            description: {
              en: 'Milford Sound Fjords Cruise — cliffs, waterfalls, Mitre Peak, mist and wildlife',
              th: 'ล่องเรือฟยord Milford Sound — หน้าผา น้ำตก Mitre Peak หมอก และสัตว์ป่า',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Continue to Queenstown',
              th: 'ต่อไปยัง Queenstown',
            },
          },
        ],
        note: { en: 'Stay: Queenstown', th: 'ที่พัก: Queenstown' },
      },
      {
        day: 9,
        title: {
          en: 'Day 9 — Road to Paradise & Skyline Twilight',
          th: 'วัน 9 — Road to Paradise และพลบค่ำ Skyline',
        },
        subtitle: {
          en: 'Queenstown → Glenorchy → Skyline Gondola',
          th: 'Queenstown → Glenorchy → Skyline Gondola',
        },
        events: [
          {
            time: 'Day',
            category: 'activity',
            description: {
              en: 'Drive along Lake Wakatipu to Glenorchy — Road to Paradise and its historic wooden bridges',
              th: 'ขับรถตาม Lake Wakatipu ไป Glenorchy — Road to Paradise และสะพานไม้โบราณ',
            },
          },
          {
            time: 'Evening',
            category: 'activity',
            description: {
              en: 'Skyline Gondola twilight view over Queenstown and the lake',
              th: 'ขึ้น Skyline Gondola มอง Queenstown และทะเลสาบช่วงพลบค่ำ',
            },
          },
        ],
        note: { en: 'Stay: Queenstown', th: 'ที่พัก: Queenstown' },
      },
      {
        day: 10,
        title: {
          en: 'Day 10 — Queenstown Farewell & Departure',
          th: 'วัน 10 — ลา Queenstown และออกเดินทาง',
        },
        subtitle: {
          en: 'Lakeside last frames → Queenstown Airport (ZQN)',
          th: 'เก็บภาพสุดท้ายริมทะเลสาบ → สนามบิน Queenstown (ZQN)',
        },
        events: [
          {
            time: 'Morning',
            category: 'activity',
            description: {
              en: 'Lakeside last-capture stroll in Queenstown — optional light shopping',
              th: 'เดินเก็บภาพสุดท้ายริมทะเลสาบที่ Queenstown — ช้อปเบาๆ ได้ตามสะดวก',
            },
          },
          {
            time: 'Departure',
            category: 'flight',
            description: {
              en: 'Transfer to Queenstown Airport (ZQN), return rental car, fly home',
              th: 'ไปสนามบิน Queenstown (ZQN) คืนรถเช่า แล้วบินกลับบ้าน',
            },
          },
        ],
      },
    ],
  },
  'NZ-6D5N': {
    detailed: true,
    headerNote: {
      en: 'Route changes by season — select a season below. Private photo trip capped at 5 guests per departure.',
      th: 'เส้นทางเปลี่ยนตามฤดูกาล — เลือกฤดูกาลด้านล่าง ทริปถ่ายภาพส่วนตัว จำกัด 5 ท่านต่อรอบ',
    },
    seasonalItineraries: {
      spring: {
        days: [
          {
            day: 1,
            title: { en: 'Day 1 — Queenstown to Te Anau', th: 'วัน 1 — Queenstown สู่ Te Anau' },
            subtitle: { en: 'Fly in & lakeside evening light', th: 'บินเข้า & ถ่ายแสงริมทะเลสาบช่วงเย็น' },
            events: [
              { time: '08:00', description: { en: 'Jetstar flight Sydney → Queenstown', th: 'บิน Jetstar ซิดนีย์ → Queenstown' } },
              { time: '11:30', description: { en: 'Arrive Queenstown — SUV pickup & briefing', th: 'ถึง Queenstown — รับรถ SUV & บรรยาย' } },
              { time: '14:00', description: { en: 'Scenic drive to Te Anau', th: 'ขับชมวิวไป Te Anau' } },
              { time: '17:30', description: { en: 'Te Anau lakeside — evening light photography session', th: 'ริมทะเลสาบ Te Anau — ถ่ายแสงช่วงเย็น' } },
            ],
          },
          {
            day: 2,
            title: { en: 'Day 2 — Milford Sound & Nugget Point', th: 'วัน 2 — Milford Sound & Nugget Point' },
            subtitle: { en: 'Fiord cruise & lighthouse sunset', th: 'ล่องเรือฟยord & พระอาทิตย์ตกที่ประภาคาร' },
            events: [
              { time: '07:00', description: { en: 'Depart Te Anau for Milford Sound', th: 'ออกจาก Te Anau ไป Milford Sound' } },
              { time: '10:00', description: { en: 'Boat cruise at Milford Sound — fiord photography', th: 'ล่องเรือ Milford Sound — ถ่ายภาพฟยord' } },
              { time: '14:00', description: { en: 'Drive across the island toward the Catlins coast', th: 'ขับข้ามเกาะไปชายฝั่ง Catlins' } },
              { time: '17:30', description: { en: 'Nugget Point Lighthouse — evening shoot', th: 'Nugget Point Lighthouse — ถ่ายช่วงเย็น' } },
            ],
          },
          {
            day: 3,
            title: { en: 'Day 3 — Moeraki Boulders to Lake Tekapo', th: 'วัน 3 — Moeraki Boulders สู่ Lake Tekapo' },
            subtitle: { en: 'Ancient boulders, lupin fields & Milky Way', th: 'ก้อนหินโบราณ ทุ่งลูปิน & ทางช้างเผือก' },
            events: [
              { time: '08:00', description: { en: 'Moeraki Boulders — ancient rock formations photography', th: 'Moeraki Boulders — ถ่ายก้อนหินโบราณ' } },
              { time: '13:00', description: { en: 'Continue north to Lake Tekapo', th: 'เดินทางต่อไป Lake Tekapo' } },
              { time: '16:00', description: { en: 'Church of the Good Shepherd among spring lupin fields', th: 'Church of the Good Shepherd ท่ามกลางทุ่งลูปินฤดูใบไม้ผลิ' } },
              { time: '21:30', description: { en: 'Milky Way photography setup at Tekapo dark sky reserve', th: 'ตั้งกล้องถ่ายทางช้างเผือกที่ Tekapo dark sky reserve' } },
            ],
            note: {
              en: 'Spring lupin bloom peaks Sep–Nov — pack warm layers for night shoots',
              th: 'ลูปินบานสุด ก.ย.–พ.ย. — เตรียมเสื้อกันหนาวสำหรับถ่ายกลางคืน',
            },
          },
          {
            day: 4,
            title: { en: 'Day 4 — Mt John & Aoraki/Mount Cook', th: 'วัน 4 — Mt John & Aoraki/Mount Cook' },
            subtitle: { en: 'Observatory views, alpine roads & Hooker Valley', th: 'จุดชมดาว ถนนบนภูเขา & Hooker Valley' },
            events: [
              { time: '06:00', description: { en: 'Mt. John Observatory viewpoint — sunrise panorama', th: 'Mt. John Observatory — panorama พระอาทิตย์ขึ้น' } },
              { time: '10:00', description: { en: 'Frenchman Creek (Irishman Creek) Station', th: 'Frenchman Creek (Irishman Creek) Station' } },
              { time: '13:00', description: { en: "Peter's Lookout — road toward snow peaks", th: "Peter's Lookout — ถนนสู่ยอดเขาหิมะ" } },
              { time: '15:30', description: { en: 'Aoraki/Mount Cook — Hooker Valley trek & photography', th: 'Aoraki/Mount Cook — เดิน Hooker Valley & ถ่ายภาพ' } },
            ],
          },
          {
            day: 5,
            title: { en: 'Day 5 — Lindis Pass to Glenorchy', th: 'วัน 5 — Lindis Pass สู่ Glenorchy' },
            subtitle: { en: 'Golden grasslands, Wanaka lone tree & dark-sky stay', th: 'ทุ่งหญ้าสีทอง ต้นไม้โดดเดี่ยว Wanaka & พักพื้นที่ท้องฟ้ามืด' },
            events: [
              { time: '08:00', description: { en: 'Drive through golden Lindis Pass grasslands', th: 'ขับผ่านทุ่งหญ้า Lindis Pass สีทอง' } },
              { time: '12:00', description: { en: "Wanaka — photograph the lone tree in the water", th: 'Wanaka — ถ่ายต้นไม้โดดเดี่ยวกลางน้ำ' } },
              { time: '16:00', description: { en: 'Continue to Glenorchy — escape city light pollution', th: 'ต่อไป Glenorchy — หลีกเลี่ยงแสงเมือง' } },
              { time: '21:00', description: { en: 'Dedicated Milky Way session — possible aurora hunt (conditions permitting)', th: 'ถ่ายทางช้างเผือกเต็มคืน — อาจล่าแสงใต้ (ตามสภาพอากาศ)' } },
            ],
            note: {
              en: 'Special overnight at Glenorchy for optimal astro conditions',
              th: 'พักค้างพิเศษที่ Glenorchy เพื่อสภาพถ่ายดาราศาสตร์ที่ดีที่สุด',
            },
          },
          {
            day: 6,
            title: { en: 'Day 6 — Queenstown & departure', th: 'วัน 6 — Queenstown & กลับซิดนีย์' },
            subtitle: { en: 'Fergburger, Patagonia & flight home', th: 'Fergburger Patagonia & บินกลับ' },
            events: [
              { time: '09:00', description: { en: 'Return to Queenstown — Fergburger & Patagonia ice cream', th: 'กลับ Queenstown — Fergburger & ไอศกรีม Patagonia' } },
              { time: '11:00', description: { en: 'Salmon farm visit & souvenir shopping', th: 'เยี่ยมชมฟาร์มแซลมอน & ช้อปของที่ระลึก' } },
              { time: '14:00', description: { en: 'Transfer to Queenstown Airport', th: 'รถไปสนามบิน Queenstown' } },
              { time: '16:00', description: { en: 'Jetstar flight Queenstown → Sydney', th: 'บิน Jetstar Queenstown → ซิดนีย์' } },
            ],
          },
        ],
      },
      summer: {
        days: [
          {
            day: 1,
            title: { en: 'Day 1 — Queenstown & Milford Sound', th: 'วัน 1 — Queenstown & Milford Sound' },
            subtitle: { en: 'Arrive and cruise the fiord', th: 'ถึง Queenstown & ล่องเรือฟยord' },
            events: [
              { time: '08:00', description: { en: 'Jetstar flight Sydney → Queenstown', th: 'บิน Jetstar ซิดนีย์ → Queenstown' } },
              { time: '11:00', description: { en: 'Arrive Queenstown — trip begins, SUV pickup', th: 'ถึง Queenstown — เริ่มทริป รับรถ SUV' } },
              { time: '13:00', description: { en: 'Drive to Milford Sound via scenic alpine route', th: 'ขับไป Milford Sound ผ่านเส้นทางบนภูเขา' } },
              { time: '16:00', description: { en: 'Milford Sound cruise — photograph the fiord\'s grandeur', th: 'ล่องเรือ Milford Sound — ถ่ายความยิ่งใหญ่ของฟยord' } },
            ],
          },
          {
            day: 2,
            title: { en: 'Day 2 — Queenstown to Wanaka', th: 'วัน 2 — Queenstown สู่ Wanaka' },
            subtitle: { en: 'Clear-sky landscape session', th: 'ถ่ายทิวทัศน์ท้องฟ้าแจ่มใส' },
            events: [
              { time: '08:00', description: { en: 'Depart Queenstown for Wanaka', th: 'ออกจาก Queenstown ไป Wanaka' } },
              { time: '10:30', description: { en: 'Crown Range lookout — alpine panorama', th: 'Crown Range lookout — panorama บนภูเขา' } },
              { time: '14:00', description: { en: 'Wanaka lakeside — clear-sky landscape photography', th: 'ริมทะเลสาบ Wanaka — ถ่ายทิวทัศน์ท้องฟ้าแจ่มใส' } },
              { time: '17:30', description: { en: 'Golden hour at Roys Peak road viewpoint (conditions permitting)', th: 'Golden hour ที่จุดชม Roys Peak road (ตามสภาพอากาศ)' } },
            ],
          },
          {
            day: 3,
            title: { en: 'Day 3 — Fox Glacier', th: 'วัน 3 — Fox Glacier' },
            subtitle: { en: 'Turquoise lake at peak summer colour', th: 'ทะเลสาบสีฟ้าเขียวสดใสที่สุดในฤดูร้อน' },
            events: [
              { time: '08:00', description: { en: 'Travel from Wanaka across to the West Coast', th: 'เดินทางจาก Wanaka ไปชายฝั่งตะวันตก' } },
              { time: '12:00', description: { en: 'Fox Glacier region — summer is when turquoise lake colour is most vivid', th: 'Fox Glacier — ฤดูร้อนสีน้ำทะเลสาบสดใสที่สุด' } },
              { time: '16:00', description: { en: 'Lake Matheson reflection walk (Mirror Lake)', th: 'เดิน Lake Matheson (Mirror Lake) ถ่ายสะท้อน' } },
              { time: '18:30', description: { en: 'West Coast sunset photography session', th: 'ถ่ายพระอาทิตย์ตกชายฝั่งตะวันตก' } },
            ],
          },
          {
            day: 4,
            title: { en: 'Day 4 — Lindis Pass to Mount Cook', th: 'วัน 4 — Lindis Pass สู่ Mount Cook' },
            subtitle: { en: 'Grasslands, Lake Pukaki & Peter\'s Lookout', th: 'ทุ่งหญ้า Lake Pukaki & Peter\'s Lookout' },
            events: [
              { time: '08:00', description: { en: 'Scenic drive through Lindis Pass golden grasslands', th: 'ขับชมทุ่งหญ้า Lindis Pass สีทอง' } },
              { time: '11:00', description: { en: 'Photo stop at Lake Pukaki — Aoraki backdrop', th: 'แวะถ่าย Lake Pukaki — ฉากหลัง Aoraki' } },
              { time: '14:00', description: { en: 'Aoraki/Mount Cook National Park entry', th: 'เข้าอุทยาน Aoraki/Mount Cook' } },
              { time: '16:30', description: { en: "Peter's Lookout — panoramic alpine viewpoint", th: "Peter's Lookout — จุดชมวิวบนภูเขา" } },
            ],
          },
          {
            day: 5,
            title: { en: 'Day 5 — Lake Tekapo', th: 'วัน 5 — Lake Tekapo' },
            subtitle: { en: 'Church of the Good Shepherd icon shot', th: 'Church of the Good Shepherd มุมไอคอน' },
            events: [
              { time: '07:00', description: { en: 'Sunrise at Mount Cook (optional early mission)', th: 'พระอาทิตย์ขึ้นที่ Mount Cook (ทางเลือก)' } },
              { time: '11:00', description: { en: 'Drive to Lake Tekapo', th: 'ขับไป Lake Tekapo' } },
              { time: '15:00', description: { en: 'Photograph the iconic Church of the Good Shepherd', th: 'ถ่าย Church of the Good Shepherd มุมไอคอน' } },
              { time: '18:00', description: { en: 'Tekapo lakeside golden hour & dinner', th: 'Golden hour ริม Tekapo & มื้อเย็น' } },
            ],
          },
          {
            day: 6,
            title: { en: 'Day 6 — Return to Queenstown', th: 'วัน 6 — กลับ Queenstown' },
            subtitle: { en: 'Prepare for departure & flight to Sydney', th: 'เตรียมตัวกลับ & บินซิดนีย์' },
            events: [
              { time: '08:00', description: { en: 'Scenic return drive to Queenstown', th: 'ขับกลับ Queenstown ชมวิว' } },
              { time: '12:00', description: { en: 'Free time in Queenstown — lunch & final shots', th: 'เวลาว่าง Queenstown — มื้อกลางวัน & ถ่ายภาพสุดท้าย' } },
              { time: '15:00', description: { en: 'Transfer to Queenstown Airport', th: 'รถไปสนามบิน Queenstown' } },
              { time: '17:00', description: { en: 'Jetstar flight Queenstown → Sydney — trip concludes', th: 'บิน Jetstar Queenstown → ซิดนีย์ — จบทริป' } },
            ],
          },
        ],
      },
      autumn: {
        days: NZ_AUTUMN_WINTER_DAYS,
        seasonNote: {
          en: 'Autumn departure from $2,350 AUD per person.',
          th: 'ทริปฤดูใบไม้ร่วง ราคา $2,350 AUD ต่อท่าน',
        },
      },
      winter: {
        days: NZ_AUTUMN_WINTER_DAYS,
        seasonNote: {
          en: 'Winter departures (Jun–Aug) follow the same route as Autumn — pack thermal layers for alpine conditions.',
          th: 'ทริปฤดูหนาว (มิ.ย.–ส.ค.) ใช้เส้นทางเดียวกับฤดูใบไม้ร่วง — เตรียมเสื้อกันหนาวสำหรับพื้นที่บนภูเขา',
        },
      },
    },
  },
}

/** Build overview itinerary from highlights when full day-by-day isn't defined.
 * Kept for tooling; public detail page no longer fabricates day-by-day from highlights. */
function overviewFromHighlights(
  tripCode: string,
  highlights: { en: string[]; th: string[] },
  durationLabel: string,
): TripItinerary {
  const dayCount = Math.min(Math.max(1, parseInt(durationLabel, 10) || 1), highlights.en.length)
  const days: ItineraryDay[] = []
  for (let i = 0; i < dayCount; i++) {
    days.push({
      day: i + 1,
      title: {
        en: `Day ${i + 1} — Trip overview`,
        th: `วัน ${i + 1} — ภาพรวมทริป`,
      },
      subtitle: {
        en: `${tripCode} · summary itinerary`,
        th: `${tripCode} · แผนภาพรวม`,
      },
      events: [
        {
          time: '—',
          description: {
            en: highlights.en[i] ?? highlights.en[0] ?? 'Photo locations with mentor guidance',
            th: highlights.th[i] ?? highlights.th[0] ?? 'จุดถ่ายภาพพร้อม Mentor',
          },
        },
      ],
    })
  }
  return { detailed: false, days }
}

/** Convert DB simple day cards into the TripTimeline shape. */
export function itineraryFromDbDays(
  days: {
    day: number
    title_en: string
    title_th: string
    description_en: string
    description_th: string
  }[],
): TripItinerary {
  return {
    detailed: true,
    days: days.map((d) => ({
      day: d.day,
      title: { en: d.title_en, th: d.title_th },
      subtitle: { en: '', th: '' },
      events: [
        {
          time: 'Day plan',
          category: 'activity' as const,
          description: { en: d.description_en, th: d.description_th },
        },
      ],
    })),
  }
}

export function listItineraryTemplateCodes(): string[] {
  return Object.keys(TRIP_ITINERARIES)
}

export function hasDetailedCmsItinerary(tripCode: string): boolean {
  const template = resolveTemplateTripCode(tripCode, listItineraryTemplateCodes())
  if (!template) return false
  const entry = TRIP_ITINERARIES[template]
  return Boolean(entry?.detailed)
}

/**
 * Resolve itinerary for a tour:
 * 1) DB override (tours.itinerary) when non-empty
 * 2) Local CMS via template code (ULU-4D3N-SEP26_29 → ULU-4D3N)
 * 3) null — UI hides / shows coming-soon (no fabricated days)
 */
export function getItinerary(
  tripCode: string,
  highlights?: { en: string[]; th: string[] },
  durationLabel?: string,
  dbDays?: {
    day: number
    title_en: string
    title_th: string
    description_en: string
    description_th: string
  }[] | null,
): TripItinerary | null {
  if (dbDays && dbDays.length > 0) {
    return itineraryFromDbDays(dbDays)
  }

  const template = resolveTemplateTripCode(tripCode, listItineraryTemplateCodes())
  if (template && TRIP_ITINERARIES[template]) {
    return TRIP_ITINERARIES[template]
  }

  // Optional overview fallback only when explicitly requested with highlights —
  // public TripDetailPage passes no highlights for fabrication anymore.
  if (highlights && durationLabel) {
    return overviewFromHighlights(tripCode.toUpperCase(), highlights, durationLabel)
  }

  return null
}
