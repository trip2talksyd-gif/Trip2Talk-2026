import type { Tour } from '../../types/tour'
import { isTourBookable, seatsRemaining } from '../../lib/toursApi'
import { canonicalUrl, SITE_ORIGIN } from './site'
import { tripSeoDescription, tripSeoTitle } from './tripSeo'

const ORG_ID = `${SITE_ORIGIN}/#organization`

export function homeStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Trip2Talk',
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/brand/trip2talk-badge.png`,
        email: 'trip2talksyd@gmail.com',
        telephone: '+61-452-044-382',
        sameAs: [
          'https://www.facebook.com/TriptoTalk',
          'https://www.youtube.com/@trip2talksyd960',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: 'Trip2Talk',
        url: `${SITE_ORIGIN}/`,
        publisher: { '@id': ORG_ID },
        inLanguage: ['en-AU', 'th'],
      },
    ],
  }
}

export function tripStructuredData(tour: Tour, priceHidden: boolean) {
  const path = `/trips/${tour.trip_code}`
  const url = canonicalUrl(path)
  const remaining = seatsRemaining(tour)
  const bookable = isTourBookable(tour) && remaining > 0
  const offer = priceHidden
    ? null
    : {
        '@type': 'Offer',
        price: tour.price_aud,
        priceCurrency: 'AUD',
        url,
        availability: bookable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        ...(tour.departure_date ? { validFrom: tour.departure_date.slice(0, 10) } : {}),
      }

  const trip: Record<string, unknown> = {
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: tripSeoTitle(tour).replace(/ \| Trip2Talk$/, ''),
    description: tripSeoDescription(tour),
    url,
    provider: { '@id': ORG_ID },
    touristType: 'Photography',
  }
  if (offer) trip.offers = offer

  return {
    '@context': 'https://schema.org',
    '@graph': [
      trip,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Trips', item: `${SITE_ORIGIN}/trips` },
          { '@type': 'ListItem', position: 3, name: tour.name_en || tour.trip_code, item: url },
        ],
      },
    ],
  }
}
