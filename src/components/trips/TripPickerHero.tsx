import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import type { Tour } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import {
  tourDestinationLabel,
  tourDurationLabel,
} from '../../lib/tourDisplay'
import { formatAud, isListedPriceHidden, seatsRemaining } from '../../lib/toursApi'
import { getPreviewPhotoForTrip, photoThumbSrc } from '../../data/galleryPhotos'
import { storageImageSrc, STORAGE_IMG } from '../../lib/storageImage'
import BiDisplayHeading from '../ui/BiDisplayHeading'
import BiText from '../ui/BiText'
import TripCoverImage from './TripCoverImage'

type Props = {
  tours: Tour[]
}

const LOW_SEATS_MAX = 3

function tripBgSrc(tour: Tour): string {
  const preview = getPreviewPhotoForTrip(tour.trip_code)
  if (preview) {
    return photoThumbSrc(preview, { width: 1200, quality: 70, format: 'webp' })
  }
  return storageImageSrc(tour.cover_image_url, STORAGE_IMG.hero)
}

function tripThumbSrc(tour: Tour): string {
  const preview = getPreviewPhotoForTrip(tour.trip_code)
  if (preview) {
    return photoThumbSrc(preview, { width: 160, quality: 68, format: 'webp' })
  }
  return storageImageSrc(tour.cover_image_url, STORAGE_IMG.thumb)
}

/**
 * Full-bleed trip picker: stacked WebP backgrounds, avatar row, price-led meta,
 * Book Now → `/trips/:tripCode`. Manual selection only.
 */
export default function TripPickerHero({ tours }: Props) {
  const { tt } = useLang()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeCodeRef = useRef<string | null>(null)
  const pickerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (tours.length === 0) {
      setActiveIndex(0)
      return
    }
    const keep = activeCodeRef.current
    const idx = keep ? tours.findIndex((t) => t.trip_code === keep) : -1
    setActiveIndex(idx >= 0 ? idx : 0)
  }, [tours])

  useEffect(() => {
    const tour = tours[activeIndex]
    if (tour) activeCodeRef.current = tour.trip_code
  }, [tours, activeIndex])

  function scrollHeroIntoView() {
    const el = pickerRef.current
    if (!el) return
    const scroller = el.closest('[data-app-scroll]')
    if (scroller instanceof HTMLElement) {
      const top =
        el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function selectTrip(i: number, scrollToHero = false) {
    setActiveIndex(i)
    if (scrollToHero) scrollHeroIntoView()
  }

  if (tours.length === 0) return null

  const active = tours[Math.min(activeIndex, tours.length - 1)]!
  const seats = seatsRemaining(active)
  const priceHidden = isListedPriceHidden(active)
  const showScarcity = !priceHidden && seats > 0 && seats <= LOW_SEATS_MAX
  const fromBi = tt('common.fromPrice')
  const seatsLeft = tt('trips.seatsLeft')
  const bookBi = tt('btn.bookNow')
  const viewBi = tt('btn.viewTrip')
  const priceTba = tt('trips.priceTba')
  const ctaBi = priceHidden ? viewBi : bookBi
  const destEn = tourDestinationLabel(active.trip_code, 'en')
  const destTh = tourDestinationLabel(active.trip_code, 'th')
  const durationEn = tourDurationLabel(active, 'en')
  const durationTh = tourDurationLabel(active, 'th')

  const listBi = tt('trips.allList')

  return (
    <>
    <section
      ref={pickerRef}
      className="trip-picker relative w-full overflow-hidden rounded-2xl border border-teal-mid/30 bg-teal-darker shadow-spot lg:rounded-3xl"
      style={{ minHeight: 'min(68dvh, 640px)', height: 'calc(100dvh - 17.5rem)' }}
      aria-roledescription="trip picker"
      aria-label={`${active.name_en} / ${active.name_th}`}
    >
      {/* Stacked backgrounds — 700ms crossfade */}
      {tours.map((tour, i) => {
        const src = tripBgSrc(tour)
        const on = i === activeIndex
        return (
          <div
            key={tour.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
              on ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={!on}
          >
            <TripCoverImage
              src={src}
              alt=""
              size="hero"
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        )
      })}

      {/* Teal brand overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-darker/75 via-teal-dark/55 to-teal-darker/90"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-between px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
        {/* Active trip name + meta — remount fade */}
        <div
          key={active.trip_code}
          className="trip-picker-fade max-w-xl pt-1"
        >
          <BiDisplayHeading
            en={active.name_en}
            th={active.name_th}
            as="h2"
            thAs="p"
            enClassName="text-[1.35rem] font-semibold leading-tight tracking-tight text-cream sm:text-2xl lg:text-[1.75rem]"
            thClassName="mt-1 text-[0.95rem] font-medium leading-snug text-cream/85 sm:text-base"
          />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-orange-soft sm:text-xs">
            {destEn}
            <span className="mx-1.5 text-cream/40">·</span>
            {durationEn}
            <span className="mx-1.5 text-cream/40">·</span>
            <span className="font-mono normal-case tracking-normal text-cream/70">
              {active.trip_code}
            </span>
          </p>
          <p className="mt-0.5 font-thai text-[10px] font-medium text-cream/70 sm:text-[11px]">
            {destTh}
            <span className="mx-1 text-cream/35">·</span>
            {durationTh}
          </p>
        </div>

        <div className="mt-auto">
          {/* Avatar / trip thumb row */}
          <div
            className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="listbox"
            aria-label="Trips"
          >
            {tours.map((tour, i) => {
              const on = i === activeIndex
              const thumb = tripThumbSrc(tour)
              return (
                <button
                  key={tour.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  aria-label={`${tour.name_en} / ${tour.name_th}`}
                  onClick={() => selectTrip(i)}
                  className="relative shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                >
                  <span
                    className={`absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-2 rounded-full bg-orange transition-opacity duration-300 motion-reduce:transition-none ${
                      on ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`block h-[52px] w-[52px] overflow-hidden rounded-full border-2 transition-[border-color,box-shadow] duration-300 sm:h-14 sm:w-14 ${
                      on
                        ? 'border-orange shadow-[0_0_0_2px_rgba(230,147,90,0.35)]'
                        : 'border-cream/35'
                    }`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-teal-mid text-[9px] font-bold text-cream">
                        {tour.trip_code.slice(0, 3)}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Meta footer */}
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-cream/20 pt-3">
            <div
              key={`meta-${active.trip_code}`}
              className="trip-picker-fade min-w-0"
            >
              <p className="text-[15px] font-extrabold leading-none text-cream sm:text-base">
                {priceHidden ? (
                  <>
                    <span className="block">{priceTba.en}</span>
                    <span className="mt-0.5 block font-thai text-[10px] font-medium text-cream/65">
                      {priceTba.th}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-cream/70">
                      {fromBi.en}
                    </span>
                    {formatAud(active.price_aud)}
                  </>
                )}
              </p>
              {!priceHidden && (
                <p className="mt-0.5 font-thai text-[10px] font-medium text-cream/65">
                  {fromBi.th} {formatAud(active.price_aud)}
                </p>
              )}
              {showScarcity && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-coral/95 px-2 py-0.5 text-[10px] font-bold text-cream">
                  <Flame className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
                  {seats} {seatsLeft.en}
                  <span className="font-thai font-medium opacity-90">
                    · {seatsLeft.th} {seats}
                  </span>
                </span>
              )}
            </div>

            <Link
              to={`/trips/${active.trip_code}`}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-orange px-4 py-2.5 text-[12px] font-bold text-teal-darker shadow-[0_8px_20px_-10px_rgba(230,147,90,0.85)] transition-colors hover:bg-orange-soft sm:px-5 sm:text-[13px]"
            >
              <span>{ctaBi.en}</span>
              <span className="ml-1.5 font-thai text-[11px] font-semibold opacity-90 sm:text-xs">
                {ctaBi.th}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>

    <div className="mt-5">
      <BiDisplayHeading
        en={listBi.en}
        th={listBi.th}
        as="h2"
        enClassName="font-display text-[15px] font-semibold tracking-tight text-teal-darker"
        thClassName="mt-0.5 font-thai text-[11px] font-medium text-ink-app/55"
      />
      <ul className="mt-3 space-y-2">
        {tours.map((tour, i) => {
          const on = i === activeIndex
          const thumb = tripThumbSrc(tour)
          const destEn = tourDestinationLabel(tour.trip_code, 'en')
          const destTh = tourDestinationLabel(tour.trip_code, 'th')
          const durationEn = tourDurationLabel(tour, 'en')
          const durationTh = tourDurationLabel(tour, 'th')
          return (
            <li key={tour.id}>
              <button
                type="button"
                onClick={() => selectTrip(i, true)}
                aria-current={on ? 'true' : undefined}
                aria-label={`${tour.name_en} / ${tour.name_th}`}
                className={`flex w-full items-center gap-3 rounded-[16px] border bg-card px-2.5 py-2 text-left shadow-[0_4px_14px_rgba(18,47,42,0.05)] ${
                  on ? 'border-orange' : 'border-line'
                }`}
              >
                <span className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-teal-soft">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-teal-dark">
                      {tour.trip_code.slice(0, 3)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <BiText
                    as="span"
                    en={tour.name_en}
                    th={tour.name_th}
                    className="block truncate text-[14px] font-bold leading-snug text-ink"
                    thClassName="mt-0.5 block truncate font-thai text-[11px] font-medium text-ink-soft"
                  />
                  <BiText
                    as="span"
                    en={`${destEn} · ${durationEn}`}
                    th={`${destTh} · ${durationTh}`}
                    className="mt-0.5 block truncate text-[11px] text-ink-soft"
                    thClassName="truncate font-thai text-[10px] text-ink-soft/80"
                  />
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
    </>
  )
}
