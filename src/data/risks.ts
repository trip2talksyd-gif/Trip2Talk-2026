export const JETSTAR_RESTRICTIONS = {
  en: {
    title: 'Jetstar carry-on rules',
    items: [
      'Power banks must be carried in cabin baggage only — never in checked luggage',
      'Liquids in carry-on limited to 100ml per container (standard aviation security)',
      'Oversized tripods may need to be checked — contact Trip2Talk before departure',
    ],
  },
  th: {
    title: 'ข้อห้าม Jetstar',
    items: [
      'Power bank ต้องถือขึ้นเครื่องเท่านั้น — ห้ามใส่กระเป๋าเช็คอิน',
      'ของเหลวในสัมภาระถือขึ้นเครื่อง ไม่เกิน 100ml ต่อชิ้น',
      'ขาตั้งกล้องขนาดใหญ่อาจต้องเช็คอิน — แจ้ง Trip2Talk ก่อนเดินทาง',
    ],
  },
}

export const BAGGAGE_INFO = {
  en: {
    title: 'Baggage allowance',
    checked: 'Checked baggage: 20kg',
    carryOn: 'Carry-on: 7kg',
    airline: 'All Trip2Talk flights operate on Jetstar',
  },
  th: {
    title: 'น้ำหนักสัมภาระ',
    checked: 'โหลด 20kg',
    carryOn: 'ถือขึ้น 7kg',
    airline: 'เที่ยวบินทุกทริปใช้ Jetstar',
  },
}

export const CANCELLATION_POLICY = {
  en: {
    title: 'Cancellation & Refund Policy',
    intro:
      'Trip2Talk operates on PayID (AUD) with deposit-first booking. All amounts are in Australian dollars.',
    rules: [
      {
        condition: 'Cancel 10+ days before departure',
        outcome: 'Rebook or hold credit for the next available trip',
      },
      {
        condition: 'Cancel 3–9 days before departure',
        outcome: 'Transfer booking to another traveller only — no cash refund',
      },
      {
        condition: 'Cancel 0–2 days before departure',
        outcome: 'No refund. Deposit and full payment forfeited.',
      },
      {
        condition: 'Weather / Force Majeure',
        outcome: 'Full rebook credit issued. No cash refund.',
      },
      {
        condition: 'Minimum group not met',
        outcome: 'Trip may be rescheduled or credit issued — Trip2Talk will notify you via SMS/email',
      },
    ],
  },
  th: {
    title: 'นโยบายการยกเลิกและคืนเงิน',
    intro:
      'Trip2Talk รับชำระผ่าน PayID (AUD) โดยมัดจำก่อนเดินทาง ราคาทั้งหมดเป็นดอลลาร์ออสเตรเลีย',
    rules: [
      {
        condition: 'ยกเลิกล่วงหน้า 10 วันขึ้นไป',
        outcome: 'เลื่อนทริปหรือเก็บเครดิตสำหรับทริปถัดไป',
      },
      {
        condition: 'ยกเลิกล่วงหน้า 3–9 วัน',
        outcome: 'โอนสิทธิ์ให้ผู้อื่นเดินทางแทนเท่านั้น — ไม่คืนเงินสด',
      },
      {
        condition: 'ยกเลิกล่วงหน้า 0–2 วัน',
        outcome: 'ไม่คืนเงินทุกกรณี รวมมัดจำ',
      },
      {
        condition: 'สภาพอากาศ / เหตุสุดวิสัย',
        outcome: 'ออกเครดิตเต็มจำนวนสำหรับจองทริปครั้งถัดไป ไม่คืนเป็นเงินสด',
      },
      {
        condition: 'จำนวนผู้ร่วมทริปไม่ถึงขั้นต่ำ',
        outcome: 'อาจเลื่อนทริปหรือออกเครดิต — Trip2Talk จะแจ้งทาง SMS/อีเมล',
      },
    ],
  },
}

export const AURORA_DISCLAIMER = {
  en: 'Aurora Australis (Southern Lights) sightings are a natural phenomenon and cannot be guaranteed. Trip2Talk selects optimal locations and timing based on KP index forecasts, but weather, cloud cover, and solar activity are beyond our control. No refunds will be issued due to aurora not appearing.',
  th: 'แสงออโรร่า (แสงใต้) เป็นปรากฏการณ์ธรรมชาติที่ไม่สามารถรับประกันได้ Trip2Talk เลือกสถานที่และเวลาที่ดีที่สุดตามการพยากรณ์ KP index แต่สภาพอากาศและกิจกรรมสุริยะอยู่นอกเหนือการควบคุมของเรา จะไม่มีการคืนเงินในกรณีที่ไม่เห็นแสงออโรร่า',
}

export const SAFETY_WARNINGS: Record<string, { en: string[]; th: string[] }> = {
  'BER-3D2N': {
    en: [
      'Watch for rogue waves at Horse Head Rock — never turn your back to the ocean',
      'Low tide access only to Horse Head Rock — tides can cut off the path',
      'Wear proper rock shoes — no thongs/sandals on coastal rocks',
    ],
    th: [
      'ระวังคลื่นใหญ่ที่ Horse Head Rock — ห้ามหันหลังให้ทะเล',
      'เข้าถึง Horse Head Rock ได้เฉพาะน้ำลง — น้ำขึ้นอาจตัดทางกลับ',
      'ใส่รองเท้าปีนเขาที่เหมาะสม — ห้ามใส่แตะบนหินริมชายฝั่ง',
    ],
  },
  'ULU-4D3N': {
    en: [
      'Desert temperatures drop below 0°C at night — thermal layers mandatory',
      'No mobile signal in many areas — offline maps required',
      'Stay on marked paths at all times in National Park',
    ],
    th: [
      'อุณหภูมิทะเลทรายต่ำกว่า 0°C ตอนกลางคืน — ต้องมีชั้นกันหนาว',
      'หลายพื้นที่ไม่มีสัญญาณมือถือ — ต้องมีแผนที่ออฟไลน์',
      'เดินเฉพาะเส้นทางที่กำหนดในอุทยานเท่านั้น',
    ],
  },
  'TAS-3D2N': {
    en: [
      'Mt Wellington summit temperatures -4°C in winter — prepare lens fog/frost protection',
      'Strong wind gusts at The Pinnacle — secure tripods and equipment',
    ],
    th: [
      'ยอด Mt Wellington อุณหภูมิ -4°C ในฤดูหนาว — ป้องกันฝ้ากล้อง/น้ำค้างแข็ง',
      'ลมแรงที่ The Pinnacle — ยึดขาตั้งและอุปกรณ์ให้แน่น',
    ],
  },
  'NZ-6D5N': {
    en: [
      'NZ driving is left-hand side — extra caution on mountain roads',
      'Milford Sound weather changes rapidly — waterproof gear mandatory',
    ],
    th: [
      'นิวซีแลนด์ขับรถฝั่งซ้าย — ระวังเป็นพิเศษบนถนนภูเขา',
      'สภาพอากาศ Milford Sound เปลี่ยนเร็ว — ต้องมีอุปกรณ์กันน้ำ',
    ],
  },
}

export const MIN_PAX_RULES: Record<string, number> = {
  'NZ-6D5N': 3,
  'TAS-3D2N': 3,
  'TAS-LH-4D3N': 3,
  'TAS-SU-4D3N': 3,
  'ULU-4D3N': 3,
  'MEL-4D3N': 3,
  'BER-3D2N': 2,
  'CAN-2D1N': 2,
  'KIA-1DAY': 2,
  'PSP-1DAY': 2,
  'LAV-ANB-1D': 2,
  'SYD-MW-WIN': 2,
  'SYD-1DAY': 1,
}

export const WAIVER_CLAUSES = {
  en: [
    {
      id: 'liability',
      title: 'Liability Release',
      text: 'I release Trip2Talk, its guides, and partners from liability for injury, loss, or damage except where caused by negligence under Australian law.',
    },
    {
      id: 'oshc',
      title: 'OSHC Acknowledgment (Student Visa Holders)',
      text: 'I confirm I hold valid Overseas Student Health Cover (OSHC) for the duration of this trip, or I am not on a student visa.',
    },
    {
      id: 'medical',
      title: 'Medical Emergency Authorization',
      text: 'I authorize Trip2Talk staff to seek emergency medical treatment on my behalf if I am unable to consent.',
    },
    {
      id: 'photo',
      title: 'Photo & Video Consent',
      text: 'I consent to Trip2Talk using photos/videos from this trip for marketing unless I opt out in writing before departure.',
    },
    {
      id: 'aurora',
      title: 'Force Majeure & Aurora Disclaimer',
      text: AURORA_DISCLAIMER.en,
    },
  ],
  th: [
    {
      id: 'liability',
      title: 'การสละสิทธิ์ความรับผิด',
      text: 'ข้าพเจ้าสละสิทธิเรียกร้องความรับผิดของ Trip2Talk และไกด์ ยกเว้นกรณีประมาทตามกฎหมายออสเตรเลีย',
    },
    {
      id: 'oshc',
      title: 'ยืนยัน OSHC (ผู้ถือวีซ่านักเรียน)',
      text: 'ข้าพเจ้ายืนยันว่ามี OSHC ครอบคลุมช่วงทริป หรือไม่ได้อยู่ในประเภทวีซ่านักเรียน',
    },
    {
      id: 'medical',
      title: 'อนุญาตการรักษาฉุกเฉิน',
      text: 'ข้าพเจ้าอนุญาตให้เจ้าหน้าที่ Trip2Talk ประสานการรักษาฉุกเฉินในกรณีที่ข้าพเจ้าไม่สามารถให้ความยินยอมได้',
    },
    {
      id: 'photo',
      title: 'ยินยอมใช้ภาพและวิดีโอ',
      text: 'ข้าพเจ้ายินยอมให้ Trip2Talk ใช้ภาพ/วิดีโอจากทริปเพื่อการตลาด เว้นแต่แจ้ง opt-out เป็นลายลักษณ์อักษรก่อนเดินทาง',
    },
    {
      id: 'aurora',
      title: 'เหตุสุดวิสัย & ข้อจำกัดแสงออโรร่า',
      text: AURORA_DISCLAIMER.th,
    },
  ],
}

export const PAYID_NOTICE = {
  en: 'PayID payments are processed in AUD. Upload your bank transfer slip after payment — booking confirms once deposit is verified (usually within 24 hours).',
  th: 'ชำระ PayID เป็นดอลลาร์ออสเตรเลีย อัปโหลดสลิปหลังโอน — ยืนยันการจองเมื่อตรวจสอบมัดจำแล้ว (ภายใน 24 ชม.)',
}
