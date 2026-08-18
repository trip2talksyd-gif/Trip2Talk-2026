import { useEffect, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Heart, Star } from 'lucide-react'
import SpotMedia from './SpotMedia'
import { useLang } from '../../hooks/useLang'
import { badgeForSpot, type PhotoSpotDetail } from '../../lib/photoSpotsApi'

const FAV_KEY = 't2t_spot_favorites'

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeFavorites(ids: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...ids]))
}

function lightConditionLabel(spot: PhotoSpotDetail): string {
  const best = spot.best_time?.trim()
  if (best) {
    const night = /night|dark|aurora|moon|blue\s*hour|after\s*dark/i.test(best)
    return `${night ? '🌙' : '☀️'} ${best}`
  }
  const cat = badgeForSpot(spot)
  if (/night|aurora/i.test(cat)) return `🌙 ${cat}`
  if (/sunrise|sunset|golden/i.test(cat)) return `☀️ ${cat}`
  return cat
}

type Props = {
  spot: PhotoSpotDetail
  /** `fill` = grid/list. `carousel` = horizontal strip (Featured / 101 Frames). */
  variant?: 'fill' | 'carousel'
}

export default function SpotListCard({ spot, variant = 'fill' }: Props) {
  const { lang, tt } = useLang()
  const [fav, setFav] = useState(false)
  const category = badgeForSpot(spot)
  const title = lang === 'th' ? spot.title_th : spot.title_en
  const location = lang === 'th' ? spot.location_th : spot.location_en
  const favAdd = tt('discover.favorite')
  const favRemove = tt('discover.unfavorite')
  const rating = Number(spot.rating)
  const showRating = Number.isFinite(rating) && rating > 0
  const light = lightConditionLabel(spot)

  useEffect(() => {
    const set = readFavorites()
    setFav(set.has(spot.id) || set.has(spot.slug))
  }, [spot.id, spot.slug])

  const toggleFav = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !fav
    setFav(next)
    const ids = readFavorites()
    if (next) {
      ids.add(spot.id)
      ids.add(spot.slug)
    } else {
      ids.delete(spot.id)
      ids.delete(spot.slug)
    }
    writeFavorites(ids)
  }

  const wrapClass =
    variant === 'carousel'
      ? 'relative h-[158px] w-[min(82vw,300px)] shrink-0 snap-start overflow-hidden rounded-[20px] bg-teal-darker shadow-[0_10px_24px_rgba(18,47,42,0.1)] sm:h-[168px] sm:w-[280px]'
      : 'relative h-[158px] overflow-hidden rounded-[20px] bg-teal-darker shadow-[0_10px_24px_rgba(18,47,42,0.1)] sm:h-[180px] lg:h-[200px]'

  return (
    <article className={wrapClass}>
      <Link
        to={`/spots/${spot.slug}`}
        className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        aria-label={`${spot.title_en} / ${spot.title_th}`}
      >
        <SpotMedia
          spot={spot}
          variant="wide"
          className="absolute inset-0 h-full w-full"
          iconSize="lg"
          alt=""
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(12,33,29,0.9), rgba(12,33,29,0.15) 60%, transparent)',
          }}
          aria-hidden
        />

        <span className="absolute left-3 top-3 z-[1] inline-flex max-w-[75%] items-center gap-1 truncate rounded-full bg-[rgba(255,255,255,0.92)] px-2.5 py-1 text-[9.5px] font-bold text-teal-darker">
          {showRating ? (
            <>
              <Star className="h-3 w-3 shrink-0 fill-orange text-orange" aria-hidden />
              <span>{rating.toFixed(1)}</span>
              <span className="text-teal-darker/35" aria-hidden>
                ·
              </span>
            </>
          ) : (
            <Star className="h-3 w-3 shrink-0 text-orange" aria-hidden />
          )}
          <span className="truncate">{light}</span>
        </span>

        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-2 p-3.5">
          <div className="min-w-0 flex-1 pr-1">
            <p
              lang={lang === 'th' ? 'th' : 'en'}
              className={`truncate text-[14.5px] font-bold leading-snug text-white ${
                lang === 'th' ? 'font-serif' : 'font-display'
              }`}
            >
              {title}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/70">{location}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {spot.drive_time_from_sydney ? (
                <span className="rounded-full border border-[rgba(230,147,90,0.55)] bg-[rgba(230,147,90,0.35)] px-2 py-0.5 text-[9.5px] font-semibold text-orange-soft backdrop-blur-[8px]">
                  {spot.drive_time_from_sydney}
                </span>
              ) : null}
              <span className="rounded-full border border-white/20 bg-white/[0.14] px-2 py-0.5 text-[9.5px] font-semibold text-white/90 backdrop-blur-[8px]">
                {category}
              </span>
            </div>
          </div>

          <span
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-orange text-teal-darker shadow-[0_6px_14px_rgba(230,147,90,0.45)]"
            aria-hidden
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={toggleFav}
        className="absolute right-3 top-3 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/25 bg-white/25 text-white backdrop-blur-[8px] transition hover:bg-white/40"
        aria-label={fav ? favRemove.en : favAdd.en}
        aria-pressed={fav}
      >
        <Heart className={`h-3.5 w-3.5 ${fav ? 'fill-orange text-orange' : ''}`} strokeWidth={1.9} />
      </button>
    </article>
  )
}
