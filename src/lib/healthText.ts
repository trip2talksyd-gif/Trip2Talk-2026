/** Answers guests type instead of leaving a health field blank. */
const NONE_ANSWERS = new Set([
  '-',
  '--',
  '.',
  'no',
  'none',
  'nil',
  'nope',
  'n/a',
  'na',
  'nothing',
  'no allergies',
  'ไม่มี',
  'ไม่',
  'ไม่มีค่ะ',
  'ไม่มีครับ',
  'ไม่แพ้',
  'ไม่แพ้อะไร',
])

/** True when a free-text health/diet answer actually says something. */
export function hasHealthInfo(value: string | null | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase().replace(/[.!\s]+$/u, '')
  return v.length > 0 && !NONE_ANSWERS.has(v)
}
