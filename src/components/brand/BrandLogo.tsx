import { BRAND_BADGE_PNG_SRC, BRAND_BADGE_SRC, BRAND_NAME } from '../../data/brand'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_PX: Record<Size, number> = {
  sm: 32,
  md: 36,
  lg: 48,
  xl: 64,
}

type Props = {
  /** Visual size of the circular badge */
  size?: Size
  /**
   * `dark` = staff / teal shells — light ring so the black badge doesn’t vanish.
   * `light` = cream public pages — soft shadow only.
   * `auto` = ring that works on both (subtle white ring + soft shadow).
   */
  tone?: 'light' | 'dark' | 'auto'
  /** Show “Trip2Talk” wordmark beside the badge (nav-friendly). */
  withWordmark?: boolean
  wordmarkClassName?: string
  className?: string
  /** Decorative when paired with visible text nearby; otherwise keep default alt. */
  decorative?: boolean
}

/**
 * Official circular Trip2Talk badge + optional wordmark.
 * Prefer the wordmark at nav sizes — ring text inside the badge is not legible at ~32–40px.
 */
export default function BrandLogo({
  size = 'md',
  tone = 'auto',
  withWordmark = false,
  wordmarkClassName = '',
  className = '',
  decorative = false,
}: Props) {
  const px = SIZE_PX[size]
  const ring =
    tone === 'dark'
      ? 'ring-2 ring-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_14px_-4px_rgba(0,0,0,0.55)]'
      : tone === 'light'
        ? 'ring-1 ring-black/10 shadow-sm'
        : 'ring-2 ring-white/70 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.35)]'

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <picture>
        <source srcSet={BRAND_BADGE_SRC} type="image/webp" />
        <img
          src={BRAND_BADGE_PNG_SRC}
          alt={decorative ? '' : BRAND_NAME}
          width={px}
          height={px}
          decoding="async"
          className={`shrink-0 rounded-full bg-black object-cover ${ring}`}
          style={{ width: px, height: px }}
        />
      </picture>
      {withWordmark && (
        <span className={`truncate font-thai font-bold leading-none ${wordmarkClassName}`}>
          {BRAND_NAME}
        </span>
      )}
    </span>
  )
}
