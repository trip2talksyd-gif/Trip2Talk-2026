import { createPortal } from 'react-dom'
import { Play } from 'lucide-react'

type Props = {
  visible: boolean
  x: number
  y: number
  imageSrc: string
  alt: string
  hasVideo?: boolean
}

export default function TripCardPreviewBubble({ visible, x, y, imageSrc, alt, hasVideo }: Props) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed z-[100] transition-[opacity,transform] duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.95})`,
      }}
    >
      <div className="relative h-[92px] w-[92px] overflow-hidden rounded-full bg-near-black-green shadow-[0_8px_24px_rgba(19,32,26,0.35)] ring-2 ring-gold/40">
        <img src={imageSrc} alt={alt} className="h-full w-full object-cover" draggable={false} />
        {hasVideo && (
          <span className="absolute inset-0 flex items-center justify-center bg-near-black-green/25">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/90 text-gold-dark shadow-sm">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>
          </span>
        )}
      </div>
    </div>,
    document.body,
  )
}
