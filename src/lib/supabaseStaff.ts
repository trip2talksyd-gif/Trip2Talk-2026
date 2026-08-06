const STAFF_ID_KEY = 'staff_id'
const STAFF_TOKEN_KEY = 'staff_token'

/** token is the opaque session token minted by the verify-pin Edge Function
 * (staff_sessions.token) — this is what staff-api validates on every request. */
export function setStaffSession(token: string, role: string, fullName: string): void {
  sessionStorage.setItem(STAFF_ID_KEY, token)
  sessionStorage.setItem('staff_role', role)
  sessionStorage.setItem('staff_name', fullName)
  sessionStorage.setItem(STAFF_TOKEN_KEY, token)
}

export function clearStaffSession(): void {
  sessionStorage.removeItem(STAFF_ID_KEY)
  sessionStorage.removeItem(STAFF_TOKEN_KEY)
  sessionStorage.removeItem('staff_role')
  sessionStorage.removeItem('staff_name')
}

export function getStaffId(): string | null {
  return sessionStorage.getItem(STAFF_ID_KEY)
}

export function hasStaffSession(): boolean {
  return sessionStorage.getItem(STAFF_ID_KEY) !== null
}

export class StaffSessionExpiredError extends Error {
  constructor() {
    super('Staff session expired')
    this.name = 'StaffSessionExpiredError'
  }
}

/** Non-2xx staff-api response with parsed JSON body (when available). */
export class StaffApiError extends Error {
  readonly status: number
  readonly action: string
  readonly code?: string
  readonly detail?: string
  readonly hint?: string

  constructor(
    action: string,
    status: number,
    body: { error?: string; detail?: string; hint?: string; message?: string } | null,
  ) {
    const code = body?.error
    const detail = body?.detail || body?.message
    const hint = body?.hint || undefined
    const msg =
      detail?.trim() ||
      (code ? `staff-api "${action}" failed: ${code}` : `staff-api "${action}" failed: ${status}`)
    super(msg)
    this.name = 'StaffApiError'
    this.status = status
    this.action = action
    this.code = code
    this.detail = detail
    this.hint = hint
  }
}

/**
 * Calls the staff-api Edge Function with the current session token.
 * Staff-only reads/writes that are not yet on direct authenticated PostgREST
 * go through here. See supabase/functions/staff-api/index.ts.
 */
export async function callStaffApi<T = unknown>(
  action: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const token = sessionStorage.getItem(STAFF_TOKEN_KEY)
  if (!token) throw new StaffSessionExpiredError()

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-api`
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ token, action, params }),
  })

  if (res.status === 401) {
    clearStaffSession()
    throw new StaffSessionExpiredError()
  }

  type ApiBody = {
    data?: T
    error?: string
    detail?: string
    hint?: string
    message?: string
  }
  let body: ApiBody | null = null
  try {
    body = (await res.json()) as ApiBody
  } catch {
    body = null
  }

  if (!res.ok) {
    throw new StaffApiError(action, res.status, body)
  }

  return (body?.data ?? body) as T
}
