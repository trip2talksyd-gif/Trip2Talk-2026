import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { photoSrc } from '../../data/galleryPhotos'
import type { GalleryAlbum } from '../../data/galleryAlbums'

type Props = {
  albums: GalleryAlbum[]
  /** Fired when the active album changes (e.g. sync filter tabs). */
  onAlbumChange?: (album: GalleryAlbum) => void
  /** When true, clicking the center card also selects that album filter. */
  onSelectAlbum?: (album: GalleryAlbum) => void
}

const AUTOPLAY_MS = 5000
const SWIPE_PX = 48

function wrapIndex(i: number, len: number): number {
  if (len <= 0) return 0
  return ((i % len) + len) % len
}

function relativeOffset(i: number, active: number, len: number): number {
  let d = i - active
  if (d > len / 2) d -= len
  if (d < -len / 2) d += len
  return d
}

export default function GalleryAlbumCarousel({
  albums,
  onAlbumChange,
  onSelectAlbum,
}: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const onAlbumChangeRef = useRef(onAlbumChange)
  onAlbumChangeRef.current = onAlbumChange

  const len = albums.length
  const current = albums[active]

  const go = useCallback(
    (next: number) => {
      if (len <= 1) return
      setActive(wrapIndex(next, len))
    },
    [len],
  )

  const goPrev = useCallback(() => go(active - 1), [active, go])
  const goNext = useCallback(() => go(active + 1), [active, go])

  useEffect(() => {
    if (!current) return
    onAlbumChangeRef.current?.(current)
  }, [current])

  useEffect(() => {
    if (len <= 1 || paused) return
    const id = window.setInterval(() => {
      setActive((i) => wrapIndex(i + 1, len))
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [len, paused])

  if (len === 0 || !current) return null

  const bgUrl = photoSrc(current.hero)

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
    touchDeltaX.current = 0
    setPaused(true)
  }

  function onTouchMove(e: TouchEvent) {
    if (touchStartX.current == null) return
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current
  }

  function onTouchEnd() {
    const dx = touchDeltaX.current
    touchStartX.current = null
    touchDeltaX.current = 0
    if (Math.abs(dx) >= SWIPE_PX) {
      if (dx < 0) goNext()
      else goPrev()
    }
    window.setTimeout(() => setPaused(false), 1200)
  }

  return (
    <section
      className="relative -mx-4 overflow-hidden sm:-mx-6 lg:mx-0 lg:rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Trip photo albums"
    >
      {/* Frosted / blurred ambient background from active photo */}
      <div className="absolute inset-0" aria-hidden>
        <img
          src={bgUrl}
          alt=""
          className="h-full w-full scale-110 object-cover blur-2xl brightness-75 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/75 via-teal-900/55 to-teal-900/85" />
      </div>

      <div className="relative px-3 pb-5 pt-5 sm:px-5 sm:pb-6 sm:pt-6">
        <div className="relative mx-auto h-[min(62vw,420px)] max-w-5xl sm:h-[380px] md:h-[420px]">
          {albums.map((album, i) => {
            const offset = relativeOffset(i, active, len)
            const abs = Math.abs(offset)
            const isCenter = offset === 0
            // Mobile: only center. Desktop: peek ±1 (and faint ±2).
            const visibilityClass = isCenter
              ? 'block'
              : abs <= 2
                ? 'hidden md:block'
                : 'hidden'

            return (
              <article
                key={album.id}
                className={`absolute left-1/2 top-0 h-full w-[min(88vw,520px)] -translate-x-1/2 transition-[transform,opacity,filter] duration-500 ease-out ${visibilityClass}`}
                style={{
                  zIndex: 20 - abs,
                  transform: `translateX(calc(-50% + ${offset * 58}%)) scale(${
                    isCenter ? 1 : abs === 1 ? 0.86 : 0.76
                  })`,
                  opacity: isCenter ? 1 : abs === 1 ? 0.55 : 0.28,
                  filter: isCenter ? 'none' : 'brightness(0.7)',
                  pointerEvents: isCenter ? 'auto' : 'none',
                }}
                aria-hidden={!isCenter}
              >
                <button
                  type="button"
                  disabled={!isCenter}
                  onClick={() => {
                    if (isCenter) onSelectAlbum?.(album)
                  }}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl border border-white/15 text-left shadow-[0_24px_48px_-20px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <img
                    src={photoSrc(album.hero)}
                    alt={`${album.nameEn} — ${album.taglineEn}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(22,38,43,0.15) 0%, rgba(22,38,43,0.2) 40%, rgba(13,27,46,0.88) 100%)',
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold/95 sm:text-[11px]">
                      {album.placeEn}
                      <span className="mt-0.5 block font-thai text-[10px] font-medium normal-case tracking-normal text-cream/75 sm:inline sm:ml-2 sm:mt-0">
                        {album.placeTh}
                      </span>
                    </p>
                    <h2 className="mt-1 font-serif text-[22px] leading-tight text-cream sm:text-[28px]">
                      {album.nameEn}
                      <span className="mt-0.5 block font-thai text-[14px] font-medium text-cream/85 sm:mt-1 sm:text-[16px]">
                        {album.nameTh}
                      </span>
                    </h2>
                    <p className="mt-1.5 max-w-[28rem] text-[12px] leading-snug text-cream/90 sm:text-[13.5px]">
                      {album.taglineEn}
                      <span className="mt-0.5 block font-thai text-[11px] text-cream/75 sm:text-[12px]">
                        {album.taglineTh}
                      </span>
                    </p>
                    <p className="mt-2 text-[10px] font-medium text-cream/55">
                      {album.photoCount} photos
                      <span className="ml-1 font-thai">รูป</span>
                    </p>
                  </div>
                </button>
              </article>
            )
          })}

          {len > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous album"
                className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-teal-900/70 text-cream backdrop-blur-sm transition hover:border-gold/50 hover:bg-teal-800 sm:left-1 sm:h-11 sm:w-11"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next album"
                className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-teal-900/70 text-cream backdrop-blur-sm transition hover:border-gold/50 hover:bg-teal-800 sm:right-1 sm:h-11 sm:w-11"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {len > 1 && (
          <div className="relative z-20 mt-4 flex justify-center gap-2" role="tablist" aria-label="Album slides">
            {albums.map((album, i) => (
              <button
                key={album.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={album.nameEn}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-6 bg-gold'
                    : 'w-2 bg-cream/35 hover:bg-cream/55'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
