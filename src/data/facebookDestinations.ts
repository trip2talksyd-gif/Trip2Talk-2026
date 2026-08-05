/**
 * content_posts.target_account — where the approved post goes.
 * No personal-profile option (handled manually outside this system).
 */

export type ContentTargetAccount =
  | 'trip2talk_page'
  | 'chapter99_page'
  | 'group_thaiaus'

/** Public Page IDs (tokens stay in Edge secrets / .env.local only). */
export const FACEBOOK_PAGE_IDS = {
  trip2talk: '1709809203470988',
  chapter99: '873602775846209',
  /** Optional admin page — not a content_posts target_account */
  thaiAusAdmin: '1087507664455546',
} as const

export const CONTENT_TARGET_ACCOUNTS: {
  id: ContentTargetAccount
  label: string
  mode: 'graph' | 'manual'
  pageId?: string
  openUrl: string
}[] = [
  {
    id: 'trip2talk_page',
    label: 'Trip2Talk Page',
    mode: 'graph',
    pageId: FACEBOOK_PAGE_IDS.trip2talk,
    openUrl: `https://www.facebook.com/${FACEBOOK_PAGE_IDS.trip2talk}`,
  },
  {
    id: 'chapter99_page',
    label: 'Chapter99 Page',
    mode: 'graph',
    pageId: FACEBOOK_PAGE_IDS.chapter99,
    openUrl: `https://www.facebook.com/${FACEBOOK_PAGE_IDS.chapter99}`,
  },
  {
    id: 'group_thaiaus',
    label: 'Thai-Aus Group',
    mode: 'manual',
    openUrl: 'https://facebook.com/groups/1631889741218502',
  },
]

export const THAI_AUS_FACEBOOK_GROUP_ID = '1631889741218502'
export const THAI_AUS_FACEBOOK_GROUP_URL =
  'https://facebook.com/groups/1631889741218502'

export function isManualTargetAccount(
  account: string | null | undefined,
): boolean {
  return account === 'group_thaiaus'
}

export function targetAccountOpenUrl(
  account: string | null | undefined,
  groupId?: string | null,
): string {
  if (account === 'group_thaiaus') {
    const id = (groupId || THAI_AUS_FACEBOOK_GROUP_ID).trim()
    return `https://facebook.com/groups/${id}`
  }
  if (account === 'trip2talk_page') {
    return `https://www.facebook.com/${FACEBOOK_PAGE_IDS.trip2talk}`
  }
  if (account === 'chapter99_page') {
    return `https://www.facebook.com/${FACEBOOK_PAGE_IDS.chapter99}`
  }
  return 'https://www.facebook.com'
}

export function targetAccountLabel(account: string | null | undefined): string {
  return CONTENT_TARGET_ACCOUNTS.find((a) => a.id === account)?.label ?? String(account || '—')
}
