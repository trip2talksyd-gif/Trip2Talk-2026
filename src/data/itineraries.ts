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
        description: {
          en: 'Jetstar arrival Queenstown — trip begins, SUV pickup',
          th: 'ถึง Queenstown — เริ่มทริป รับรถ SUV',
        },
      },
      {
        time: '10:00',
        description: {
          en: 'Arrowtown — famous autumn foliage, street & tree-tunnel photography in orange/red tones',
          th: 'Arrowtown — ใบไม้เปลี่ยนสีดัง ถ่ายถนนและอุโมงค์ต้นไม้โทนส้ม-แดง',
        },
      },
      {
        time: '14:00',
        description: {
          en: 'Afternoon drive into Wanaka',
          th: 'บ่ายขับเข้า Wanaka',
        },
      },
      {
        time: '17:00',
        description: {
          en: "That Wanaka Tree — lone tree in the lake icon shot",
          th: 'That Wanaka Tree — มุมไอคอนต้นไม้โดดเดี่ยวกลางน้ำ',
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

export const TRIP_ITINERARIES: Record<string, TripItinerary> = {
  'ULU-4D3N': {
    detailed: true,
    days: [
      {
        day: 1,
        title: { en: 'Day 1 — Sydney to Uluru', th: 'วัน 1 — ซิดนีย์สู่อุลูรู' },
        subtitle: { en: 'Jetstar flight & sunset at Uluru', th: 'บิน Jetstar & พระอาทิตย์ตกที่อุลูรู' },
        events: [
          { time: '06:00', description: { en: 'Meet at Sydney Airport — Jetstar check-in', th: 'พบกันที่สนามบินซิดนีย์ — เช็คอิน Jetstar' } },
          { time: '09:30', description: { en: 'Flight to Ayers Rock (Uluru) Airport', th: 'บินสู่สนามบิน Ayers Rock (Uluru)' } },
          { time: '12:00', description: { en: 'Lunch & lodge check-in at Yulara', th: 'มื้อกลางวัน & เช็คอินที่ Yulara' } },
          { time: '16:30', description: { en: 'Uluru sunset viewing & photography session', th: 'ชมและถ่ายภาพพระอาทิตย์ตกที่อุลูรู' } },
          { time: '20:00', description: { en: 'Dinner & early rest for sunrise mission', th: 'มื้อเย็น & พักผ่อนเตรียมตื่นเช้า' } },
        ],
      },
      {
        day: 2,
        title: { en: 'Day 2 — Field of Light & Kata Tjuta', th: 'วัน 2 — Field of Light & Kata Tjuta' },
        subtitle: { en: 'Iconic installations and the Olgas', th: 'งานศิลป์และ Kata Tjuta' },
        events: [
          { time: '05:15', description: { en: 'Field of Light viewing — pre-dawn entry', th: 'Field of Light — เข้าชมก่อนฟ้าสาง' } },
          { time: '07:30', description: { en: 'Breakfast at lodge', th: 'อาหารเช้าที่ที่พัก' } },
          { time: '10:00', description: { en: 'Kata Tjuta (The Olgas) valley walk', th: 'เดินชม Kata Tjuta (The Olgas)' } },
          { time: '14:00', description: { en: 'Rest & edit session — lodge downtime', th: 'พักผ่อน & ตัดต่อภาพที่ที่พัก' } },
          { time: '17:30', description: { en: 'Second Uluru sunset from alternate angle', th: 'พระอาทิตย์ตกอุลูรูมุมที่สอง' } },
        ],
        note: {
          en: 'Pack thermal layers — desert nights drop below 0°C',
          th: 'เตรียมเสื้อกันหนาว — กลางคืนทะเลทรายต่ำกว่า 0°C',
        },
      },
      {
        day: 3,
        title: { en: 'Day 3 — Uluru sunrise & cultural sites', th: 'วัน 3 — พระอาทิตย์ขึ้น & แหล่งวัฒนธรรม' },
        subtitle: { en: 'Golden hour at the rock', th: 'Golden hour ที่โขดหินแดง' },
        events: [
          { time: '05:30', description: { en: 'Uluru sunrise — main photography mission', th: 'พระอาทิตย์ขึ้นอุลูรู — ภารกิจถ่ายภาพหลัก' } },
          { time: '08:00', description: { en: 'Breakfast & base walk viewing points', th: 'อาหารเช้า & จุดชมรอบฐานอุลูรู' } },
          { time: '11:00', description: { en: 'Cultural centre visit (optional)', th: 'เยี่ยมชมศูนย์วัฒนธรรม (ทางเลือก)' } },
          { time: '15:00', description: { en: 'Free time / photo review with mentor', th: 'เวลาว่าง / ทบทวนภาพกับ Mentor' } },
          { time: '18:00', description: { en: 'Milky Way prep briefing (conditions permitting)', th: 'บรรยายเตรียมถ่ายทางช้างเผือก (ตามสภาพอากาศ)' } },
        ],
      },
      {
        day: 4,
        title: { en: 'Day 4 — Final sunrise & departure', th: 'วัน 4 — พระอาทิตย์ขึ้นสุดท้าย & กลับ' },
        subtitle: { en: 'Last shots before Jetstar return', th: 'ถ่ายภาพครั้งสุดท้ายก่อนบินกลับ' },
        events: [
          { time: '05:45', description: { en: 'Final sunrise session — mentor picks best location', th: 'พระอาทิตย์ขึ้นครั้งสุดท้าย — Mentor เลือกจุดที่ดีที่สุด' } },
          { time: '08:30', description: { en: 'Checkout & transfer to airport', th: 'เช็คเอาท์ & รถไปสนามบิน' } },
          { time: '11:00', description: { en: 'Jetstar flight return to Sydney', th: 'บิน Jetstar กลับซิดนีย์' } },
          { time: '15:00', description: { en: 'Arrive Sydney — trip concludes', th: 'ถึงซิดนีย์ — จบทริป' } },
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
          en: 'Autumn departure from $2,300 AUD per person.',
          th: 'ทริปฤดูใบไม้ร่วง ราคา $2,300 AUD ต่อท่าน',
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

/** Build overview itinerary from highlights when full day-by-day isn't defined */
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

export function getItinerary(
  tripCode: string,
  highlights?: { en: string[]; th: string[] },
  durationLabel?: string,
): TripItinerary | null {
  const code = tripCode.toUpperCase()
  if (TRIP_ITINERARIES[code]) return TRIP_ITINERARIES[code]
  if (highlights && durationLabel) {
    return overviewFromHighlights(code, highlights, durationLabel)
  }
  return null
}
