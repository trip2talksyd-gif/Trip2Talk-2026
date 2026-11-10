import { User } from 'lucide-react'

type Props = {
  maxSeats: number
  bookedSeats: number
  className?: string
}

/** Filled coral = taken, teal = still open. Caps the row at 8 icons. */
export default function SeatPeople({ maxSeats, bookedSeats, className = 'h-6 w-6' }: Props) {
  const count = Math.min(Math.max(maxSeats, 0), 8)
  return (
    <div className="flex items-end gap-0.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const taken = i < bookedSeats
        return (
          <User
            key={i}
            className={`${className} ${taken ? 'fill-coral text-coral' : 'fill-teal-700 text-teal-700'}`}
            strokeWidth={1.75}
          />
        )
      })}
    </div>
  )
}
