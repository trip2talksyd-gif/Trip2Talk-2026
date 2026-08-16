import { useState } from 'react'
import { Play } from 'lucide-react'

type Props = {
  videoId: string
  title: string
}

/** Click-to-load YouTube embed — no iframe (or autoplay) until the user taps play. */
export default function LazyYouTubeEmbed({ videoId, title }: Props) {
  const [playing, setPlaying] = useState(false)
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[14px] border border-line bg-teal-dark">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 block h-full w-full"
          aria-label={`Play: ${title}`}
        >
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-teal-darker/25" aria-hidden />
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 text-teal-dark shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)]">
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" strokeWidth={0} aria-hidden />
          </span>
        </button>
      )}
    </div>
  )
}
