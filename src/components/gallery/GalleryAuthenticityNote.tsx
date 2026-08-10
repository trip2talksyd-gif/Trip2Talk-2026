import { useLang } from '../../hooks/useLang'

/** Small EN+TH caption affirming Trip2Talk trip photos — not stock. */
export default function GalleryAuthenticityNote({ className = '' }: { className?: string }) {
  const { tt } = useLang()
  const note = tt('gallery.authenticity')

  return (
    <p
      className={`rounded-full border border-line bg-white/90 px-3 py-1.5 text-[10px] leading-snug text-ink-app/60 shadow-[0_2px_8px_rgba(18,47,42,0.04)] sm:text-[11px] ${className}`}
    >
      {note.en}
      <span className="mt-0.5 block font-thai text-[9.5px] text-ink-app/50 sm:text-[10px]">
        {note.th}
      </span>
    </p>
  )
}
