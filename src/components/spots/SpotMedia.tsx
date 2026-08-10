import {
  Camera,
  ImageIcon,
  Moon,
  Mountain,
  Sparkles,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { badgeForSpot } from '../../lib/photoSpotsApi'

type SpotLike = Pick<PhotoSpotDetail, 'categories' | 'title_en' | 'title_th'> & {
  heroSrc?: string | null
  thumbSrc?: string | null
}

type CategoryVisual = {
  Icon: LucideIcon
  gradient: string
  iconClass: string
}

function visualForSpot(spot: SpotLike): CategoryVisual {
  const cats = spot.categories.map((c) => c.toLowerCase())
  if (cats.includes('aurora') || cats.includes('milky way')) {
    return {
      Icon: Sparkles,
      gradient: 'from-[#1a2a4a] via-[#2d3f66] to-[#c4784a]',
      iconClass: 'text-orange-soft/90',
    }
  }
  if (cats.includes('night')) {
    return {
      Icon: Moon,
      gradient: 'from-[#12202e] via-[#1a3344] to-[#2a4a5c]',
      iconClass: 'text-cream/85',
    }
  }
  if (cats.includes('coastal') || cats.includes('sunrise') || cats.includes('sunset')) {
    return {
      Icon: Waves,
      gradient: 'from-[#1a3d48] via-[#2a6a6e] to-[#e6935a]',
      iconClass: 'text-cream',
    }
  }
  if (cats.includes('portrait')) {
    return {
      Icon: Camera,
      gradient: 'from-[#20363c] via-[#2f5258] to-[#4a7a72]',
      iconClass: 'text-cream',
    }
  }
  if (cats.includes('landscape') || cats.includes('nature')) {
    return {
      Icon: Mountain,
      gradient: 'from-[#122f2a] via-[#1e4a40] to-[#3d6b5c]',
      iconClass: 'text-cream',
    }
  }
  return {
    Icon: ImageIcon,
    gradient: 'from-[#122f2a] via-[#20363c] to-[#3a5550]',
    iconClass: 'text-cream/90',
  }
}

/** Photo or branded category placeholder (no blank grey boxes while uploads are pending). */
export default function SpotMedia({
  spot,
  className = '',
  iconSize = 'md',
  showBadge = false,
  alt,
}: {
  spot: SpotLike
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
  alt?: string
}) {
  const src = spot.thumbSrc ?? spot.heroSrc
  const { Icon, gradient, iconClass } = visualForSpot(spot)
  const iconCls =
    iconSize === 'sm' ? 'h-6 w-6' : iconSize === 'lg' ? 'h-10 w-10' : 'h-8 w-8'

  return (
    <div className={`relative overflow-hidden bg-teal-soft ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt ?? `${spot.title_en} / ${spot.title_th}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br ${gradient}`}
          aria-hidden
        >
          <Icon className={`${iconCls} ${iconClass}`} strokeWidth={1.75} />
          <span className="px-2 text-center text-[9px] font-semibold uppercase tracking-wider text-cream/55">
            Photo soon
          </span>
        </div>
      )}
      {showBadge ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-soft">
          {badgeForSpot(spot)}
        </span>
      ) : null}
    </div>
  )
}
