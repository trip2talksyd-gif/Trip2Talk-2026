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

export default function FavoritesPage() {
  const { lang, t } = useLang()
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

  const emptySlides = useMemo(() => {
    const album = galleryByIds(['nz-001', 'tas-002', 'syd-009', 'nsw-010', 'tas-003', 'nz-013'])
    return album.map((photo) => ({
      photo,
      sceneEn: 'Inspiration',
      sceneTh: 'แรงบันดาลใจ',
      titleEn: 'Example album from Saen & team',
      titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
      meta: photo.id,
    }))
  }, [])

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="font-serif text-2xl text-ink">{t('nav.favorites')}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t('favorites.subtitle')}</p>
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
            <p className="mt-3 text-sm text-ink-soft">{t('favorites.empty')}</p>
            <Link to="/trips" className="btn-embossed mt-5 !text-[11px]">
              {t('nav.trips')}
            </Link>
          </div>
          <section>
            <p className="mb-2 text-sm font-bold text-ink">
              {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
            </p>
            <PhotoSlideshow slides={emptySlides} />
          </section>
          {suggestTours.length > 0 && (
            <TripFilmstrip
              tours={suggestTours}
              labelEn="You might also like"
              labelTh="ทริปที่คุณอาจสนใจ"
            />
          )}
        </div>
      )}

      {!loading && !error && favoriteCodes.length > 0 && favoriteTours.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">{t('favorites.stale')}</p>
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
                  {t('favorites.remove')}
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
            {lang === 'th'
              ? `บันทึกไว้ ${favoriteTours.length} ทริป`
              : `${favoriteTours.length} saved trips`}
          </p>
          {suggestTours.length > 0 && (
            <TripFilmstrip
              tours={suggestTours}
              labelEn="You might also like"
              labelTh="ทริปที่คุณอาจสนใจ"
              className="mt-2"
            />
          )}
        </>
      )}
    </div>
  )
}
