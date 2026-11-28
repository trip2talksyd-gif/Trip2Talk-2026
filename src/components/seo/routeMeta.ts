export type RouteMeta = {
  title: string
  description: string
  /** When true, crawlers should not index this URL. */
  noindex?: boolean
}

const D =
  'Small-group photo trips in Australia and New Zealand with a professional photographer. Max 6 guests.'

/** Unique title + description for public paths that do not load their own head tags. */
export const STATIC_ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Trip2Talk — Photo Trips with a Real Photographer',
    description:
      'Small-group photo trips around Australia and New Zealand. Max 6 guests, a pro photographer on every trip.',
  },
  '/discover': {
    title: 'Photo Spots in Australia | Trip2Talk',
    description: 'Find photo spots around Australia — locations, light, and how Trip2Talk shoots them.',
  },
  '/spots': {
    title: 'Photo Spot Guides | Trip2Talk',
    description: 'Guides to photo spots Trip2Talk visits, with locations and what to shoot.',
  },
  '/experience': {
    title: 'The Trip2Talk Experience | Trip2Talk',
    description: 'What a Trip2Talk photo trip is like: small groups, a photographer leading, and photos you keep.',
  },
  '/trips': {
    title: 'Open Photo Trips | Trip2Talk',
    description: 'Upcoming small-group photo trips. Dates, prices in AUD, and seats still open.',
  },
  '/calendar': {
    title: 'Trip Calendar | Trip2Talk',
    description: 'Departure calendar for Trip2Talk photo trips in Australia and New Zealand.',
  },
  '/gallery': {
    title: 'Trip Photo Gallery | Trip2Talk',
    description: 'Photos from Trip2Talk trips in Tasmania, Uluru, New Zealand, Sydney, and more.',
  },
  '/pricing': {
    title: 'Photo Trip Prices | Trip2Talk',
    description: 'Trip2Talk prices in AUD, deposits, and how card, PayID, and Afterpay checkout works.',
  },
  '/about': {
    title: 'About Trip2Talk | Sydney Photo Trips',
    description: 'Trip2Talk is a Sydney photo-trip studio. Meet the photographer and how the trips are run.',
  },
  '/line-guide': {
    title: 'คู่มือดูและเก็บรูปทริป | Trip2Talk',
    description:
      'วิธีดูอัลบั้ม LINE ของ Trip2Talk เก็บรูปลงมือถือ และขอไฟล์ต้นฉบับสำหรับพิมพ์ครับ',
  },
  '/photo-guide': {
    title: 'Photo Guide | Trip2Talk',
    description: 'Posing, camera, and phone photo guides for Trip2Talk guests.',
  },
  '/photo-guide/posing': {
    title: 'Posing Guide | Trip2Talk',
    description: 'Simple posing ideas for Trip2Talk photo trips.',
  },
  '/photo-guide/camera': {
    title: 'Camera Guide | Trip2Talk',
    description: 'Camera settings and habits for Trip2Talk photo trips.',
  },
  '/photo-guide/mobile': {
    title: 'Phone Photo Guide | Trip2Talk',
    description: 'How to take stronger photos on a phone during a Trip2Talk trip.',
  },
  '/photo-guide/nz-visa': {
    title: 'New Zealand Visa Guide | Trip2Talk',
    description: 'NZeTA and visa notes for Thai travellers joining a Trip2Talk New Zealand trip.',
  },
  '/terms': {
    title: 'Terms and Conditions | Trip2Talk',
    description: 'Terms for booking a Trip2Talk photo trip.',
  },
  '/privacy': {
    title: 'Privacy Policy | Trip2Talk',
    description: 'How Trip2Talk handles guest information.',
  },
  '/cancellation': {
    title: 'Cancellation Policy | Trip2Talk',
    description: 'How cancellations and changes work for Trip2Talk bookings.',
  },
  '/payment-methods': {
    title: 'Payment Methods | Trip2Talk',
    description: 'How to pay a Trip2Talk deposit: card, Afterpay, or PayID.',
  },
  '/notifications': {
    title: 'Notifications | Trip2Talk',
    description: 'Notification settings for your Trip2Talk trip.',
  },
  '/help': {
    title: 'Help and Contact | Trip2Talk',
    description: 'Contact Trip2Talk about a photo trip, booking, or payment.',
  },
  '/review': {
    title: 'Write a Review | Trip2Talk',
    description: 'Share a review of your Trip2Talk photo trip.',
  },
  '/waiver': {
    title: 'Trip Waiver | Trip2Talk',
    description: 'Read the Trip2Talk trip waiver before you travel.',
  },
  '/booking': {
    title: 'Book a Photo Trip | Trip2Talk',
    description: 'Pay the deposit and book a seat on a Trip2Talk photo trip.',
    noindex: true,
  },
  '/booking/confirmation': {
    title: 'Booking Confirmation | Trip2Talk',
    description: 'Your Trip2Talk booking confirmation.',
    noindex: true,
  },
  '/waitlist': {
    title: 'Trip Waitlist | Trip2Talk',
    description: 'Join the waitlist when a Trip2Talk departure is full.',
  },
  '/favorites': {
    title: 'Saved Trips | Trip2Talk',
    description: 'Photo trips you saved on Trip2Talk.',
    noindex: true,
  },
  '/my-trip': {
    title: 'My Trip | Trip2Talk',
    description: 'Look up your Trip2Talk booking.',
    noindex: true,
  },
  '/account': {
    title: 'Account | Trip2Talk',
    description: 'Your Trip2Talk account.',
    noindex: true,
  },
}

export function metaForPath(pathname: string): RouteMeta | null {
  const path = pathname.split('?')[0] || '/'
  if (STATIC_ROUTE_META[path]) return STATIC_ROUTE_META[path]
  if (/^\/trips\/[^/]+$/.test(path)) return null
  if (/^\/trips\/[^/]+\/prep$/.test(path)) {
    return {
      title: 'Trip Preparation | Trip2Talk',
      description: 'What to pack and prepare before a Trip2Talk departure.',
      noindex: true,
    }
  }
  if (path.startsWith('/discover/spot/')) {
    const id = decodeURIComponent(path.split('/').pop() ?? 'spot')
    return {
      title: `${id} Photo Spot | Trip2Talk`,
      description: `Photo spot guide: ${id}. ${D}`,
    }
  }
  if (path.startsWith('/spots/')) {
    const slug = decodeURIComponent(path.split('/').pop() ?? 'spot')
    return {
      title: `${slug.replace(/-/g, ' ')} | Trip2Talk`,
      description: `Photo spot: ${slug.replace(/-/g, ' ')}. Locations Trip2Talk photographs.`,
    }
  }
  if (path.startsWith('/waiver/')) {
    return {
      title: 'Sign Your Waiver | Trip2Talk',
      description: 'Guest waiver for a Trip2Talk booking.',
      noindex: true,
    }
  }
  if (path.startsWith('/checkin/')) {
    return {
      title: 'Trip Check-in | Trip2Talk',
      description: 'Check in for your Trip2Talk departure.',
      noindex: true,
    }
  }
  if (path.startsWith('/quote/')) {
    return {
      title: 'Trip Extension Quote | Trip2Talk',
      description: 'A quote to extend your Trip2Talk trip.',
      noindex: true,
    }
  }
  return {
    title: 'Page not found | Trip2Talk',
    description: 'This Trip2Talk page does not exist.',
    noindex: true,
  }
}
