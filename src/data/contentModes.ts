/**
 * Facebook content-mode rules for Trip2Talk drafts (Make.com + Content Review).
 * Core vocabulary (all modes): "ทริป" not "ทัวร์"; "Trip Leader" not "ไกด์".
 */

import type { ContentPostType } from '../types/tour'

export type { ContentPostType }

export type ContentModeRule = {
  postType: ContentPostType
  labelEn: string
  labelTh: string
  /** Short reminder shown on the review card */
  reviewHints: string[]
  /** Phrases that must never appear in this mode (case-insensitive substring checks) */
  bannedPhrases: string[]
}

export const CORE_CONTENT_VOCAB = {
  prefer: { trip: 'ทริป', tripLeader: 'Trip Leader' },
  avoid: { tour: 'ทัวร์', guide: 'ไกด์' },
} as const

/** Page-growth content — no trip attached, no booking CTA. */
export const VALUE_CONTENT_MODE: ContentModeRule = {
  postType: 'value_content',
  labelEn: 'Value content',
  labelTh: 'คอนเทนต์เล่าเรื่อง',
  reviewHints: [
    'No booking CTA — never seats, dates, or จองที่นั่ง',
    'Tone: เพื่อนช่างภาพเล่าเรื่อง (not sales copy)',
    'Angles: เกร็ดถ่ายภาพ (setting/มุม/แสง), เบื้องหลังทริป, เรื่องเล่าสถานที่/โมเมนต์',
    'End with a soft engagement question (คอมเมนต์), not a CTA',
    'Use ทริป / Trip Leader — never ทัวร์ / ไกด์',
  ],
  bannedPhrases: [
    'จองที่นั่ง',
    'จองเลย',
    'ที่นั่งเหลือ',
    'seats left',
    'book now',
    'ทัวร์',
    'ไกด์',
  ],
}

/** Trip-attached promo (default when trip_id is set). */
export const TRIP_PROMO_MODE: ContentModeRule = {
  postType: 'trip_promo',
  labelEn: 'Trip promo',
  labelTh: 'โปรโมททริป',
  reviewHints: [
    'Trip name, date, and seats are OK',
    'Use ทริป / Trip Leader — never ทัวร์ / ไกด์',
  ],
  bannedPhrases: ['ทัวร์', 'ไกด์'],
}

const MODES: Record<ContentPostType, ContentModeRule> = {
  value_content: VALUE_CONTENT_MODE,
  trip_promo: TRIP_PROMO_MODE,
}

export function getContentMode(postType: string | null | undefined): ContentModeRule {
  if (postType === 'value_content') return VALUE_CONTENT_MODE
  return TRIP_PROMO_MODE
}

export function isValueContent(postType: string | null | undefined): boolean {
  return postType === 'value_content'
}

/** Returns banned phrases found in caption (for soft review warnings). */
export function findBannedPhrases(
  caption: string,
  postType: string | null | undefined,
): string[] {
  const mode = getContentMode(postType)
  const lower = caption.toLowerCase()
  return mode.bannedPhrases.filter((p) => lower.includes(p.toLowerCase()))
}

export function contentModeLabel(postType: string | null | undefined): string {
  const mode = getContentMode(postType)
  return `${mode.labelEn} · ${mode.labelTh}`
}

export { MODES as CONTENT_MODES }
