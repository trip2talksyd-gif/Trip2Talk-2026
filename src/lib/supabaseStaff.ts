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
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ token, action, params }),
  })

  if (res.status === 401) {
    clearStaffSession()
    throw new StaffSessionExpiredError()
  }
  if (!res.ok) throw new Error(`staff-api "${action}" failed: ${res.status}`)

  const body = await res.json()
  return (body.data ?? body) as T
}
