const PREFIX = 'trip2talk_waiver_'

export type WaiverSession = {
  tripCode: string
  signedName: string
  signedAt: string
  clauses: string[]
}

export function setWaiverSigned(tripCode: string, payload: WaiverSession): void {
  sessionStorage.setItem(`${PREFIX}${tripCode}`, JSON.stringify(payload))
}

export function isWaiverSigned(tripCode: string): boolean {
  return sessionStorage.getItem(`${PREFIX}${tripCode}`) !== null
}

export function getWaiverSession(tripCode: string): WaiverSession | null {
  const raw = sessionStorage.getItem(`${PREFIX}${tripCode}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WaiverSession
  } catch {
    return null
  }
}

export function clearWaiverSession(tripCode: string): void {
  sessionStorage.removeItem(`${PREFIX}${tripCode}`)
}
