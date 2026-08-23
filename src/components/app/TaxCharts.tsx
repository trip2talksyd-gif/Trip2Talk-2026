import { formatAud } from '../../lib/toursApi'

const DONUT_FILLS = [
  'fill-teal-500',
  'fill-coral',
  'fill-teal-700',
  'fill-amber',
  'fill-teal-800',
  'fill-cream-muted',
  'fill-orange-deep',
  'fill-teal-900',
]
const DONUT_DOTS = [
  'bg-teal-500',
  'bg-coral',
  'bg-teal-700',
  'bg-amber',
  'bg-teal-800',
  'bg-cream-muted',
  'bg-orange-deep',
  'bg-teal-900',
]

export function BarLine({
  months,
}: {
  months: { label: string; income: number; expense: number }[]
}) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]))
  return (
    <svg viewBox="0 0 644 200" className="w-full" role="img" aria-label="Income vs expense by month">
      {months.map((m, i) => {
        const x = 20 + i * 52
        const ih = (m.income / max) * 160
        const eh = (m.expense / max) * 160
        return (
          <g key={`${m.label}-${i}`}>
            <rect x={x} y={180 - ih} width={16} height={ih} className="fill-teal-500" />
            <rect x={x + 18} y={180 - eh} width={16} height={eh} className="fill-coral" />
            <text x={x + 17} y={196} textAnchor="middle" className="fill-cream-muted" fontSize="9">
              {m.label}
            </text>
          </g>
        )
      })}
      <polyline
        fill="none"
        className="stroke-teal-400"
        strokeWidth="1.5"
        points={months
          .map((m, i) => `${28 + i * 52},${180 - (m.income / max) * 160}`)
          .join(' ')}
      />
    </svg>
  )
}

export function Donut({ parts }: { parts: { label: string; value: number }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  let acc = 0
  const arcs = parts.map((p, i) => {
    const start = acc / total
    acc += p.value
    const end = acc / total
    const a0 = start * Math.PI * 2 - Math.PI / 2
    const a1 = end * Math.PI * 2 - Math.PI / 2
    const large = end - start > 0.5 ? 1 : 0
    const r = 70
    const x0 = 90 + r * Math.cos(a0)
    const y0 = 90 + r * Math.sin(a0)
    const x1 = 90 + r * Math.cos(a1)
    const y1 = 90 + r * Math.sin(a1)
    return {
      d: `M90,90 L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`,
      colorClass: DONUT_FILLS[i % DONUT_FILLS.length],
      dotClass: DONUT_DOTS[i % DONUT_DOTS.length],
      label: p.label,
      value: p.value,
    }
  })
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0" role="img" aria-label="Expense by category">
        {arcs.map((a) => (
          <path key={a.label} d={a.d} className={a.colorClass} />
        ))}
      </svg>
      <ul className="w-full space-y-1 text-[11px] text-cream-muted">
        {arcs.map((a) => (
          <li key={a.label} className="flex items-center justify-between gap-2">
            <span>
              <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${a.dotClass}`} />
              {a.label}
            </span>
            <span className="text-cream">{formatAud(a.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
