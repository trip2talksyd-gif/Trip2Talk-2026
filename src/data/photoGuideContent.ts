/** Content sourced from Trip2Talk-Mockup-Teal.html guide sections — single-lang via useLang. */

export const POSING_TIPS = [
  {
    n: 1,
    titleEn: 'Turn 3/4, chin down',
    titleTh: 'หันตัว 3/4 ก้มคางเล็กน้อย',
    bodyEn:
      'Angle your body away from the camera, turn your face back, chin slightly down and eyes up — instantly slimming and natural.',
    bodyTh:
      'หันตัวออกจากกล้องเล็กน้อย แล้วหันหน้ากลับมา ก้มคางนิดๆ มองขึ้น — ได้ลุคผอมและเป็นธรรมชาติทันที',
  },
  {
    n: 2,
    titleEn: "Walk it, don't pose it",
    titleTh: 'เดินไปเรื่อยๆ ไม่ต้องเป๊ะ',
    bodyEn:
      'Let the photographer catch you mid-stride or mid-laugh. Candid movement beats a stiff stand-and-smile every time.',
    bodyTh:
      'ให้ช่างภาพจับช่วงที่คุณกำลังเดินหรือหัวเราะ การเคลื่อนไหวแบบธรรมชาติดีกว่ายืนยิ้มแข็งทุกครั้ง',
  },
  {
    n: 3,
    titleEn: 'One hand, one hip',
    titleTh: 'มือหนึ่งเท้าเอว',
    bodyEn:
      'Rest one hand lightly on your hip or in a pocket — it creates a triangle shape that reads as relaxed and confident.',
    bodyTh: 'วางมือเบาๆ ที่เอวหรือในกระเป๋า — สร้างรูปสามเหลี่ยมที่ดูผ่อนคลายและมั่นใจ',
  },
  {
    n: 4,
    titleEn: 'Look away from the lens',
    titleTh: 'มองออกไปนอกเฟรม',
    bodyEn:
      'Gazing at the view instead of the camera makes the photo feel like a real travel moment, not a studio shot.',
    bodyTh: 'มองวิวแทนการมองกล้อง ทำให้ภาพรู้สึกเหมือนโมเมนต์ท่องเที่ยวจริง ไม่ใช่ถ่ายในสตูดิโอ',
  },
  {
    n: 5,
    titleEn: "Sit, lean, don't stand stiff",
    titleTh: 'นั่งหรือพิงกำแพง',
    bodyEn:
      'Use a rock, railing or step to sit or lean on. It softens your posture and gives the photographer more angles to work with.',
    bodyTh: 'ใช่ก้อนหิน ราว หรือบันไดนั่ง/พิง — ท่าทางนุ่มขึ้น และช่างภาพมีมุมถ่ายมากขึ้น',
  },
  {
    n: 6,
    titleEn: 'Layer for movement',
    titleTh: 'ใส่เสื้อผ้าที่มีจังหวะพลิ้ว',
    bodyEn:
      'Scarves, loose jackets and long dresses catch the wind — ask your photographer for a "movement shot" on windy days.',
    bodyTh: 'ผ้าพันคอ แจ็คเก็ตหลวม หรือเดรสยาวรับลมได้ดี — ขอช็อตเคลื่อนไหวในวันที่ลมแรง',
  },
] as const

export const SEASON_CARDS = [
  {
    trip: 'SYD-INFLU-3H',
    monthsEn: 'Dec – Feb · Summer',
    monthsTh: 'ธ.ค. – ก.พ. · ฤดูร้อน',
    titleEn: 'Light & linen',
    titleTh: 'ผ้าลินินสีอ่อน',
    bodyEn: "Sand, cream & terracotta pastels stand out against Sydney's blue harbour and beaches.",
    bodyTh: 'โทนทราย ครีม และเทอร์ราคอตตา ตัดกับฟ้าทะเลซิดนีย์ได้สวย',
    gradient: 'from-[#e8935a] to-[#d1602f]',
    swatches: ['#f3e6d3', '#f8f1e6', '#e7b98c', '#d97b4a'],
  },
  {
    trip: 'TAS-3D2N',
    monthsEn: 'Mar – May · Autumn',
    monthsTh: 'มี.ค. – พ.ค. · ฤดูใบไม้ร่วง',
    titleEn: 'Earth tones',
    titleTh: 'โทนสีดิน',
    bodyEn: "Rust, olive & deep mustard echo Tasmania's changing forest colours.",
    bodyTh: 'สนิมมะกอกและมัสตาร์ดเข้มสะท้อนสีป่าแทสเมเนีย',
    gradient: 'from-[#7a5230] to-[#4d3220]',
    swatches: ['#a9713f', '#c98f4e', '#6b4226', '#8a3324'],
  },
  {
    trip: 'NZ-6D5N',
    monthsEn: 'Jun – Aug · Winter',
    monthsTh: 'มิ.ย. – ส.ค. · ฤดูหนาว',
    titleEn: 'Jewel tones & layers',
    titleTh: 'โทนอัญมณี ใส่หลายชั้น',
    bodyEn:
      'Emerald, burgundy & navy pop against snow in the NZ Alps — and photograph beautifully under aurora green.',
    bodyTh: 'มรกต เบอร์กันดี และกรมท่า ตัดกับหิมะ NZ และสวยใต้แสงออโรร่า',
    gradient: 'from-[#1b2a4a] to-[#0d1730]',
    swatches: ['#2e4d8f', '#5c2e6b', '#7a1f2b', '#0f2a3d'],
  },
  {
    trip: 'ULU-4D3N',
    monthsEn: 'Sep – Nov · Spring',
    monthsTh: 'ก.ย. – พ.ย. · ฤดูใบไม้ผลิ',
    titleEn: 'Soft florals',
    titleTh: 'โทนดอกไม้อ่อนหวาน',
    bodyEn: "Blush pink, sage & soft yellow suit Uluru's wildflower season and Melbourne's laneways.",
    bodyTh: 'ชมพูอ่อน เสจ และเหลืองอ่อนเข้ากับดอกไม้ป่าอูลูรูและเลนเวย์เมลเบิร์น',
    gradient: 'from-[#c98fa8] to-[#7fae7a]',
    swatches: ['#f2c9d8', '#eef0c9', '#bfe0b8', '#f7e3ea'],
  },
] as const

export const CAMERA_SETTINGS = [
  {
    sceneEn: 'Morning golden hour',
    sceneTh: 'แสงเช้าทอง',
    f: 'f/4 – f/8',
    shutter: '1/250s',
    iso: '100–200',
    noteEn: 'Soft warm side-light, shoot away from the sun for even skin tones.',
    noteTh: 'แสงด้านข้างอุ่นนุ่ม ถ่ายหันหลังแดดเพื่อสีผิวสม่ำเสมอ',
  },
  {
    sceneEn: 'Midday / harsh sun',
    sceneTh: 'แดดจ้าตอนกลางวัน',
    f: 'f/8 – f/11',
    shutter: '1/500s+',
    iso: '100',
    noteEn: 'Find open shade or shoot backlit with fill flash to avoid harsh shadows.',
    noteTh: 'หาที่ร่มเปิดหรือถ่ายย้อนแสงพร้อมแฟลชเติม กันเงาแข็ง',
  },
  {
    sceneEn: 'Evening golden hour',
    sceneTh: 'แสงเย็นทอง',
    f: 'f/2.8 – f/5.6',
    shutter: '1/200s',
    iso: '100–400',
    noteEn: 'Widest window for warm portraits — shoot 45 min before sunset.',
    noteTh: 'ช่วงพอร์ตเทรตอุ่นที่สุด — ถ่ายก่อนพระอาทิตย์ตกประมาณ 45 นาที',
  },
  {
    sceneEn: 'Blue hour',
    sceneTh: 'ช่วงฟ้าสีคราม',
    f: 'f/4 – f/5.6',
    shutter: '1/60 – 1/15s',
    iso: '400–800',
    noteEn: 'Use a tripod once shutter drops below 1/focal length. Great for city/harbour skylines.',
    noteTh: 'ใช้ขาตั้งเมื่อชัตเตอร์ช้ากว่า 1/ความยาวโฟกัส เหมาะกับเส้นขอบฟ้าเมือง/ท่าเรือ',
  },
  {
    sceneEn: 'Night sky / stars',
    sceneTh: 'ท้องฟ้ายามค่ำคืน/ดาว',
    f: 'f/2.8 or wider',
    shutter: '15–25s',
    iso: '1600–3200',
    noteEn: '"500 rule": max shutter (s) ≈ 500 ÷ focal length, to keep stars sharp.',
    noteTh: 'กฎ 500: ชัตเตอร์สูงสุด (วินาที) ≈ 500 ÷ ความยาวโฟกัส เพื่อดาวคม',
  },
  {
    sceneEn: 'Milky Way',
    sceneTh: 'ทางช้างเผือก',
    f: 'f/1.8 – f/2.8',
    shutter: '20–30s',
    iso: '3200–6400',
    noteEn: 'Shoot new-moon nights, wide lens (14–24mm), manual focus set to infinity.',
    noteTh: 'ถ่ายคืนเดือนมืด เลนส์มุมกว้าง 14–24 มม. โฟกัสแมนนวลที่อินฟินิตี้',
  },
  {
    sceneEn: 'Aurora Australis',
    sceneTh: 'แสงออโรร่า',
    f: 'f/2.8 or wider',
    shutter: '5–15s',
    iso: '1600–3200',
    noteEn:
      'Shorter shutter for fast-moving bands, longer for faint/still glow. Available on select NZ trips.',
    noteTh: 'ชัตเตอร์สั้นเมื่อแถบแสงเร็ว ยาวเมื่อแสงจาง/นิ่ง — มีในทริป NZ บางรอบ',
  },
] as const

export const CAMERA_GEAR = [
  {
    en: 'Tripod (even a mini one)',
    th: 'ขาตั้งกล้อง แม้จะเป็นแบบเล็ก',
  },
  {
    en: 'Spare batteries',
    th: 'แบตเตอรี่สำรอง — อากาศเย็นแบตหมดไว',
  },
  {
    en: 'Wide-angle lens (14–24mm)',
    th: 'เลนส์มุมกว้างสำหรับถ่ายดาว',
  },
  {
    en: 'Lens cloth & rain cover',
    th: 'ผ้าเช็ดเลนส์และผ้าคลุมกันฝน',
  },
  {
    en: 'Headlamp with red-light mode',
    th: 'ไฟคาดหัวโหมดแสงแดง สำหรับถ่ายกลางคืน',
  },
  {
    en: 'Remote shutter or self-timer',
    th: 'รีโมทชัตเตอร์หรือตั้งเวลาถ่าย',
  },
] as const

export const MOBILE_LANDSCAPE_TIPS = [
  {
    en: 'Turn on grid lines',
    enBody: 'Line the horizon up on a grid line to keep it straight.',
    th: 'เปิดเส้นกริดในกล้อง',
    thBody: 'แล้ววางเส้นขอบฟ้าให้ตรงกับเส้นกริด',
  },
  {
    en: 'Tap to focus + lock exposure',
    enBody: "Tap the brightest part of the scene, then hold to lock so it doesn't blow out.",
    th: 'แตะจุดที่สว่างที่สุด',
    thBody: 'แล้วกดค้างเพื่อล็อกแสง',
  },
  {
    en: 'Avoid digital zoom',
    enBody: 'Walk closer instead — digital zoom loses detail fast on phones.',
    th: 'เดินเข้าใกล้แทนการซูม',
    thBody: 'เพราะซูมดิจิทัลทำให้ภาพแตก',
  },
  {
    en: 'Use HDR / Night mode',
    enBody: 'Great for sunrise, sunset and low-light — let the phone hold both shadows and highlights.',
    th: 'ใช้โหมด HDR หรือ Night mode',
    thBody: 'ตอนแสงน้อยหรือย้อนแสง',
  },
  {
    en: 'Use leading lines',
    enBody: 'Trails, railings and shorelines pull the eye into the frame — stand so one runs toward your subject.',
    th: 'ใช้เส้นนำสายตา',
    thBody: 'เช่น ทางเดินหรือแนวชายฝั่ง',
  },
  {
    en: 'Try a low or high angle',
    enBody: 'Crouch down or shoot from above — most people only ever shoot from eye level.',
    th: 'ลองมุมต่ำหรือมุมสูง',
    thBody: 'ไม่ใช่แค่ระดับสายตา',
  },
] as const

export const MOBILE_PORTRAIT_TIPS = [
  {
    en: 'Use Portrait mode',
    enBody: "Blurs the background so your friend or the scenery behind them isn't distracting.",
    th: 'ใช้โหมดถ่ายภาพบุคคล',
    thBody: 'เพื่อเบลอฉากหลัง',
  },
  {
    en: 'Shoot in golden hour, avoid harsh noon sun',
    enBody: 'Soft warm light is far more flattering than midday shadows under the eyes.',
    th: 'ถ่ายช่วงแสงทอง',
    thBody: 'หลีกเลี่ยงแดดจ้าตอนเที่ยง',
  },
  {
    en: 'Ask for a subtle turn + chin down',
    enBody: 'Same principle as the posing guide — works just as well from a phone.',
    th: 'ให้หันตัวเล็กน้อยและก้มคางนิดๆ',
    thBody: 'หลักเดียวกับคู่มือโพสท่า',
  },
  {
    en: "Frame naturally, don't center everything",
    enBody: 'Place your subject off-centre using the grid for a more natural, editorial look.',
    th: 'อย่าวางแบบไว้กลางเฟรมเสมอไป',
    thBody: 'ใช้กริดช่วยจัดองค์ประกอบ',
  },
  {
    en: 'Wipe the lens first',
    enBody: 'Pockets and bags leave smudges that soften every shot — a quick wipe fixes it instantly.',
    th: 'เช็ดเลนส์ก่อนถ่ายทุกครั้ง',
    thBody: 'กันภาพเบลอจากรอยนิ้วมือ',
  },
  {
    en: 'Use burst mode for movement',
    enBody: 'Hold the shutter for walking, laughing or hair-in-the-wind shots, then pick the best frame.',
    th: 'ใช้โหมดถ่ายต่อเนื่อง',
    thBody: 'สำหรับช็อตที่มีการเคลื่อนไหว',
  },
] as const
