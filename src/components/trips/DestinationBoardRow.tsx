import { ChevronDown } from 'lucide-react'
import FlipText from '../ui/FlipText'
import SplitFlapPrice from '../ui/SplitFlapPrice'
import { useLang } from '../../hooks/useLang'

type Props = {
  label: string
  tripCount: number
  fromPrice: number
  coverSrc: string
  open: boolean
  onToggle: () => void
}

/**
 * Airport departure-board style destination row —
 * split-flap destination + amber price tiles on hover.
 */
export default function DestinationBoardRow({
  label,
  tripCount,
  fromPrice,
  coverSrc,
  open,
  onToggle,
}: Props) {
  const { lang } = useLang()
  const code = label
    .replace(/[^A-Za-zก-๙0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'T2T'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flight-board group flip-cta flex w-full items-center gap-3 px-3 py-2.5 text-left"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0d1b2e] font-mono text-[10px] font-bold text-[#ffce6b]">
            {code}
          </div>
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flight-board-tag hidden font-mono text-[8px] font-extrabold tracking-[0.14em] text-[#ffce6b]/sm:inline">
            DEST
          </span>
          <p className="truncate font-serif text-[15px] font-semibold text-ink group-hover:font-mono group-hover:tracking-wide group-hover:text-[#ffce6b]">
            <FlipText text={label} />
          </p>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-ink-soft">
          <span className="font-mono text-[9px] uppercase tracking-wider text-teal-700 group-hover:text-[#ffce6b]/80">
            {lang === 'th'
              ? `${tripCount} ทริป`
              : `${tripCount} FLT${tripCount === 1 ? '' : 'S'}`}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-baseline gap-1">
            <span className="text-[9px] uppercase tracking-wide">
              {lang === 'th' ? 'เริ่ม' : 'FROM'}
            </span>
            <SplitFlapPrice
              amountAud={fromPrice}
              board
              className="text-[11px] font-extrabold leading-none"
            />
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded bg-[#0d1b2e] px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-[#ffce6b] opacity-0 transition-opacity group-hover:opacity-100">
          {open ? 'OPEN' : 'GATE'}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-teal-700 transition-transform group-hover:text-[#ffce6b] ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2.25}
        />
      </div>
    </button>
  )
}
