/**
 * Dated departure clones use suffixes (e.g. ULU-4D3N-SEP, ULU-4D3N-SEP26_29).
 * CMS keys are template codes (ULU-4D3N). Resolve the longest matching template.
 */
export function resolveTemplateTripCode(
  tripCode: string,
  knownKeys: readonly string[],
): string | null {
  const code = tripCode.trim().toUpperCase()
  if (!code) return null

  const keySet = new Set(knownKeys.map((k) => k.toUpperCase()))
  if (keySet.has(code)) return code

  const byPrefix = knownKeys
    .map((k) => k.toUpperCase())
    .filter((k) => code === k || code.startsWith(`${k}-`))
    .sort((a, b) => b.length - a.length)

  if (byPrefix.length > 0) return byPrefix[0]

  // Progressive strip of trailing segments (SEP / SEP26_29 / JUL / …)
  const parts = code.split('-').filter(Boolean)
  while (parts.length > 1) {
    parts.pop()
    const candidate = parts.join('-')
    if (keySet.has(candidate)) return candidate
  }

  return null
}
