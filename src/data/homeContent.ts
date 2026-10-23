/**
 * Homepage v7 copy (approved mockup: docs/mockups/homepage-v7).
 * Every string is bilingual. Headlines are split into pre / hi / post so the
 * highlighted phrase can be styled without nesting Thai under the Latin font.
 */

export type Bi = { en: string; th: string }

/** Headline with one highlighted phrase: `${pre}${hi}${post}` per language. */
export type HiHeading = {
  en: { pre: string; hi: string; post: string }
  th: { pre: string; hi: string; post: string }
}

export const HOME_IMG = {
  heroPoster: '/home/hero-poster.webp',
  lovePaint: '/home/love-lightpaint.webp',
  auroraCradle: '/home/tas-aurora-cradle.webp',
  nightPortrait: '/home/night-portrait.webp',
  dawn: '/home/dawn-boathouse.webp',
  beach: '/home/beach-fun.webp',
  tasting: '/home/local-tasting.webp',
  sunsetTrio: '/home/sunset-trio.webp',
  auroraPaint: '/home/aurora-lightpaint.webp',
  couple: '/home/couple-portrait.webp',
  saen: '/home/kata-tjuta-saen.webp',
  uluruSunset: '/home/uluru-sunset.webp',
  tasmaniaPoster: '/home/tasmania-poster.webp',
  nzCliffs: '/home/nz-cliffs.webp',
} as const

export const HOME_HERO = {
  pill: { en: 'Small-group photo trips · max 6 people', th: 'ทริปถ่ายภาพกลุ่มเล็ก · ไม่เกิน 6 คน' } as Bi,
  heading: {
    en: { pre: 'Travel with a ', hi: 'real photographer', post: '' },
    th: { pre: 'ออกทริปกับ', hi: 'ช่างภาพตัวจริง', post: '' },
  } as HiHeading,
  sub: {
    en: "Saen takes you to the best light in every place and makes you the star of every frame. Enjoy the trip — and come home with photos you'll actually keep.",
    th: 'พี่แสนพาไปเก็บแสงที่สวยที่สุดของแต่ละที่ และถ่ายให้คุณเป็นตัวเอกของทุกเฟรม เที่ยวให้เต็มที่ แล้วกลับบ้านพร้อมรูปที่อยากเก็บไว้จริง ๆ',
  } as Bi,
  ctaTrips: { en: 'See open trips', th: 'ดูทริปที่เปิดรับ' } as Bi,
  ctaReel: { en: 'Watch real trip clips', th: 'ดูคลิปทริปจริง' } as Bi,
  pillars: [
    { hi: { en: 'Small group', th: 'กลุ่มเล็ก' }, rest: { en: 'everyone looked after', th: 'ดูแลทั่วถึง' } },
    { hi: { en: 'Real light', th: 'เก็บแสง' }, rest: { en: 'at the right moment', th: 'จังหวะที่ใช่' } },
    { hi: { en: 'Premium photos', th: 'รูปพรีเมียม' }, rest: { en: "you'll keep", th: 'ที่เก็บไว้จริง' } },
  ] as { hi: Bi; rest: Bi }[],
}

export const HOME_WHY = {
  kicker: { en: 'Why Trip2Talk', th: 'ทำไมต้อง Trip2Talk' } as Bi,
  heading: {
    en: { pre: 'A trip that ', hi: 'fills you up', post: ' — heart and camera' },
    th: { pre: 'ทริปที่', hi: 'เติมเต็ม', post: ' ทั้งใจและกล้อง' },
  } as HiHeading,
  lead: {
    en: "We're not a stop-for-five-minutes coach tour. We travel slower, wait for the light, and look after everyone in the group.",
    th: 'เราไม่ใช่ทัวร์ชะโงกทัวร์ที่จอดถ่ายห้านาทีแล้วไปต่อ เราเดินทางช้าลง รอแสง และใส่ใจทุกคนในกลุ่ม',
  } as Bi,
  cards: [
    {
      img: HOME_IMG.lovePaint,
      tag: '01 · SMALL GROUP',
      title: { en: 'Small group, like travelling with friends', th: 'กลุ่มเล็ก เหมือนเที่ยวกับเพื่อน' },
      body: {
        en: 'Never more than 6 per trip. Everyone gets time with the photographer — no fighting for angles, no rushing.',
        th: 'ไม่เกิน 6 คนต่อทริป ทุกคนได้เวลากับช่างภาพ ไม่ต้องแย่งมุม ไม่ต้องรีบ',
      },
      alt: { en: 'Trip guests light-painting LOVE at night', th: 'เพื่อนร่วมทริปเขียนคำว่า LOVE ด้วยไฟฉายตอนกลางคืน' },
    },
    {
      img: HOME_IMG.auroraCradle,
      tag: '02 · REAL LIGHT',
      title: { en: 'Real light, at the right moment', th: 'พาไปเก็บแสง ในจังหวะที่ใช่' },
      body: {
        en: 'Sunrise, golden hour, the Milky Way, the aurora — we plan the trip around the light, not around a coach timetable.',
        th: 'แสงเช้า golden hour ทางช้างเผือก ออโรร่า เราวางแผนทริปตามแสง ไม่ใช่ตามรถทัวร์',
      },
      alt: { en: 'Aurora over Cradle Mountain, Tasmania', th: 'ออโรร่าเหนือเครเดิลเมาน์เทน แทสเมเนีย' },
    },
    {
      img: HOME_IMG.nightPortrait,
      tag: '03 · PREMIUM PHOTOS',
      title: { en: "Premium photos you'll actually keep", th: 'รูปพรีเมียม ที่คุณจะเก็บไว้จริง' },
      body: {
        en: 'Your photographer shoots you all trip — portraits and landscapes — and sends the edited set after the trip.',
        th: 'ช่างภาพถ่ายคุณตลอดทริป ทั้งพอร์ตเทรตและวิว แต่งเสร็จส่งให้หลังจบทริป',
      },
      alt: { en: 'Night portrait under a starry sky', th: 'พอร์ตเทรตตอนกลางคืนใต้ท้องฟ้าเต็มไปด้วยดาว' },
    },
  ],
}

export const HOME_DAY = {
  kicker: { en: 'The real trip experience', th: 'ประสบการณ์จริงบนทริป' } as Bi,
  heading: {
    en: { pre: 'A day ', hi: 'with Saen', post: '' },
    th: { pre: 'หนึ่งวัน ', hi: 'กับพี่แสน', post: '' },
  } as HiHeading,
  sub: { en: 'From first light to the last star.', th: 'ตั้งแต่แสงแรก จนถึงดาวดวงสุดท้าย' } as Bi,
  note: {
    en: 'Sample day from a Tasmania trip. Real timings follow the light and the weather.',
    th: 'ตัวอย่างหนึ่งวันจากทริปแทสเมเนีย ตารางจริงปรับตามแสงและสภาพอากาศ',
  } as Bi,
  stops: [
    {
      time: { en: '05:30', th: '05:30' },
      img: HOME_IMG.dawn,
      title: { en: 'Out for first light', th: 'ออกไปรับแสงแรก' },
      body: { en: 'Tripods by the lake before sunrise — Saen helps everyone dial in their settings.', th: 'ตั้งกล้องริมทะเลสาบก่อนพระอาทิตย์ขึ้น พี่แสนช่วยตั้งค่าให้ทุกคน' },
    },
    {
      time: { en: '10:00', th: '10:00' },
      img: HOME_IMG.beach,
      title: { en: 'Explore and shoot', th: 'เที่ยวไป ถ่ายไป' },
      body: { en: 'Scenic stops along the way and relaxed, fun portraits.', th: 'แวะจุดสวยระหว่างทาง ถ่ายพอร์ตเทรตแบบสนุก ไม่เกร็ง' },
    },
    {
      time: { en: '13:00', th: '13:00' },
      img: HOME_IMG.tasting,
      title: { en: 'Taste the local best', th: 'ชิมของดีท้องถิ่น' },
      body: { en: 'Lunch where locals actually eat — recharge before the evening.', th: 'พักกินของอร่อยที่คนท้องถิ่นไปจริง ๆ เติมพลังก่อนช่วงเย็น' },
    },
    {
      time: { en: '18:30', th: '18:30' },
      img: HOME_IMG.sunsetTrio,
      title: { en: 'Golden hour', th: 'Golden hour' },
      body: { en: 'The best light of the day — we are already in position before it arrives.', th: 'ช่วงแสงที่สวยที่สุดของวัน เราไปรอที่จุดที่ดีที่สุดก่อนแสงมา' },
    },
    {
      time: { en: '21:30', th: '21:30' },
      img: HOME_IMG.auroraPaint,
      title: { en: 'Stars and aurora', th: 'ล่าดาวและออโรร่า' },
      body: { en: 'Night shooting and light painting — shots that are hard to get on your own.', th: 'สอนถ่ายกลางคืนและวาดไฟ ได้รูปที่ถ่ายเองคนเดียวยาก' },
    },
    {
      time: { en: 'After the trip', th: 'หลังทริป' },
      img: HOME_IMG.couple,
      title: { en: 'Your premium photos arrive', th: 'รูปพรีเมียมถึงมือคุณ' },
      body: { en: 'An edited set ready to keep and share — memories you will open again and again.', th: 'รูปแต่งเสร็จพร้อมเก็บ พร้อมโพสต์ เป็นความทรงจำที่เปิดดูได้อีกนาน' },
      final: true,
    },
  ] as { time: Bi; img: string; title: Bi; body: Bi; final?: boolean }[],
}

export const HOME_SAEN = {
  kicker: { en: 'The person behind your camera', th: 'คนที่ถือกล้องให้คุณ' } as Bi,
  heading: {
    en: { pre: 'Meet ', hi: 'Saen', post: '' },
    th: { pre: 'รู้จัก', hi: 'พี่แสน', post: '' },
  } as HiHeading,
  sub: { en: 'Travel photographer · 10 years', th: 'ช่างภาพเดินทาง · 10 ปี' } as Bi,
  body: {
    en: 'A Thai travel photographer based in Sydney, leading Thai travellers to chase the light across Australia and New Zealand. Not a flag-waving guide — more like a big brother who brings the camera.',
    th: 'ช่างภาพเดินทางชาวไทยในซิดนีย์ ถ่ายภาพมา 10 ปี พาคนไทยออกเก็บแสงทั่วออสเตรเลียและนิวซีแลนด์ ไม่ใช่ไกด์ถือธง แต่เป็นพี่ชายที่ถือกล้องไปด้วยกัน',
  } as Bi,
  quote: {
    en: "We don't chase every landmark. We wait for the light, then we shoot.",
    th: 'เราไม่ได้ไล่ถ่ายทุกจุด เรารอแสงที่ใช่ แล้วค่อยกดชัตเตอร์',
  } as Bi,
  tag: 'KATA TJUTA · NT',
  alt: { en: 'Saen carrying a tripod at Kata Tjuta', th: 'พี่แสนถือขาตั้งกล้องที่กาตาจูตา' } as Bi,
  stats: {
    years: { en: 'years shooting', th: 'ปีที่ถ่ายภาพ' } as Bi,
    group: { en: 'people max per trip', th: 'คนสูงสุดต่อทริป' } as Bi,
    trips: { en: 'trips open now', th: 'ทริปที่เปิดรับ' } as Bi,
  },
}

export const HOME_GALLERY = {
  kicker: { en: 'Real photos from real trips — no stock', th: 'รูปจริงจากทริป ไม่ใช่ภาพสต็อก' } as Bi,
  heading: {
    en: { pre: '', hi: 'Light', post: " we've already caught" },
    th: { pre: '', hi: 'แสง', post: 'ที่เราเก็บมาแล้ว' },
  } as HiHeading,
  seeGallery: { en: 'See the full gallery', th: 'ดูแกลเลอรีทั้งหมด' } as Bi,
  seeSpots: { en: 'Explore 101 photo spots', th: 'ดูพิกัดถ่ายภาพ 101 มุม' } as Bi,
}

export const HOME_REELS = {
  kicker: { en: 'Watch before you decide', th: 'ดูก่อนตัดสินใจ' } as Bi,
  heading: {
    en: { pre: 'Clips from ', hi: 'real trips', post: '' },
    th: { pre: 'คลิปจาก', hi: 'ทริปจริง', post: '' },
  } as HiHeading,
  allOnYoutube: { en: 'All videos on YouTube', th: 'ดูคลิปทั้งหมดบน YouTube' } as Bi,
  clips: [
    { src: '/trip-videos/Uluru_web.mp4', poster: HOME_IMG.uluruSunset, title: { en: 'Uluru', th: 'อุลูรู' }, sub: { en: 'Field of Light', th: 'Field of Light' }, length: '0:17' },
    { src: '/trip-videos/Tasmania_cover_web.mp4', poster: HOME_IMG.tasmaniaPoster, title: { en: 'Tasmania', th: 'แทสเมเนีย' }, sub: { en: 'Cradle Mountain to Hobart', th: 'เครเดิลเมาน์เทน ถึงโฮบาร์ต' }, length: '0:47' },
    { src: '/trip-videos/NZ02_web.mp4', poster: HOME_IMG.nzCliffs, title: { en: 'New Zealand', th: 'นิวซีแลนด์' }, sub: { en: 'South Island coast', th: 'ชายฝั่งเกาะใต้' }, length: '0:19' },
  ] as { src: string; poster: string; title: Bi; sub: Bi; length: string }[],
}

export const HOME_TRIPS = {
  kicker: { en: 'Open for booking', th: 'ทริปที่เปิดรับ' } as Bi,
  heading: {
    en: { pre: 'Pick ', hi: 'your trip', post: '' },
    th: { pre: 'เลือก', hi: 'ทริปของคุณ', post: '' },
  } as HiHeading,
  sub: { en: 'Small groups, a pro photographer on every trip.', th: 'กลุ่มเล็ก มีช่างภาพมืออาชีพทุกทริป' } as Bi,
  from: { en: 'From', th: 'เริ่มต้น' } as Bi,
  seatsLeft: { en: '{n} seats left', th: 'เหลือ {n} ที่' } as Bi,
  full: { en: 'Full — join waitlist', th: 'เต็มแล้ว · ลงชื่อรอ' } as Bi,
  dateTba: { en: 'Dates on request', th: 'สอบถามวันเดินทาง' } as Bi,
  view: { en: 'Dates & price', th: 'ดูวันว่างและราคา' } as Bi,
  allTrips: { en: 'See all trips', th: 'ดูทริปทั้งหมด' } as Bi,
  swipe: { en: 'Swipe for more →', th: 'ปัดดูทริปอื่น →' } as Bi,
  empty: { en: 'New dates coming soon — message us on Facebook.', th: 'รอบใหม่กำลังจะเปิด ทักแชทเพจเพื่อสอบถามได้เลย' } as Bi,
}

export const HOME_FOLLOW = {
  kicker: { en: 'Follow our work', th: 'ติดตามผลงาน' } as Bi,
  heading: {
    en: 'New trips and behind-the-scenes, first',
    th: 'ดูทริปใหม่และเบื้องหลังการเก็บแสงก่อนใคร',
  } as Bi,
  body: {
    en: 'New trip dates, full trip films and photo tips from Saen.',
    th: 'รอบทริปใหม่ คลิปเต็มทุกทริป และเทคนิคถ่ายรูปจากพี่แสน',
  } as Bi,
  youtube: { title: 'YouTube', sub: { en: 'Trip2talk SYD channel', th: 'ช่อง Trip2talk SYD' } as Bi, cta: { en: 'Subscribe', th: 'ติดตาม' } as Bi },
  facebook: { title: 'Facebook', sub: { en: 'TriptoTalk page · chat with us', th: 'เพจ TriptoTalk · ทักแชทได้' } as Bi, cta: { en: 'Follow', th: 'กดติดตาม' } as Bi },
}

export const HOME_FINAL = {
  heading: {
    en: { pre: 'On your next trip, let Saen ', hi: 'hold the camera', post: '' },
    th: { pre: 'ทริปหน้า ให้พี่แสน', hi: 'ถือกล้องให้คุณ', post: '' },
  } as HiHeading,
  body: {
    en: 'Seats are limited because we always travel in small groups. Message us to check open dates.',
    th: 'ที่นั่งมีจำกัดเพราะเราไปกลุ่มเล็กเสมอ ทักมาถามรอบที่ว่างได้เลย',
  } as Bi,
  ctaChat: { en: 'Chat on Messenger', th: 'ทักแชท Messenger' } as Bi,
}
