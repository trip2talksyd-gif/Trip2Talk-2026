import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useFavoriteTripCodes, useRemoveFavorite } from '../../hooks/useFavorites'
import { fetchAllTours } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import TripCard from '../../components/trips/TripCard'
import TripFilmstrip from '../../components/trips/TripFilmstrip'
import PhotoSlideshow, { galleryByIds } from '../../components/photoGuide/PhotoSlideshow'
import { TripCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import BiText from '../../components/ui/BiText'

export default function FavoritesPage() {
  const { tt, t } = useLang()
  const favoriteCodes = useFavoriteTripCodes()
  const removeFavorite = useRemoveFavorite()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchAllTours()
      .then(setTours)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const favoriteTours = useMemo(() => {
    const set = new Set(favoriteCodes.map((c) => c.toUpperCase()))
    return tours.filter((tour) => set.has(tour.trip_code.toUpperCase()))
  }, [tours, favoriteCodes])

  const suggestTours = useMemo(() => {
    const set = new Set(favoriteCodes.map((c) => c.toUpperCase()))
    return tours.filter((tour) => !set.has(tour.trip_code.toUpperCase())).slice(0, 8)
  }, [tours, favoriteCodes])

  const albumBi = tt('gallery.exampleAlbum')

  const emptySlides = useMemo(() => {
    const photos = galleryByIds(['nz-001', 'tas-002', 'syd-009', 'nsw-010', 'tas-003', 'nz-013'])
    const album = tt('gallery.exampleAlbum')
    const inspiration = tt('gallery.inspiration')
    return photos.map((photo) => ({
      photo,
      sceneEn: inspiration.en,
      sceneTh: inspiration.th,
      titleEn: album.en,
      titleTh: album.th,
      meta: photo.id,
    }))
  }, [tt])

  const titleBi = tt('nav.favorites')
  const savedBi = tt('favorites.saved')
  const savedTripsLabelBi = tt('favorites.savedTripsLabel')
  const emptyBi = tt('favorites.empty')
  const staleBi = tt('favorites.stale')
  const removeBi = tt('favorites.remove')
  const tripsBi = tt('nav.trips')
  const suggestedBi = tt('trips.suggested')

  return (
    <div className="space-y-4 pb-4">
      <header className="-mx-4 flex items-start justify-between gap-3 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <BiText
          as="h1"
          en={titleBi.en}
          th={titleBi.th}
          serif
          className="text-[17px] text-ink sm:text-2xl"
          thClassName="mt-px block font-thai text-[11px] font-medium text-ink-soft sm:text-[13px]"
        />
        {favoriteCodes.length > 0 && (
          <span className="mt-1 shrink-0 rounded-full bg-mint-100 px-3 py-[5px] text-right text-[10px] font-bold text-teal-700">
            {favoriteCodes.length} {savedBi.en}
            <span className="mt-0.5 block font-thai text-[9px] font-medium opacity-80">
              {savedBi.th} {favoriteCodes.length}
            </span>
          </span>
        )}
      </header>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && <PageError message={error} onRetry={load} />}

      {!loading && !error && favoriteCodes.length === 0 && (
        <div className="space-y-5">
          <div className="flex flex-col items-center rounded-2xl border border-line bg-mint-100 px-6 py-10 text-center">
            <Heart className="h-8 w-8 text-teal-600" strokeWidth={1.75} />
            <p className="mt-3 text-sm text-ink-soft">
              {emptyBi.en}
              <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">
                {emptyBi.th}
              </span>
            </p>
            <Link to="/trips" className="btn-embossed mt-5 !text-[11px]">
              {tripsBi.en}
              <span className="mt-0.5 block font-thai text-[9px] font-medium opacity-85">
                {tripsBi.th}
              </span>
            </Link>
          </div>
          <section>
            <p className="mb-2 text-sm font-bold text-ink">
              {albumBi.en}
              <span className="ml-1.5 font-thai text-xs font-medium text-ink-soft">
                {albumBi.th}
              </span>
            </p>
            <PhotoSlideshow slides={emptySlides} />
          </section>
          {suggestTours.length > 0 && (
            <TripFilmstrip tours={suggestTours} labelEn={suggestedBi.en} labelTh={suggestedBi.th} />
          )}
        </div>
      )}

      {!loading && !error && favoriteCodes.length > 0 && favoriteTours.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            {staleBi.en}
            <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">{staleBi.th}</span>
          </p>
          <ul className="space-y-2">
            {favoriteCodes.map((code) => (
              <li
                key={code}
                className="flex items-center justify-between rounded-xl border border-line bg-cream px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{code}</span>
                <button
                  type="button"
                  onClick={() => removeFavorite(code)}
                  className="text-xs uppercase tracking-wider text-coral"
                >
                  {removeBi.en}
                  <span className="ml-1 font-thai normal-case opacity-85">{removeBi.th}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && favoriteTours.length > 0 && (
        <>
          <div className="space-y-4">
            {favoriteTours.map((tour) => (
              <TripCard key={tour.id} tour={tour} />
            ))}
          </div>
          <p className="text-center text-[10.5px] text-ink-soft">
            {favoriteTours.length} {savedTripsLabelBi.en}
            <span className="mt-0.5 block font-thai text-[9.5px] text-ink-soft/85">
              {savedBi.th} {favoriteTours.length} {savedTripsLabelBi.th}
            </span>
          </p>
          {suggestTours.length > 0 && (
            <TripFilmstrip
              tours={suggestTours}
              labelEn={suggestedBi.en}
              labelTh={suggestedBi.th}
              className="mt-2"
            />
          )}
        </>
      )}
    </div>
  )
}
