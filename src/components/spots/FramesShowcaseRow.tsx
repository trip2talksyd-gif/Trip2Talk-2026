import type { PhotoSpotDetail } from '../../lib/photoSpotsApi'
import SpotListCard from './SpotListCard'

const PREVIEW_MAX = 6

type Props = {
  spots: PhotoSpotDetail[]
}

export default function FramesShowcaseRow({ spots }: Props) {
  const preview = spots.slice(0, PREVIEW_MAX)
  if (preview.length === 0) return null

  return (
    <div
      data-frames-showcase
      className="hide-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-5 pr-8 sm:-mx-6 sm:px-6 sm:pr-10 lg:mx-0 lg:overflow-x-auto lg:px-0 lg:pr-4"
    >
      {preview.map((spot) => (
        <SpotListCard key={spot.id} spot={spot} variant="carousel" />
      ))}
    </div>
  )
}

export function sortFramesCollection(spots: PhotoSpotDetail[]): PhotoSpotDetail[] {
  return spots
    .filter((s) => s.collection_101_frames === true)
    .sort((a, b) => {
      const ra = a.collection_rank ?? 9999
      const rb = b.collection_rank ?? 9999
      if (ra !== rb) return ra - rb
      return a.title_en.localeCompare(b.title_en)
    })
}
