/**
 * AU tax year label year = calendar year of 30 Jun end.
 * Jul–Dec → ending next Jun (e.g. Aug 2026 → TY ending Jun 2027).
 * Jan–Jun → ending this Jun (e.g. Mar 2026 → TY ending Jun 2026).
 */
export function currentAuTaxYearEnding(now: Date = new Date()): number {
  const y = now.getFullYear()
  const month = now.getMonth() + 1
  return month >= 7 ? y + 1 : y
}
