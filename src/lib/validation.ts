export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Australian mobile: 04XX XXX XXX — spaces optional */
export function isValidAuMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return /^04\d{8}$/.test(digits)
}

export function normalizeAuMobile(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 10) return value.trim()
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
}

export function getSupabaseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: string }).message)
  }
  return 'Unknown error'
}
