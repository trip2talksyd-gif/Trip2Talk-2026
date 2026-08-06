/**
 * Free-tier notification channel for Trip2Talk.
 * No paid ESP (Resend/SendGrid) — builds Messenger + Gmail deep links that staff
 * (or the customer, for review links) can open. Cron enqueues rows; staff
 * dashboard shows the outbound queue.
 */

export const SITE_ORIGIN = 'https://trip2talk.com.au'
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/TriptoTalk'
export const FACEBOOK_MESSENGER_URL = 'https://m.me/TriptoTalk'
export const STAFF_GMAIL = 'trip2talksyd@gmail.com'

export type OutboundKind =
  | 'trip_reminder_7d'
  | 'trip_reminder_1d'
  | 'review_request'
  | 'waitlist_spot'

export type NotifyDraft = {
  kind: OutboundKind
  subject: string
  bodyEn: string
  bodyTh: string
  deepLink: string
  messengerUrl: string
  gmailUrl: string
}

function gmailCompose(to: string | null | undefined, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    authuser: STAFF_GMAIL,
    su: subject,
    body,
  })
  if (to?.trim()) params.set('to', to.trim())
  return `https://mail.google.com/mail/?${params.toString()}`
}

export function tripPrepUrl(tripCode: string): string {
  return `${SITE_ORIGIN}/trips/${encodeURIComponent(tripCode)}/prep`
}

export function reviewPageUrl(): string {
  return `${SITE_ORIGIN}/review`
}

/** Days-before trip reminder (7d or 1d). */
export function buildTripReminder(opts: {
  kind: 'trip_reminder_7d' | 'trip_reminder_1d'
  customerName: string
  customerEmail?: string | null
  tripCode: string
  tripName: string
  departureDate: string
}): NotifyDraft {
  const days = opts.kind === 'trip_reminder_7d' ? 7 : 1
  const prep = tripPrepUrl(opts.tripCode)
  const subject =
    days === 7
      ? `Trip2Talk — 7 days until ${opts.tripName}`
      : `Trip2Talk — tomorrow: ${opts.tripName}`
  const bodyEn = [
    `Hi ${opts.customerName},`,
    '',
    days === 7
      ? `Your Trip2Talk trip (${opts.tripName}) is in 7 days (${opts.departureDate}).`
      : `Reminder: your Trip2Talk trip (${opts.tripName}) is tomorrow (${opts.departureDate})!`,
    '',
    `Please open your Trip Prep checklist: ${prep}`,
    '',
    'See you soon — Trip2Talk team',
  ].join('\n')
  const bodyTh = [
    `สวัสดีคุณ ${opts.customerName}`,
    '',
    days === 7
      ? `ทริป ${opts.tripName} เหลืออีก 7 วัน (${opts.departureDate})`
      : `เตือน: ทริป ${opts.tripName} พรุ่งนี้แล้ว (${opts.departureDate})!`,
    '',
    `เช็กลิสต์เตรียมตัว: ${prep}`,
    '',
    'พบกัน — ทีม Trip2Talk',
  ].join('\n')

  return {
    kind: opts.kind,
    subject,
    bodyEn,
    bodyTh,
    deepLink: prep,
    messengerUrl: FACEBOOK_MESSENGER_URL,
    gmailUrl: gmailCompose(opts.customerEmail, subject, `${bodyEn}\n\n---\n${bodyTh}`),
  }
}

/** Post-trip review request — Facebook Page is the live review channel. */
export function buildReviewRequest(opts: {
  customerName: string
  customerEmail?: string | null
  tripCode: string
  tripName: string
}): NotifyDraft {
  const review = reviewPageUrl()
  const subject = `How was ${opts.tripName}? — Trip2Talk`
  const bodyEn = [
    `Hi ${opts.customerName},`,
    '',
    `Thanks for joining ${opts.tripName} with Trip2Talk!`,
    'Your photos should be ready — if you loved the trip, a short review on Facebook helps other Thai students find us.',
    '',
    `Leave a review: ${FACEBOOK_PAGE_URL}`,
    `Or open: ${review}`,
    '',
    'Thank you — Trip2Talk team',
  ].join('\n')
  const bodyTh = [
    `สวัสดีคุณ ${opts.customerName}`,
    '',
    `ขอบคุณที่ไปทริป ${opts.tripName} กับ Trip2Talk!`,
    'ถ้าชอบทริป รบกวนรีวิวสั้นๆ บน Facebook ด้วยนะครับ จะช่วยให้นักเรียนคนอื่นเจอเรา',
    '',
    `รีวิว: ${FACEBOOK_PAGE_URL}`,
    `หรือเปิด: ${review}`,
    '',
    'ขอบคุณ — ทีม Trip2Talk',
  ].join('\n')

  return {
    kind: 'review_request',
    subject,
    bodyEn,
    bodyTh,
    deepLink: review,
    messengerUrl: FACEBOOK_MESSENGER_URL,
    gmailUrl: gmailCompose(opts.customerEmail, subject, `${bodyEn}\n\n---\n${bodyTh}`),
  }
}

export function buildWaitlistSpot(opts: {
  customerName: string
  customerEmail?: string | null
  tripCode: string
}): NotifyDraft {
  const tripUrl = `${SITE_ORIGIN}/trips/${encodeURIComponent(opts.tripCode)}`
  const subject = `A seat opened — ${opts.tripCode} — Trip2Talk`
  const bodyEn = [
    `Hi ${opts.customerName},`,
    '',
    `Good news — a seat opened on ${opts.tripCode}.`,
    `Book soon before it fills again: ${tripUrl}`,
    '',
    'Trip2Talk team',
  ].join('\n')
  const bodyTh = [
    `สวัสดีคุณ ${opts.customerName}`,
    '',
    `มีที่ว่างในทริป ${opts.tripCode} แล้วครับ`,
    `จองด่วนก่อนเต็มอีก: ${tripUrl}`,
    '',
    'ทีม Trip2Talk',
  ].join('\n')

  return {
    kind: 'waitlist_spot',
    subject,
    bodyEn,
    bodyTh,
    deepLink: tripUrl,
    messengerUrl: FACEBOOK_MESSENGER_URL,
    gmailUrl: gmailCompose(opts.customerEmail, subject, `${bodyEn}\n\n---\n${bodyTh}`),
  }
}

/** Staff-assisted waiver proof — copy/paste into Messenger (or open Gmail). Not an outbound-queue kind. */
export type WaiverConfirmDraft = {
  subject: string
  bodyEn: string
  bodyTh: string
  /** EN + TH block ready for clipboard paste into Messenger */
  clipboardText: string
  messengerUrl: string
  gmailUrl: string
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/**
 * Bilingual confirmation that a waiver was completed (including staff-filled disclosure).
 * Matches free-tier outbound: staff copy text → paste in Messenger / open Gmail compose.
 */
export function buildWaiverStaffConfirmation(opts: {
  customerName: string
  tripCode: string
  tripName?: string | null
  /** Trip travel / departure date (ISO), distinct from form-fill timestamp. */
  departureDate?: string | null
  signedAt: string
  filledByStaffName?: string | null
  clauseTitlesEn: string[]
  clauseTitlesTh: string[]
  authorizationNote?: string | null
  customerEmail?: string | null
}): WaiverConfirmDraft {
  const when = formatWhen(opts.signedAt)
  const tripLabel = opts.tripName?.trim()
    ? `${opts.tripName.trim()} (${opts.tripCode})`
    : opts.tripCode
  const departureLabel = formatDepartureDate(opts.departureDate)
  const staff = opts.filledByStaffName?.trim() || 'Trip2Talk staff'
  const clausesEn =
    opts.clauseTitlesEn.length > 0
      ? opts.clauseTitlesEn.map((t) => `• ${t}`).join('\n')
      : '• (see Trip2Talk waiver terms)'
  const clausesTh =
    opts.clauseTitlesTh.length > 0
      ? opts.clauseTitlesTh.map((t) => `• ${t}`).join('\n')
      : '• (ดูข้อตกลง waiver ของ Trip2Talk)'

  const subject = `Waiver confirmation — ${opts.tripCode} — Trip2Talk`

  const bodyEn = [
    `Hi ${opts.customerName},`,
    '',
    'This confirms your Trip2Talk liability waiver was completed.',
    '',
    `Trip: ${tripLabel}`,
    ...(departureLabel ? [`Trip dates: ${departureLabel}`] : []),
    `Signed name: ${opts.customerName}`,
    `Completed at: ${when}`,
    `Filled by staff (on your request): ${staff}`,
    '',
    'Agreed terms:',
    clausesEn,
    ...(opts.authorizationNote?.trim()
      ? ['', `Staff note on file: ${opts.authorizationNote.trim()}`]
      : []),
    '',
    'Keep this message as your confirmation. If anything looks wrong, reply on Messenger.',
    '',
    'Trip2Talk team',
  ].join('\n')

  const bodyTh = [
    `สวัสดีคุณ ${opts.customerName}`,
    '',
    'ยืนยันว่า waiver (เอกสารยินยอม/สละสิทธิ์) ของคุณกับ Trip2Talk เสร็จแล้วครับ',
    '',
    `ทริป: ${tripLabel}`,
    ...(departureLabel ? [`วันเดินทาง: ${departureLabel}`] : []),
    `ชื่อที่ลงนาม: ${opts.customerName}`,
    `เวลาที่กรอก: ${when}`,
    `กรอกโดยเจ้าหน้าที่ (ตามที่คุณขอ): ${staff}`,
    '',
    'ข้อตกลงที่ยอมรับ:',
    clausesTh,
    ...(opts.authorizationNote?.trim()
      ? ['', `บันทึกของเจ้าหน้าที่: ${opts.authorizationNote.trim()}`]
      : []),
    '',
    'เก็บข้อความนี้ไว้เป็นหลักฐาน หากมีส่วนใดไม่ถูกต้อง ทัก Messenger กลับมาได้เลย',
    '',
    'ทีม Trip2Talk',
  ].join('\n')

  const clipboardText = `${bodyEn}\n\n---\n${bodyTh}`

  return {
    subject,
    bodyEn,
    bodyTh,
    clipboardText,
    messengerUrl: FACEBOOK_MESSENGER_URL,
    gmailUrl: gmailCompose(opts.customerEmail, subject, clipboardText),
  }
}

function formatDepartureDate(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null
  try {
    return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}
