import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Star } from 'lucide-react'
import BiText from '../ui/BiText'
import SpotMedia from './SpotMedia'
import AutoplayClip, { isCompressedWebMp4 } from './AutoplayClip'
import { useLang } from '../../hooks/useLang'
import { tripCtaHref, type PhotoSpotDetail } from '../../lib/photoSpotsApi'
import { storageImageSrc, STORAGE_IMG } from '../../lib/storageImage'

function stripMedia(spot: PhotoSpotDetail): { kind: 'image' | 'video'; url: string }[] {
  const out: { kind: 'image' | 'video'; url: string }[] = []
  const video = spot.video_url?.trim()
  if (video && isCompressedWebMp4(video)) {
    out.push({ kind: 'video', url: video })
  }
  for (const url of spot.gallery_image_urls ?? []) {
    const u = url.trim()
    if (!u) continue
    if (/\.mp4(\?|#|$)/i.test(u)) continue
    out.push({ kind: 'image', url: u })
    if (out.length >= 3) break
  }
  return out.slice(0, 3)
}

export default function SpotFeedCard({ spot }: { spot: PhotoSpotDetail }) {
  const { tt } = useLang()
  const thumbs = stripMedia(spot)
  const href = `/spots/${spot.slug}`
  const ctaHref = tripCtaHref(spot)
  const hasTrip = Boolean(spot.related_trip_code ?? spot.linked_trip_code)
  const tripCta = tt('discover.feedCta.trip')
  const allTripsCta = tt('discover.feedCta.allTrips')
  const rating = Number(spot.rating)
  const showRating = Number.isFinite(rating) && rating > 0
  const webVideo = spot.video_url && isCompressedWebMp4(spot.video_url) ? spot.video_url : null
  const heroVideo = !spot.heroSrc && webVideo ? webVideo : null

  return (
    <article className="overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_10px_28px_rgba(18,47,42,0.08)]">
      <Link to={href} className="relative block">
        <div className="relative h-[190px] overflow-hidden bg-mint-100">
          {heroVideo ? (
            <AutoplayClip src={heroVideo} className="h-full w-full object-cover" poster={spot.heroSrc ?? undefined} />
          ) : (
            <SpotMedia spot={spot} variant="wide" className="h-full w-full" />
          )}
          {showRating ? (
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden />
              {rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </Link>

      {thumbs.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 bg-line">
          {thumbs.map((item, i) => (
            <div key={`${item.kind}-${i}`} className="relative h-[64px] overflow-hidden bg-mint-100">
              {item.kind === 'video' ? (
                <AutoplayClip src={item.url} className="h-full w-full object-cover" />
              ) : (
                <img
                  src={storageImageSrc(item.url, STORAGE_IMG.thumb) || item.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-3.5 pb-3 pt-3">
        <Link to={href} className="block">
          <BiText
            as="h2"
            en={spot.title_en}
            th={spot.title_th}
            className="text-[16px] font-bold leading-snug text-ink"
            thClassName="mt-0.5 font-thai text-[12px] font-medium text-ink-soft"
          />
          <BiText
            as="p"
            en={spot.location_en}
            th={spot.location_th}
            className="mt-1 text-[12px] text-ink-soft"
            thClassName="font-thai text-[11px] text-ink-soft/80"
          />
        </Link>
        {spot.categories.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {spot.categories.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          to={ctaHref}
          className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-mint-100/90 px-3 py-2.5"
        >
          <span className="min-w-0">
            {hasTrip ? (
              <BiText
                as="span"
                en={tripCta.en}
                th={tripCta.th}
                className="block text-[13px] font-bold text-teal-900"
                thClassName="mt-0.5 block font-thai text-[11px] text-teal-800/70"
              />
            ) : (
              <BiText
                as="span"
                en={allTripsCta.en}
                th={allTripsCta.th}
                className="block text-[13px] font-bold text-teal-900"
                thClassName="mt-0.5 block font-thai text-[11px] text-teal-800/70"
              />
            )}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-teal-800" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

/** Dense list row for Discover feed items after the first 6 large cards. */
export function SpotCompactRow({ spot }: { spot: PhotoSpotDetail }) {
  const href = `/spots/${spot.slug}`
  const rating = Number(spot.rating)
  const showRating = Number.isFinite(rating) && rating > 0

  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-[16px] border border-line bg-card px-2.5 py-2 shadow-[0_4px_14px_rgba(18,47,42,0.05)]"
    >
      <SpotMedia
        spot={spot}
        variant="thumb"
        iconSize="sm"
        className="h-[72px] w-[72px] shrink-0 rounded-[12px]"
      />
      <div className="min-w-0 flex-1">
        <BiText
          as="h2"
          en={spot.title_en}
          th={spot.title_th}
          className="truncate text-[14px] font-bold leading-snug text-ink"
          thClassName="mt-0.5 block truncate font-thai text-[11px] font-medium text-ink-soft"
        />
        <BiText
          as="p"
          en={spot.location_en}
          th={spot.location_th}
          className="mt-0.5 truncate text-[11px] text-ink-soft"
          thClassName="truncate font-thai text-[10px] text-ink-soft/80"
        />
      </div>
      {showRating ? (
        <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-ink">
          <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden />
          {rating.toFixed(1)}
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
    </Link>
  )
}
