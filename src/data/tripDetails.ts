export type BilingualText = { en: string; th: string }
export type BilingualList = { en: string[]; th: string[] }

export type TripDetailContent = {
  tagline: BilingualText
  highlights: BilingualList
  includes: BilingualList
  excludes: BilingualList
  /** Optional stay policy shown on Trip Detail (e.g. dorm vs private upgrade). */
  accommodationNote?: BilingualText
}

export const TRIP_DETAILS: Record<string, TripDetailContent> = {
  'SYD-INFLU-3H': {
    tagline: {
      en: 'Level-up your Sydney feed — 5 curated North & South locations, pro photographer, 3-hour session.',
      th: 'เก็บภาพสุดปังในซิดนีย์ด้วยแพ็กเกจถ่ายภาพสำหรับอินฟลูเอนเซอร์',
    },
    highlights: {
      en: [
        '5 curated locations across Sydney North & South',
        'Professional local photographer',
        '3-hour session with unlimited outfit changes',
        'Hotel pickup & drop-off',
        'Unlimited photos with colour grading',
        'Delivered via online album',
      ],
      th: [
        '5 จุดถ่ายคัดสรรทั่วซิดนีย์ฝั่งเหนือและใต้',
        'ช่างภาพท้องถิ่นมืออาชีพ',
        'เซสชัน 3 ชั่วโมง เปลี่ยนชุดได้ไม่จำกัด',
        'รับ-ส่งที่โรงแรม',
        'ภาพไม่จำกัดพร้อมแต่งสี',
        'ส่งงานผ่านออนไลน์อัลบั้ม',
      ],
    },
    includes: {
      en: ['Professional local photographer', 'Hotel pickup & drop-off', 'Unlimited photos with colour grading'],
      th: ['ช่างภาพท้องถิ่นมืออาชีพ', 'รับ-ส่งโรงแรม', 'ภาพไม่จำกัดพร้อมแต่งสี'],
    },
    excludes: {
      en: ['Personal travel costs', 'Food and drinks'],
      th: ['ค่าเดินทางส่วนตัว', 'อาหารและเครื่องดื่ม'],
    },
  },
  'MEL-4D3N': {
    tagline: {
      en: 'Melbourne & Great Ocean Road handled end-to-end — Twelve Apostles to Pink Lake. Pack your bag; we arrange flights and stays.',
      th: 'เมลเบิร์น & Great Ocean Road ครบวงจร — Twelve Apostles ถึง Pink Lake จองตั๋วและที่พักให้ แค่จัดกระเป๋าแล้วมา',
    },
    highlights: {
      en: ['Great Ocean Road & Twelve Apostles', 'Pink Lake reflections', 'Melbourne city street art'],
      th: ['Great Ocean Road & Twelve Apostles', 'ทะเลสาบสีชมพูสะท้อนแสง', 'สตรีทอาร์ตเมลเบิร์นซิตี้'],
    },
    includes: {
      en: ['SUV with driver & fuel', 'Pro photographer mentor', 'Park entry fees', 'Flight & accommodation booking assistance'],
      th: ['รถ SUV พร้อมคนขับและน้ำมัน', 'ช่างภาพ Mentor', 'ค่าเข้าอุทยาน', 'ช่วยจองตั๋วเครื่องบินและที่พัก'],
    },
    excludes: {
      en: ['Flights SYD↔MEL (we coordinate booking)', 'All meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบินไป-กลับ (เราช่วยจอง)', 'ค่าอาหารทุกมื้อ', 'ประกันการเดินทาง'],
    },
  },
  'ULU-4D3N': {
    tagline: {
      en: 'Trade the crowded tour bus for your own red-desert photo studio — with Sean, a professional photographer, capturing your best profile shots yet.',
      th: 'เบื่อไหมกับการเที่ยวแบบเดิมๆ? นี่คือทริปสำหรับสายลุยที่รักการถ่ายภาพอย่างแท้จริง พี่แสนพาคุณตะลุยหัวใจสีแดงของออสเตรเลีย เปลี่ยนทะเลทรายแดงให้เป็นสตูดิโอส่วนตัว',
    },
    highlights: {
      en: [
        'Uluru — Watch the giant monolith blaze from orange to fiery red at sunset, then witness one of the clearest Milky Way skies of your life once the desert night falls.',
        "Field of Light — Bruce Munro's world-famous art installation — over 50,000 glowing glass spheres. Shoot the twilight glow and the pre-dawn field before sunrise.",
        'Kata Tjuta (The Olgas) — 36 dramatic rock domes — landscape shots with real geological depth, plus a scenic walking trail.',
      ],
      th: [
        'Uluru (หินอุลูรู) — ชมหินยักษ์เปลี่ยนสีจากส้มเป็นแดงเพลิงยามอาทิตย์อัสดง และสัมผัสความมืดสนิทที่มองเห็นทางช้างเผือกชัดเจนที่สุดในชีวิต',
        'Field of Light — งานศิลปะระดับโลกโดย Bruce Munro หลอดไฟแก้วเปลี่ยนสีกว่า 50,000 ดวง เก็บภาพแสง twilight คู่กับทุ่งแสงไฟช่วงเช้ามืดก่อนพระอาทิตย์ขึ้น',
        'Kata Tjuta (The Olgas) — กลุ่มโดมหินกว่า 36 ก้อน ถ่ายภาพแลนด์สเคปที่มีมิติเชิงธรณีวิทยา พร้อมเส้นทางเดินป่าสำรวจที่สวยงาม',
      ],
    },
    includes: {
      en: [
        'Vehicle, driver & fuel for the whole trip',
        '3 nights accommodation',
        'Full 3-day Uluru-Kata Tjuta National Park entry',
        'Field of Light entry ticket',
        'Drinking water throughout',
        'Professional photographer guiding angles & posing',
        'Free flight booking assistance',
      ],
      th: [
        'รถพร้อมคนขับและค่าน้ำมันตลอดทริป',
        'ที่พัก 3 คืน',
        'ค่าเข้าอุทยาน Uluru-Kata Tjuta 3 วันเต็ม',
        'ตั๋วเข้าชม Field of Light',
        'น้ำดื่มตลอดทาง',
        'ช่างภาพมืออาชีพคอยดูแลมุมกล้องและโพสท่า',
        'บริการฟรีช่วยจองตั๋วเครื่องบิน',
      ],
    },
    excludes: {
      en: ['Round-trip flights', 'All meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบินไป-กลับ', 'ค่าอาหารทุกมื้อ', 'ประกันการเดินทาง'],
    },
    accommodationNote: {
      en: 'Stay at the Outback Lodge — clean, safe, backpacker-style dorm rooms (shared). Want privacy? Upgrade to a private room for an extra $350–$550 AUD/night (please request before departure).',
      th: 'พักที่ Outback Lodge สไตล์ Backpackers สะอาด ปลอดภัย ห้องพักรวม (Dormitory) หากต้องการความเป็นส่วนตัวสามารถอัปเกรดเป็นห้องเดี่ยว จ่ายเพิ่ม $350-$550 AUD ต่อคืน (กรุณาแจ้งก่อนออกเดินทาง)',
    },
  },
  'NZ-6D5N': {
    tagline: {
      en: 'South Island flagship — 6 days, every detail arranged. Flights, stays & Milford Sound; just arrive and shoot.',
      th: 'ทริปไฮไลท์ South Island 6 วัน — จัดทุกอย่างครบ ตั๋วเที่ยวบิน ที่พัก Milford Sound ถึงแล้วถ่ายรูปได้เลย',
    },
    highlights: {
      en: ['Lake Tekapo & Church of the Good Shepherd', 'Milford Sound fiord cruise', 'Queenstown & Southern Alps'],
      th: ['Lake Tekapo & Church of the Good Shepherd', 'ล่องเรือ Milford Sound', 'Queenstown & Southern Alps'],
    },
    includes: {
      en: ['SUV & driver 6 days', '5 nights accommodation (we coordinate booking)', 'Milford Sound cruise', 'Pro photographer', 'Flight booking assistance'],
      th: ['รถ SUV & คนขับ 6 วัน', 'ที่พัก 5 คืน (เราช่วยจอง)', 'Milford Sound cruise', 'ช่างภาพมืออาชีพ', 'ช่วยจองตั๋วเครื่องบิน'],
    },
    excludes: {
      en: ['International/domestic flights (we coordinate booking)', 'Meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบิน (เราช่วยจอง)', 'ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'TAS-3D2N': {
    tagline: {
      en: 'Arrive in Hobart, we handle the rest — aurora hunts, Bruny Island, MONA. Just pack and go.',
      th: 'ถึงโฮบาร์ตแล้วที่เหลือเราจัดให้ — ล่าแสงใต้ Bruny Island MONA แค่จัดกระเป๋าแล้วมา',
    },
    highlights: {
      en: ['Mt Wellington aurora hunt', 'Bruny Island full day', 'MONA & Hobart waterfront'],
      th: ['ล่าแสงใต้ Mt Wellington', 'Bruny Island เต็มวัน', 'MONA & ริมน้ำ Hobart'],
    },
    includes: {
      en: ['Private SUV & driver', 'Pro photographer', 'Park entries', 'Flight & accommodation booking assistance'],
      th: ['รถ SUV ส่วนตัว & คนขับ', 'ช่างภาพมืออาชีพ', 'ค่าเข้าสถานที่', 'ช่วยจองตั๋วเครื่องบินและที่พัก'],
    },
    excludes: {
      en: ['Flights (we coordinate booking)', 'Meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบิน (เราช่วยจอง)', 'ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'TAS-LH-4D3N': {
    tagline: {
      en: 'Launceston to Hobart, fully coordinated — lavender, Cradle Mountain, aurora missions. Fly in; we do the rest.',
      th: 'Launceston ถึง Hobart ประสานครบ — ลาเวนเดอร์ Cradle Mountain ล่าแสงใต้ บินมา ที่เหลือเราจัดให้',
    },
    highlights: {
      en: ['Bridestowe Lavender', 'Cradle Mountain', 'MONA & Mt Wellington aurora'],
      th: ['Bridestowe Lavender', 'Cradle Mountain', 'MONA & ล่าแสงใต้ Mt Wellington'],
    },
    includes: {
      en: ['Vehicle Launceston–Hobart', 'Photographer mentor', 'Lavender & MONA tickets', 'Flight & accommodation booking assistance'],
      th: ['รถ Launceston–Hobart', 'ช่างภาพ Mentor', 'ตั๋วลาเวนเดอร์ & MONA', 'ช่วยจองตั๋วเครื่องบินและที่พัก'],
    },
    excludes: {
      en: ['Flights (we coordinate booking)', 'Meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบิน (เราช่วยจอง)', 'ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'TAS-SU-4D3N': {
    tagline: {
      en: 'East coast Tasmania — Wineglass Bay to Bay of Fires. Flights & stays coordinated; you travel light.',
      th: 'แทสฝั่งตะวันออก — Wineglass Bay ถึง Bay of Fires จองตั๋วและที่พักให้ คุณแค่เตรียมกระเป๋า',
    },
    highlights: {
      en: ['Wineglass Bay lookout', 'Freycinet National Park', 'Bay of Fires orange rocks'],
      th: ['Wineglass Bay', 'Freycinet National Park', 'Bay of Fires หินสีส้ม'],
    },
    includes: {
      en: ['Vehicle & driver', 'Pro photographer', 'National park fees', 'Flight & accommodation booking assistance'],
      th: ['รถและคนขับ', 'ช่างภาพมืออาชีพ', 'ค่าเข้าอุทยาน', 'ช่วยจองตั๋วเครื่องบินและที่พัก'],
    },
    excludes: {
      en: ['Flights (we coordinate booking)', 'Meals', 'Travel insurance'],
      th: ['ตั๋วเครื่องบิน (เราช่วยจอง)', 'ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'BER-3D2N': {
    tagline: {
      en: 'South coast with your crew — we handle transport & timing, you get the dramatic shots.',
      th: 'ชายฝั่งใต้กับเพื่อนๆ — เราจัดรถและจังหวะเวลา คุณได้แต่รูปสวยอลังการ ไม่ต้องขับรถเอง',
    },
    highlights: {
      en: ['Horse Head Rock (low tide)', 'Blue Pool Bermagui', 'Wallaga Lake sunsets'],
      th: ['Horse Head Rock (น้ำลง)', 'Blue Pool Bermagui', 'พระอาทิตย์ตก Wallaga Lake'],
    },
    includes: {
      en: ['Transport from Sydney Thai Town', 'Driver & photographer', 'Safety briefing'],
      th: ['รถจาก Sydney Thai Town', 'คนขับและช่างภาพ', 'Safety briefing'],
    },
    excludes: {
      en: ['Meals', 'Travel insurance', 'Rock shoes (bring your own)'],
      th: ['ค่าอาหาร', 'ประกันการเดินทาง', 'รองเท้าปีนเขา (เตรียมเอง)'],
    },
  },
  'CAN-2D1N': {
    tagline: {
      en: 'Canola fields weekend — road trip without owning a car, spring gold guaranteed.',
      th: 'ทุ่งคาโนล่าสุดสัปดาห์ — ออกทริปโดยไม่ต้องมีรถ ฤดูใบไม้ผลิสีทองแน่นอน มากับเพื่อนๆ สบายๆ',
    },
    highlights: {
      en: ['Canola field photo spots', 'Cowra & Canowindra old towns', 'Cowra Japanese Garden (optional)'],
      th: ['จุดถ่ายทุ่งคาโนล่า', 'เมืองเก่า Cowra & Canowindra', 'สวนญี่ปุ่น Cowra (ทางเลือก)'],
    },
    includes: {
      en: ['1 night dorm accommodation', 'Vehicle & driver', 'Pro photographer'],
      th: ['ที่พัก 1 คืน (ห้องรวม)', 'รถและคนขับ', 'ช่างภาพมืออาชีพ'],
    },
    excludes: {
      en: ['Meals', 'Japanese Garden entry', 'Travel insurance'],
      th: ['ค่าอาหาร', 'ค่าเข้าสวนญี่ปุ่น', 'ประกันการเดินทาง'],
    },
  },
  'KIA-1DAY': {
    tagline: {
      en: 'Kiama & Bombo in a day — hop in from Thai Town, come back with banger coastal shots.',
      th: 'Kiama & Bombo วันเดียวจบ — นั่งรถจาก Thai Town กลับมาพร้อมรูปชายฝั่งสวยๆ ไม่ต้องขับเอง',
    },
    highlights: {
      en: ['Helensburgh Old Station', 'Seacliff Bridge', 'Bombo Headland Quarry'],
      th: ['Helensburgh Old Station', 'Seacliff Bridge', 'Bombo Headland Quarry'],
    },
    includes: {
      en: ['Pickup Sydney Thai Town', 'Driver & photographer', 'Drinking water'],
      th: ['รับ-ส่ง Sydney Thai Town', 'คนขับและช่างภาพ', 'น้ำดื่ม'],
    },
    excludes: {
      en: ['Meals', 'Travel insurance'],
      th: ['ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'PSP-1DAY': {
    tagline: {
      en: 'Blue Mountains escape — easy day trip from Sydney, Instagram-ready shots included.',
      th: 'หลบเมือง Blue Mountains — ทริปวันเดียวจากซิดนีย์ ได้รูปสวยพร้อมโพสต์ ไม่ต้องขับรถเอง',
    },
    highlights: {
      en: ['Three Sisters Echo Point', 'Govetts Leap', 'Sunset lookouts'],
      th: ['Three Sisters Echo Point', 'Govetts Leap', 'จุดชมพระอาทิตย์ตก'],
    },
    includes: {
      en: ['Transport & driver', 'Pro photographer', 'National park stops'],
      th: ['รถและคนขับ', 'ช่างภาพมืออาชีพ', 'แวะอุทยานแห่งชาติ'],
    },
    excludes: {
      en: ['Meals', 'Scenic World tickets (optional)', 'Travel insurance'],
      th: ['ค่าอาหาร', 'ตั๋ว Scenic World (ทางเลือก)', 'ประกันการเดินทาง'],
    },
  },
  'LAV-ANB-1D': {
    tagline: {
      en: 'Dunes & beach portraits — affordable half-day vibes with a pro behind the lens.',
      th: 'เนินทราย & ถ่ายริมทะเล — ทริปครึ่งวันราคาดี มีช่างภาพมืออาชีพดูแล ไม่ต้องขับรถเอง',
    },
    highlights: {
      en: ['Anna Bay sand dunes', 'Coastal portrait locations', 'Golden hour session'],
      th: ['เนินทราย Anna Bay', 'มุมถ่ายภาพริมชายหาด', 'Golden hour'],
    },
    includes: {
      en: ['Transport & driver', 'Pro photographer', 'Drone (where permitted)'],
      th: ['รถและคนขับ', 'ช่างภาพมืออาชีพ', 'โดรน (ตามกฎหมาย)'],
    },
    excludes: {
      en: ['Meals', 'Travel insurance'],
      th: ['ค่าอาหาร', 'ประกันการเดินทาง'],
    },
  },
  'SYD-MW-WIN': {
    tagline: {
      en: 'Milky Way night out with mates — we drive, you shoot, no gear stress.',
      th: 'ออกล่าทางช้างเผือกกับเพื่อนๆ — เราขับรถให้ คุณแค่ถ่ายรูป ไม่ต้องเครียดเรื่องรถ',
    },
    highlights: {
      en: ['Dark sky locations', 'Milky Way portraits', 'Astro camera coaching'],
      th: ['จุดท้องฟ้ามืด', 'ถ่ายภาพกับทางช้างเผือก', 'โค้ชตั้งค่ากล้องดาราศาสตร์'],
    },
    includes: {
      en: ['Evening transport', 'Pro photographer', 'Tripod guidance'],
      th: ['รถช่วงเย็น', 'ช่างภาพมืออาชีพ', 'แนะนำการใช้ขาตั้ง'],
    },
    excludes: {
      en: ['Meals', 'Travel insurance', 'Warm clothing (bring layers)'],
      th: ['ค่าอาหาร', 'ประกันการเดินทาง', 'เสื้อกันหนาว (เตรียมเอง)'],
    },
  },
  'SYD-1DAY': {
    tagline: {
      en: 'Sydney day trip with friends — no driving, curated photo spots, mentor on tap.',
      th: 'ทริปวันเดียวซิดนีย์กับเพื่อน — ไม่ต้องขับรถเอง จุดถ่ายคัดแล้ว มีช่างภาพคอยแนะนำ',
    },
    highlights: {
      en: ['Sydney 5 best photo locations', 'Anna Bay sand dunes', 'Milky Way hunt (winter)'],
      th: ['5 จุดถ่ายภาพซิดนีย์', 'เนินทราย Anna Bay', 'ล่าทางช้างเผือก (ฤดูหนาว)'],
    },
    includes: {
      en: ['Vehicle & driver', 'Pro photographer', 'Drone on select packages'],
      th: ['รถและคนขับ', 'ช่างภาพมืออาชีพ', 'โดรนในแพ็กที่กำหนด'],
    },
    excludes: {
      en: ['Meals', 'Travel insurance', 'Influencer package extras'],
      th: ['ค่าอาหาร', 'ประกันการเดินทาง', 'ค่าใช้จ่ายแพ็ก Influencer เพิ่มเติม'],
    },
  },
}

export function getTripDetails(tripCode: string): TripDetailContent | undefined {
  return TRIP_DETAILS[tripCode.toUpperCase()]
}

export function textFor(item: BilingualText, lang: 'en' | 'th'): string {
  return lang === 'th' ? item.th : item.en
}

export function listFor(item: BilingualList, lang: 'en' | 'th'): string[] {
  return lang === 'th' ? item.th : item.en
}

/** @deprecated use textFor / listFor */
export function pickBilingual(item: BilingualText, lang: 'en' | 'th'): string
export function pickBilingual(item: BilingualList, lang: 'en' | 'th'): string[]
export function pickBilingual(item: BilingualText | BilingualList, lang: 'en' | 'th') {
  if ('en' in item && typeof item.en === 'string') return textFor(item as BilingualText, lang)
  return listFor(item as BilingualList, lang)
}
