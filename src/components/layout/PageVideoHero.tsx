import type { ReactNode } from 'react'
import AutoplayClip, { isCompressedWebMp4 } from '../spots/AutoplayClip'

type Props = {
  src: string
  children: ReactNode
}

/**
 * Full-bleed inner-page video cover (Pricing, Photo Guide).
 * Only `*_web.mp4` — never Storage masters.
 */
export default function PageVideoHero({ src, children }: Props) {
  return (
    <header className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-10">
      <div className="relative h-[200px] bg-teal-900 sm:h-[240px] md:h-[280px]">
        {isCompressedWebMp4(src) ? (
          <AutoplayClip src={src} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,33,29,.28) 0%, rgba(12,33,29,.2) 40%, rgba(12,33,29,.82) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-6 sm:pb-6 lg:px-10">{children}</div>
      </div>
    </header>
  )
}
