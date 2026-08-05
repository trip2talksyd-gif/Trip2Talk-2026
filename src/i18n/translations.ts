export type Lang = 'en' | 'th'

export type TranslationKey =
  | 'nav.home'
  | 'nav.explore'
  | 'nav.trips'
  | 'nav.gallery'
  | 'nav.calendar'
  | 'nav.pricing'
  | 'nav.about'
  | 'nav.portal'
  | 'nav.favorites'
  | 'nav.messages'
  | 'nav.myTrip'
  | 'nav.account'
  | 'nav.photoGuide'
  | 'nav.help'
  | 'btn.bookNow'
  | 'btn.exploreTrips'
  | 'btn.viewTrip'
  | 'btn.comingSoon'
  | 'btn.tripCancelled'
  | 'btn.submit'
  | 'btn.copy'
  | 'btn.copied'
  | 'form.name'
  | 'form.nameTh'
  | 'form.nameEn'
  | 'form.firstName'
  | 'form.lastName'
  | 'form.email'
  | 'form.phone'
  | 'form.passport'
  | 'form.dietary'
  | 'form.medical'
  | 'form.oshcProvider'
  | 'form.oshcExpiry'
  | 'form.dob'
  | 'form.emergencyName'
  | 'form.emergencyPhone'
  | 'booking.selectTrip'
  | 'booking.deposit'
  | 'booking.payment'
  | 'booking.confirmation'
  | 'booking.summary'
  | 'booking.reference'
  | 'booking.uploadSlip'
  | 'booking.success'
  | 'booking.waiverRequired'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.retry'
  | 'common.required'
  | 'common.seatsRemaining'
  | 'common.fromPrice'
  | 'common.full'
  | 'common.aurora'
  | 'common.standard'
  | 'common.private'
  | 'common.all'
  | 'common.oneday'
  | 'common.overnight'
  | 'common.multiday'
  | 'home.stats.trips'
  | 'home.stats.group'
  | 'home.stats.photographers'
  | 'home.stats.tripsLabel'
  | 'home.stats.groupLabel'
  | 'home.stats.photographersLabel'
  | 'home.hero.badge'
  | 'home.hero.title.line1'
  | 'home.hero.title.line2'
  | 'home.hero.en.line1'
  | 'home.hero.en.line2'
  | 'home.hero.th.line1'
  | 'home.hero.th.line2'
  | 'home.hero.subtitle'
  | 'home.promo.eyebrow'
  | 'home.promo.title'
  | 'trips.title'
  | 'trips.subtitle'
  | 'trips.empty'
  | 'trips.search'
  | 'trips.search.empty'
  | 'trips.going'
  | 'trips.going.note'
  | 'trips.cat.popular'
  | 'trips.cat.desert'
  | 'trips.cat.flagship'
  | 'trips.cat.aurora'
  | 'trips.cat.influencer'
  | 'trips.seatsLeft'
  | 'trips.seatsFull'
  | 'common.clearSearch'
  | 'detail.tab.details'
  | 'detail.tab.itinerary'
  | 'detail.tab.reviews'
  | 'detail.stat.duration'
  | 'detail.stat.seats'
  | 'detail.stat.perPerson'
  | 'detail.stat.destination'
  | 'detail.stat.group'
  | 'detail.stat.photographer'
  | 'detail.stat.photographerSub'
  | 'detail.highlights'
  | 'detail.includes'
  | 'detail.excludes'
  | 'detail.accommodation'
  | 'detail.prep'
  | 'detail.photoGuide'
  | 'detail.swipePhotos'
  | 'detail.moreTrips'
  | 'detail.reviews.title'
  | 'detail.reviews.body'
  | 'detail.reviews.cta'
  | 'detail.fromPrice'
  | 'home.hero.destination.tasmania'
  | 'home.hero.destination.uluru'
  | 'home.hero.destination.sydney'
  | 'home.hero.destination.newZealand'
  | 'home.category.title'
  | 'home.category.viewPrefix'
  | 'home.cta.title.line1'
  | 'home.cta.title.line2'
  | 'home.cta.subtitle'
  | 'home.faq.title'
  | 'home.faq.q1'
  | 'home.faq.a1'
  | 'home.faq.q2'
  | 'home.faq.a2'
  | 'home.faq.q3'
  | 'home.faq.a3'
  | 'home.faq.q4'
  | 'home.faq.a4'
  | 'home.faq.q5'
  | 'home.faq.a5'
  | 'home.faq.q6'
  | 'home.faq.a6'
  | 'home.featured'
  | 'home.how.title'
  | 'home.how.subtitle'
  | 'home.how.step1.title'
  | 'home.how.step1.desc'
  | 'home.how.step2.title'
  | 'home.how.step2.desc'
  | 'home.how.step3.title'
  | 'home.how.step3.desc'
  | 'home.how.mock.status'
  | 'home.showcase.title'
  | 'home.showcase.subtitle'
  | 'home.showcase.cta'
  | 'favorites.subtitle'
  | 'favorites.empty'
  | 'favorites.stale'
  | 'favorites.remove'
  | 'favorites.add'
  | 'myTrip.subtitle'
  | 'myTrip.refOrCode'
  | 'myTrip.contact'
  | 'myTrip.or'
  | 'myTrip.lookup'
  | 'myTrip.notFound'
  | 'myTrip.rpcMissing'
  | 'myTrip.error.reference'
  | 'myTrip.error.contact'
  | 'myTrip.error.email'
  | 'myTrip.status'
  | 'myTrip.departure'
  | 'myTrip.paid'
  | 'myTrip.balance'
  | 'myTrip.tripTotal'
  | 'myTrip.messageUs'
  | 'home.features.title'
  | 'home.features.toggle.title'
  | 'home.features.toggle.desc'
  | 'home.features.price.unit'
  | 'home.features.price.note'
  | 'home.features.price.notePrivate'
  | 'home.features.list.1'
  | 'home.features.list.2'
  | 'home.features.list.3'
  | 'home.features.list.4'
  | 'home.features.duration'
  | 'home.features.cta'
  | 'home.features.footer.title'
  | 'home.features.footer.sub'
  | 'home.audience.title'
  | 'home.audience.students'
  | 'home.audience.residents'
  | 'home.audience.couples'
  | 'home.audience.groups'
  | 'pricing.compare'
  | 'pricing.standard.pax'
  | 'pricing.standard.price'
  | 'pricing.standard.desc'
  | 'pricing.standard.check.1'
  | 'pricing.standard.check.2'
  | 'pricing.standard.check.3'
  | 'pricing.standard.cta'
  | 'pricing.private.badge'
  | 'pricing.private.pax'
  | 'pricing.private.price'
  | 'pricing.private.desc'
  | 'pricing.private.check.1'
  | 'pricing.private.check.2'
  | 'pricing.private.check.3'
  | 'pricing.private.cta'
  | 'pricing.page.subtitle'
  | 'pricing.mostPopular'
  | 'pricing.audPerPerson'
  | 'pricing.priceHint'
  | 'pricing.tier.day.title'
  | 'pricing.tier.day.desc'
  | 'pricing.tier.day.check.1'
  | 'pricing.tier.day.check.2'
  | 'pricing.tier.day.check.3'
  | 'pricing.tier.day.check.4'
  | 'pricing.tier.day.cta'
  | 'pricing.tier.multi.title'
  | 'pricing.tier.multi.desc'
  | 'pricing.tier.multi.check.1'
  | 'pricing.tier.multi.check.2'
  | 'pricing.tier.multi.check.3'
  | 'pricing.tier.multi.check.4'
  | 'pricing.tier.multi.cta'
  | 'pricing.tier.flagship.title'
  | 'pricing.tier.flagship.desc'
  | 'pricing.tier.flagship.check.1'
  | 'pricing.tier.flagship.check.2'
  | 'pricing.tier.flagship.check.3'
  | 'pricing.tier.flagship.check.4'
  | 'pricing.tier.flagship.cta'
  | 'pricing.cancel.title'
  | 'pricing.cancel.intro'
  | 'pricing.cancel.col.condition'
  | 'pricing.cancel.col.outcome'
  | 'pricing.cancel.rule.1.condition'
  | 'pricing.cancel.rule.1.outcome'
  | 'pricing.cancel.rule.2.condition'
  | 'pricing.cancel.rule.2.outcome'
  | 'pricing.cancel.rule.3.condition'
  | 'pricing.cancel.rule.3.outcome'
  | 'pricing.cancel.rule.4.condition'
  | 'pricing.cancel.rule.4.outcome'
  | 'pricing.cancel.rule.5.condition'
  | 'pricing.cancel.rule.5.outcome'
  | 'calendar.value.badge'
  | 'calendar.value.heading.line1'
  | 'calendar.value.heading.line2'
  | 'calendar.value.negative.1'
  | 'calendar.value.negative.2'
  | 'calendar.value.negative.3'
  | 'calendar.value.negative.4'
  | 'calendar.value.negative.5'
  | 'calendar.value.positive.1'
  | 'calendar.value.positive.2'
  | 'calendar.value.positive.3'
  | 'calendar.value.positive.4'
  | 'calendar.value.positive.5'
  | 'calendar.photo.eyebrow'
  | 'calendar.photo.heading.line1'
  | 'calendar.photo.heading.line2'
  | 'calendar.photo.sub'
  | 'calendar.photo.feature.1.title'
  | 'calendar.photo.feature.1.desc'
  | 'calendar.photo.feature.2.title'
  | 'calendar.photo.feature.2.desc'
  | 'calendar.photo.feature.3.title'
  | 'calendar.photo.feature.3.desc'
  | 'calendar.trips.badge'
  | 'calendar.banner.title'
  | 'calendar.banner.sub'
  | 'calendar.empty'
  | 'calendar.moreDestinations'
  | 'gallery.empty'
  | 'gallery.emptyCategory'
  | 'gallery.exampleAlbum'
  | 'gallery.inspiration'
  | 'photoGuide.back'
  | 'photoGuide.hub.badge'
  | 'photoGuide.hub.title'
  | 'photoGuide.hub.subtitle'
  | 'photoGuide.readGuide'
  | 'photoGuide.hub.albumTitle'
  | 'photoGuide.hub.albumSub'
  | 'photoGuide.hub.dragHint'
  | 'photoGuide.swipeMore'
  | 'photoGuide.fromTheRoad'
  | 'photoGuide.posing.eyebrow'
  | 'photoGuide.posing.title'
  | 'photoGuide.posing.sub'
  | 'photoGuide.posing.posesTitle'
  | 'photoGuide.posing.seasonTitle'
  | 'photoGuide.posing.seasonSub'
  | 'photoGuide.posing.quote'
  | 'photoGuide.posing.quoteBy'
  | 'photoGuide.camera.eyebrow'
  | 'photoGuide.camera.title'
  | 'photoGuide.camera.sub'
  | 'photoGuide.camera.examples'
  | 'photoGuide.camera.table.scene'
  | 'photoGuide.camera.table.aperture'
  | 'photoGuide.camera.table.shutter'
  | 'photoGuide.camera.table.iso'
  | 'photoGuide.camera.table.notes'
  | 'photoGuide.camera.disclaimer'
  | 'photoGuide.camera.gear'
  | 'photoGuide.mobile.eyebrow'
  | 'photoGuide.mobile.title'
  | 'photoGuide.mobile.sub'
  | 'photoGuide.mobile.landscape'
  | 'photoGuide.mobile.portrait'
  | 'photoGuide.follow'
  | 'favorites.saved'
  | 'favorites.savedTripsLabel'
  | 'trips.suggested'
  | 'account.guestBadge'
  | 'account.guestSub'
  | 'account.language'
  | 'about.positioning'
  | 'about.page.eyebrow'
  | 'about.page.title'
  | 'about.hero.heading'
  | 'about.hero.story'
  | 'about.hero.stat.trips'
  | 'about.hero.stat.photographers'
  | 'about.hero.stat.travelers'
  | 'about.saen.bio'
  | 'about.ploy.bio'
  | 'about.whatToKnow.title'
  | 'about.whatToKnow.body'
  | 'about.contact.studio'
  | 'about.contact.hours'
  | 'about.contact.footer'
  | 'about.stats.heading.line1'
  | 'about.stats.heading.line2'
  | 'about.stats.intro'
  | 'about.stats.1.label'
  | 'about.stats.1.desc'
  | 'about.stats.2.label'
  | 'about.stats.2.desc'
  | 'about.stats.3.label'
  | 'about.stats.3.desc'
  | 'about.destinations'
  | 'about.oshc'
  | 'about.contact'
  | 'about.crew'
  | 'about.tips'
  | 'waiver.title'
  | 'waiver.signName'
  | 'safety.title'
  | 'safety.subtitle'
  | 'safety.emergencyName'
  | 'safety.emergencyPhone'
  | 'safety.allergies'
  | 'safety.allergies.ph'
  | 'safety.medical'
  | 'safety.medical.ph'
  | 'safety.insuranceProvider'
  | 'safety.insuranceProvider.ph'
  | 'safety.insurancePolicy'
  | 'safety.insurancePolicy.ph'
  | 'safety.otherNotes'
  | 'safety.otherNotes.ph'
  | 'safety.emergencyRequired'
  | 'safety.insuranceType'
  | 'safety.oshcMembership'
  | 'safety.oshcRiskRequired'
  | 'safety.travelProvider'
  | 'safety.travelPolicy'
  | 'safety.flightToggle'
  | 'safety.flightNzNote'
  | 'safety.flightFirst'
  | 'safety.flightLast'
  | 'safety.flightDob'
  | 'safety.flightPassport'
  | 'safety.flightNationality'
  | 'safety.flightFf'
  | 'confirm.title'
  | 'confirm.subtitle'
  | 'confirm.noInvoice'
  | 'confirm.nextTitle'
  | 'confirm.next.1'
  | 'confirm.next.2'
  | 'confirm.next.3'
  | 'confirm.check.deposit'
  | 'confirm.check.waiver'
  | 'confirm.check.safety'
  | 'confirm.check.facebook'
  | 'confirm.download'
  | 'confirm.email'
  | 'confirm.open'
  | 'staff.safety.quickView'
  | 'staff.safety.none'
  | 'staff.safety.allergies'
  | 'staff.safety.medical'
  | 'staff.safety.insurance'
  | 'staff.safety.notes'
  | 'staff.payments.title'
  | 'staff.payments.search'
  | 'staff.payments.progress'
  | 'staff.payments.add'
  | 'staff.payments.markPaid'
  | 'staff.income.title'
  | 'lang.toggle'
  | 'validation.email'
  | 'validation.phone'
  | 'validation.required'
  | 'validation.waiverClauses'
  | 'booking.rlsError'
  | 'booking.seatsFull'
  | 'pin.locked'
  | 'pin.invalid'
  | 'pin.connection'
  | 'pin.welcome'
  | 'toast.bookingSuccess'
  | 'toast.bookingFailed'
  | 'toast.paymentUpdated'
  | 'toast.paymentFailed'
  | 'contact.findUs'
  | 'contact.facebook'
  | 'contact.facebook.sub'
  | 'contact.messenger'
  | 'contact.messenger.sub'
  | 'contact.email'
  | 'contact.email.sub'
  | 'contact.phone'
  | 'contact.phone.sub'
  | 'contact.line'
  | 'contact.line.sub'
  | 'contact.googleReviews'
  | 'contact.googleReviews.sub'
  | 'footer.tagline.line1'
  | 'footer.tagline.line2'
  | 'footer.social.label'
  | 'footer.lucky.text'
  | 'footer.nav.title1'
  | 'footer.nav.title2'
  | 'footer.nav.title3'
  | 'footer.info.terms'
  | 'footer.info.privacy'
  | 'footer.info.cancellation'
  | 'footer.info.payment'
  | 'footer.info.help'
  | 'footer.info.contact'
  | 'footer.info.portal'
  | 'footer.bottom.cta.line1'
  | 'footer.bottom.cta.line2'
  | 'footer.subscribe.placeholder'
  | 'footer.subscribe.button'
  | 'footer.subscribe.toast'
  | 'footer.copyright'

type Map = Record<TranslationKey, string>

const en: Map = {
  'nav.home': 'Home',
  'nav.explore': 'Explore',
  'nav.trips': 'Trips',
  'nav.gallery': 'Gallery',
  'nav.calendar': 'Calendar',
  'nav.pricing': 'Pricing',
  'nav.about': 'About',
  'nav.portal': 'Portal',
  'nav.favorites': 'Favorites',
  'nav.messages': 'Messages',
  'nav.myTrip': 'My Trip',
  'nav.account': 'Account',
  'nav.photoGuide': 'Photo Guide',
  'nav.help': 'Help',
  'btn.bookNow': 'Book Now',
  'btn.exploreTrips': 'Explore Trips',
  'btn.viewTrip': 'View Trip',
  'btn.comingSoon': 'Coming soon',
  'btn.tripCancelled': 'This trip has been cancelled',
  'btn.submit': 'Submit Booking',
  'btn.copy': 'Copy',
  'btn.copied': 'Copied!',
  'form.name': 'Name',
  'form.nameTh': 'Name (Thai)',
  'form.nameEn': 'Name (English)',
  'form.firstName': 'ชื่อ (First name)',
  'form.lastName': 'นามสกุล (Last name)',
  'form.email': 'Email',
  'form.phone': 'Phone',
  'form.passport': 'Passport Number / Student ID',
  'form.dietary': 'Dietary Requirements',
  'form.medical': 'Medical Conditions',
  'form.oshcProvider': 'OSHC Provider',
  'form.oshcExpiry': 'OSHC Expiry Date',
  'form.dob': 'Date of Birth',
  'form.emergencyName': 'Emergency Contact Name',
  'form.emergencyPhone': 'Emergency Contact Phone',
  'booking.selectTrip': 'Select a trip',
  'booking.deposit': 'Deposit due',
  'booking.payment': 'PayID Payment',
  'booking.confirmation': 'Booking Confirmed!',
  'booking.summary': 'Trip Summary',
  'booking.reference': 'Booking Reference',
  'booking.uploadSlip': 'Upload payment slip',
  'booking.success': 'จองสำเร็จแล้ว!',
  'booking.waiverRequired': 'Please sign the waiver before booking.',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong. Please try again.',
  'common.success': 'Success',
  'common.retry': 'Try again',
  'common.required': 'Required',
  'common.seatsRemaining': 'seats left',
  'common.fromPrice': 'From',
  'common.full': 'Full',
  'common.aurora': 'Aurora Trip',
  'common.standard': 'Standard',
  'common.private': 'Private',
  'common.all': 'All',
  'common.oneday': 'One Day',
  'common.overnight': 'Overnight',
  'common.multiday': 'Multi-day',
  'common.clearSearch': 'Clear search',
  'home.stats.trips': '13 Trips',
  'home.stats.group': '100% Small Group',
  'home.stats.photographers': 'Local Photographers',
  'home.stats.tripsLabel': 'Trips',
  'home.stats.groupLabel': 'Group size',
  'home.stats.photographersLabel': 'Photographers',
  'home.hero.badge': 'Photography trip with pro photographers',
  'home.hero.title.line1': 'Photo journeys',
  'home.hero.title.line2': 'worth remembering',
  'home.hero.en.line1': 'Capture Moments',
  'home.hero.en.line2': 'Worth Showing Off',
  'home.hero.th.line1': 'ออกไปเก็บภาพ',
  'home.hero.th.line2': 'ที่ทุกคนอยากดู',
  'home.hero.subtitle':
    'Photo trips across Australia & New Zealand — fully arranged, with a photographer & styling team the whole way.',
  'home.promo.eyebrow': "Let's Learn and Practice",
  'home.promo.title': 'New: Photo Guide — poses, camera & phone tips',
  'trips.title': 'Find Your Trip',
  'trips.subtitle': 'Small groups, pro photographer on every trip.',
  'trips.empty': 'No trips in this category yet — check back soon.',
  'trips.search': 'Search destination...',
  'trips.search.empty': 'No trips match your search.',
  'trips.going': 'Connect with people going',
  'trips.going.note': 'Join the Facebook group chat — live traveler list coming later.',
  'trips.cat.popular': 'Popular',
  'trips.cat.desert': 'Desert',
  'trips.cat.flagship': 'Flagship',
  'trips.cat.aurora': 'Aurora',
  'trips.cat.influencer': 'Influencer',
  'trips.seatsLeft': 'left',
  'trips.seatsFull': 'Full',
  'detail.tab.details': 'Details',
  'detail.tab.itinerary': 'Itinerary',
  'detail.tab.reviews': 'Reviews',
  'detail.stat.duration': 'Duration',
  'detail.stat.seats': 'Seats',
  'detail.stat.perPerson': 'Per person',
  'detail.stat.destination': 'Destination',
  'detail.stat.group': 'Group size',
  'detail.stat.photographer': 'Pro photographer',
  'detail.stat.photographerSub': 'Every trip',
  'detail.highlights': 'Highlights',
  'detail.includes': "What's included",
  'detail.excludes': 'Not included',
  'detail.accommodation': 'Accommodation',
  'detail.prep': 'Trip Preparation',
  'detail.photoGuide': 'Read the Photo Guide before you go',
  'detail.swipePhotos': '↔ Swipe for more photos',
  'detail.moreTrips': 'More Trips For You',
  'detail.reviews.title': 'Guest reviews',
  'detail.reviews.body':
    "We don't publish review scores here yet — read real comments and guest photos on our Facebook Page.",
  'detail.reviews.cta': 'See reviews on Facebook',
  'detail.fromPrice': 'From',
  'home.hero.destination.tasmania': 'Tasmania',
  'home.hero.destination.uluru': 'Uluru',
  'home.hero.destination.sydney': 'Sydney',
  'home.hero.destination.newZealand': 'New Zealand',
  'home.category.title': 'Find your trip',
  'home.category.viewPrefix': 'View',
  'home.cta.title.line1': 'Ready for Your Next',
  'home.cta.title.line2': 'Photo Adventure?',
  'home.cta.subtitle': 'Small groups, real photographers, unforgettable trips',
  'home.faq.title': 'Frequently Asked Questions',
  'home.faq.q1': "What's included in the trip price?",
  'home.faq.a1':
    'Private transport with a driver, a professional photographer for the whole trip, drinking water, and park/entry fees where listed. Flights, meals, and travel insurance are not included unless stated on the specific trip page.',
  'home.faq.q2': 'Do I need OSHC or travel insurance?',
  'home.faq.a2':
    "We strongly recommend it, and student-visa holders must confirm their OSHC covers domestic travel. Trip2Talk isn't a substitute for insurance — see the waiver for full details.",
  'home.faq.q3': 'How big are the groups?',
  'home.faq.a3':
    'Small by design — usually 4 to 6 people per trip. Some premium trips can run as a private group of 2-3 at a higher rate; check the specific trip page.',
  'home.faq.q4': 'Can I get a private room?',
  'home.faq.a4':
    'Standard trips include shared dormitory-style accommodation. Private room upgrades are available on most trips for an extra cost per night — message us before booking to arrange it.',
  'home.faq.q5': "What if the aurora or Milky Way doesn't show?",
  'home.faq.a5':
    'Aurora and Milky Way sightings depend on nature — clear skies, solar activity (KP index), and no light pollution. We choose the best known viewing spots and timing, but sightings are never guaranteed and are not refundable if conditions don\'t cooperate.',
  'home.faq.q6': 'How do I pay, and what if I need to cancel?',
  'home.faq.a6':
    'Book via PayID with a deposit to secure your seat, then pay the balance before departure. Cancellation and refund terms vary by trip and are shown on the digital waiver before you confirm.',
  'home.featured': 'Featured Trips',
  'home.how.title': 'See Trip2Talk in action',
  'home.how.subtitle': 'From picking a date to getting your photos back — here is the whole trip.',
  'home.how.step1.title': 'Pick your trip & date',
  'home.how.step1.desc': 'Browse real departure dates, check seats left, and find the destination that fits your style.',
  'home.how.step2.title': 'Lock your seat with a deposit',
  'home.how.step2.desc': 'Transfer the deposit via PayID — no account, no app download, just a bank transfer.',
  'home.how.step3.title': 'Travel with your group',
  'home.how.step3.desc': 'Meet your small group and photographer on the day. Edited photos follow after the trip.',
  'home.how.mock.status': 'Deposit confirmed',
  'home.showcase.title': 'Real trips, real photos',
  'home.showcase.subtitle': 'A few trips currently open for booking.',
  'home.showcase.cta': 'View all trips',
  'favorites.subtitle': 'Saved on this device — no account needed.',
  'favorites.empty': 'No saved trips yet. Tap the heart on any trip card to save it here.',
  'favorites.stale': 'Some saved trip codes are no longer listed. You can remove them below.',
  'favorites.remove': 'Remove',
  'favorites.add': 'Save trip',
  'myTrip.subtitle':
    'Enter your booking reference or trip code, plus the email or phone from checkout.',
  'myTrip.refOrCode': 'Booking reference or trip code',
  'myTrip.contact': 'Email or phone',
  'myTrip.or': 'or',
  'myTrip.lookup': 'Look up my trip',
  'myTrip.notFound': 'No booking matched that reference and contact. Check and try again.',
  'myTrip.rpcMissing':
    'Trip lookup is not available yet (Edge Function not deployed). Message us on Facebook with your booking reference.',
  'myTrip.error.reference': 'Booking reference is required.',
  'myTrip.error.contact': 'Enter your email or phone.',
  'myTrip.error.email': 'Please enter a valid email.',
  'myTrip.status': 'Status',
  'myTrip.departure': 'Departure',
  'myTrip.paid': 'Paid so far',
  'myTrip.balance': 'Balance owing',
  'myTrip.tripTotal': 'Trip total',
  'myTrip.messageUs': 'Message us on Facebook to arrange flights, installments, or pickup.',
  'home.features.title': 'Trip rate',
  'home.features.toggle.title': 'Want a private group?',
  'home.features.toggle.desc':
    'Upgrade to a private seat block with your own photographer focus and flexible timing on the day.',
  'home.features.price.unit': '/ person',
  'home.features.price.note': 'Standard seat',
  'home.features.price.notePrivate': 'Private upgrade',
  'home.features.list.1': 'Small group of 6 max',
  'home.features.list.2': 'Pro photographer on every trip',
  'home.features.list.3': 'Private transport included',
  'home.features.list.4': 'Edited photo set after the trip',
  'home.features.duration': '3D2N typical',
  'home.features.cta': 'Book a trip',
  'home.features.footer.title': 'Trip2Talk Pricing',
  'home.features.footer.sub': 'Pricing',
  'home.audience.title': 'Who is this trip for?',
  'home.audience.students': 'Thai Students',
  'home.audience.residents': 'PR & Residents',
  'home.audience.couples': 'Couples',
  'home.audience.groups': 'Friend Groups',
  'pricing.compare': 'Standard vs Private',
  'pricing.standard.pax': '4–6 guests',
  'pricing.standard.price': 'Listed price',
  'pricing.standard.desc': 'Standard small group — best value, departs when minimum is met',
  'pricing.standard.check.1': 'Best value pricing',
  'pricing.standard.check.2': 'Same professional photographer for every group',
  'pricing.standard.check.3': 'Departs when the group minimum is met',
  'pricing.standard.cta': 'View all trips',
  'pricing.private.badge': 'Recommended',
  'pricing.private.pax': '1–3 guests',
  'pricing.private.price': 'Premium rate',
  'pricing.private.desc': 'Guaranteed departure with flexible scheduling',
  'pricing.private.check.1': 'Guaranteed departure — no waiting to fill a group',
  'pricing.private.check.2': 'Choose your own travel dates',
  'pricing.private.check.3': 'Full privacy throughout the trip',
  'pricing.private.cta': 'Book a private trip',
  'pricing.page.subtitle': 'Sample figures — live trip pages show exact AUD pricing',
  'pricing.mostPopular': 'Most popular',
  'pricing.audPerPerson': 'AUD / person',
  'pricing.priceHint': 'Tap or hover the price to see the flip animation',
  'pricing.tier.day.title': 'One-day trips',
  'pricing.tier.day.desc': 'A few hours with one professional photographer — light logistics',
  'pricing.tier.day.check.1': '3-hour photo session',
  'pricing.tier.day.check.2': 'Local professional photographer',
  'pricing.tier.day.check.3': 'Unlimited edited photos',
  'pricing.tier.day.check.4': 'Online album delivery',
  'pricing.tier.day.cta': 'Book a one-day trip',
  'pricing.tier.multi.title': 'Multi-day trips',
  'pricing.tier.multi.desc': '3–4 days with vehicle + driver and lodging support',
  'pricing.tier.multi.check.1': 'Everything in a one-day trip',
  'pricing.tier.multi.check.2': 'SUV and driver included',
  'pricing.tier.multi.check.3': 'Accommodation booking help',
  'pricing.tier.multi.check.4': 'Park fees and permits',
  'pricing.tier.multi.cta': 'Book a multi-day trip',
  'pricing.tier.flagship.title': 'Flagship trips',
  'pricing.tier.flagship.desc': '6 days with flight coordination — our fullest itinerary',
  'pricing.tier.flagship.check.1': 'Everything in a multi-day trip',
  'pricing.tier.flagship.check.2': 'Flight booking assistance',
  'pricing.tier.flagship.check.3': '5+ nights accommodation',
  'pricing.tier.flagship.check.4': 'Priority photographer team',
  'pricing.tier.flagship.cta': 'Book a flagship trip',
  'pricing.cancel.title': 'Cancellation & refund policy',
  'pricing.cancel.intro':
    'Trip2Talk takes PayID (AUD) deposits before travel. All amounts are in Australian dollars.',
  'pricing.cancel.col.condition': 'Condition',
  'pricing.cancel.col.outcome': 'Outcome',
  'pricing.cancel.rule.1.condition': 'Cancel 10+ days before departure',
  'pricing.cancel.rule.1.outcome': 'Reschedule or hold credit for a later trip',
  'pricing.cancel.rule.2.condition': 'Cancel 3–9 days before departure',
  'pricing.cancel.rule.2.outcome': 'Transfer to another traveller only — no cash refund',
  'pricing.cancel.rule.3.condition': 'Cancel 0–2 days before departure',
  'pricing.cancel.rule.3.outcome': 'No refund in any case, including deposit',
  'pricing.cancel.rule.4.condition': 'Weather / force majeure',
  'pricing.cancel.rule.4.outcome': 'Full credit for a future trip — no cash refund',
  'pricing.cancel.rule.5.condition': 'Minimum group size not met',
  'pricing.cancel.rule.5.outcome': 'Trip may be rescheduled or credited — we notify by SMS/email',
  'calendar.value.badge': 'Book with confidence',
  'calendar.value.heading.line1': 'Stop guessing travel dates.',
  'calendar.value.heading.line2': 'Book with confidence.',
  'calendar.value.negative.1': 'Never sure if enough travelers will join',
  'calendar.value.negative.2': 'Availability is hard to check',
  'calendar.value.negative.3': 'Seats sell out with no early warning',
  'calendar.value.negative.4': 'Pricing feels unclear',
  'calendar.value.negative.5': 'No single calendar to compare trips',
  'calendar.value.positive.1': 'One calendar shows real seat counts',
  'calendar.value.positive.2': 'Clear pricing upfront',
  'calendar.value.positive.3': 'Real-time seat availability',
  'calendar.value.positive.4': 'Small groups already confirmed',
  'calendar.value.positive.5': 'Book online instantly',
  'calendar.photo.eyebrow': 'Every trip includes a photographer',
  'calendar.photo.heading.line1': 'Just show up.',
  'calendar.photo.heading.line2': 'Come home with hundreds of photos.',
  'calendar.photo.sub':
    'A professional photographer and a full styling wardrobe travel with every group — no gear, no outfits to plan.',
  'calendar.photo.feature.1.title': 'Professional photographer',
  'calendar.photo.feature.1.desc': 'On every single trip, every group, no add-on fee',
  'calendar.photo.feature.2.title': 'Wardrobe & styling included',
  'calendar.photo.feature.2.desc': 'Outfits and props brought along — just pick a look',
  'calendar.photo.feature.3.title': 'High-res photos to keep',
  'calendar.photo.feature.3.desc': 'Full-resolution files, ready to post the same trip',
  'calendar.trips.badge': 'Open for booking',
  'calendar.banner.title': 'Every trip includes a photographer',
  'calendar.banner.sub': 'Styling / wardrobe support throughout the trip',
  'calendar.empty': 'No trips in this month',
  'calendar.moreDestinations': 'More destinations',
  'gallery.empty': 'No gallery photos yet',
  'gallery.emptyCategory': 'No photos in this category',
  'gallery.exampleAlbum': 'Example album from Saen & team',
  'gallery.inspiration': 'Inspiration',
  'photoGuide.back': 'Back to Photo Guide',
  'photoGuide.hub.badge': "Let's Learn and Practice",
  'photoGuide.hub.title': 'Photo Guide',
  'photoGuide.hub.subtitle':
    'Three guides for three kinds of travelers — linked from Home and Trip Prep.',
  'photoGuide.readGuide': 'Read guide →',
  'photoGuide.hub.albumTitle': 'Photos from Saen',
  'photoGuide.hub.albumSub': 'Curated shots from past trips — drag or browse the slideshow below.',
  'photoGuide.hub.dragHint': '↔ Drag to browse the album',
  'photoGuide.swipeMore': 'Swipe for more →',
  'photoGuide.fromTheRoad': 'From the road',
  'photoGuide.posing.eyebrow': 'Photo Guide · Posing & Styling',
  'photoGuide.posing.title': 'Posing & Styling Guide',
  'photoGuide.posing.sub':
    'For trip customers who love being in front of the camera. Browse the album, then try our photographers’ favorite poses and seasonal color guide.',
  'photoGuide.posing.posesTitle': 'Photographer-approved poses',
  'photoGuide.posing.seasonTitle': 'What to wear, by season',
  'photoGuide.posing.seasonSub':
    'Matched to real Trip2Talk trips, so your outfit works with the landscape you’ll shoot.',
  'photoGuide.posing.quote':
    '“Don’t try to be a model — try to look like you’re having the best day of your trip. That’s the photo people actually stop scrolling for.”',
  'photoGuide.posing.quoteBy': 'Trip2Talk lead photographer',
  'photoGuide.camera.eyebrow': 'Photo Guide · Camera Settings',
  'photoGuide.camera.title': 'Camera Settings Guide',
  'photoGuide.camera.sub':
    'A starting-point cheat-sheet for beginners with a DSLR or mirrorless — morning light through stars, Milky Way and aurora on our NZ & Tasmania trips.',
  'photoGuide.camera.examples': "Example shots from Saen's trips",
  'photoGuide.camera.table.scene': 'Time / scene',
  'photoGuide.camera.table.aperture': 'Aperture (f)',
  'photoGuide.camera.table.shutter': 'Shutter',
  'photoGuide.camera.table.iso': 'ISO',
  'photoGuide.camera.table.notes': 'Notes',
  'photoGuide.camera.disclaimer':
    'Starting points only — adjust for your specific lens and camera’s low-light performance.',
  'photoGuide.camera.gear': 'Beginner gear checklist',
  'photoGuide.mobile.eyebrow': 'Photo Guide · Mobile Photography',
  'photoGuide.mobile.title': 'Mobile Photography Guide',
  'photoGuide.mobile.sub':
    'No extra gear needed — simple landscape and portrait techniques any trip customer can use with just their phone.',
  'photoGuide.mobile.landscape': 'Landscape',
  'photoGuide.mobile.portrait': 'Portrait / People',
  'photoGuide.follow': 'Follow Trip2Talk',
  'favorites.saved': 'saved',
  'favorites.savedTripsLabel': 'saved trips',
  'trips.suggested': 'You might also like',
  'account.guestBadge': 'Trip2Talk Guest',
  'account.guestSub': 'Guest booking — no account login required',
  'account.language': 'Language',
  'about.positioning': 'Who we are',
  'about.page.eyebrow': 'About Trip2Talk',
  'about.page.title': 'About Trip2Talk',
  'about.hero.heading': 'Photo trips, handled end-to-end',
  'about.hero.story':
    "Trip2Talk started with one idea: travelers shouldn't have to choose between exploring and getting great photos of themselves doing it. Every trip pairs a small group (max 6) with a professional photographer and styling support, so you can focus on the moment.",
  'about.hero.stat.trips': 'Trips',
  'about.hero.stat.photographers': 'Photographers',
  'about.hero.stat.travelers': 'Travelers',
  'about.saen.bio':
    "Hello — I'm Saen, a photographer captivated by nature and light. I taught myself the craft and, through that passion, connected with Thai communities in Sydney who shared the same love for exploring and photographing this city.\n\nOver the past 10 years I've honed landscape photography. For me, photography isn't just recording a scene — it's preserving a story, a feeling, and the experience of that moment in time.",
  'about.ploy.bio':
    'Monsicha Chayakorn (Ploy) — Admin & Trip Staff. She coordinates bookings and makes sure every guest is prepared before departure.',
  'about.whatToKnow.title': 'What you should know',
  'about.whatToKnow.body':
    "We're not a traditional tour company — Trip2Talk is a Photo Trip service focused on photography-led travel. Accommodation is typically hostel, backpacker, or motel standard — clean and safe. Private room upgrades are available on request. Meals are not included.",
  'about.contact.studio': 'Studio',
  'about.contact.hours': 'Monday–Friday 10am–5pm',
  'about.contact.footer': 'ABN 81 951 461 769 · Chapter 99 Photography',
  'about.stats.heading.line1': 'About',
  'about.stats.heading.line2': 'our team',
  'about.stats.intro':
    'Trip2Talk is a photography-led travel brand for Thai communities in Australia — small groups, real photographers, and journeys worth remembering.',
  'about.stats.1.label': 'Trips',
  'about.stats.1.desc': 'Curated small-group photo trips across Australia & NZ',
  'about.stats.2.label': 'Small Group',
  'about.stats.2.desc': 'Every trip stays intimate — no big-bus tours',
  'about.stats.3.label': 'Photographers',
  'about.stats.3.desc': 'Professional local photographers on every trip',
  'about.destinations': 'Where we go',
  'about.oshc': 'OSHC & visa support',
  'about.contact': 'Contact',
  'about.crew': 'Meet Saen',
  'about.tips': 'Insider Tips — Aurora Hunting',
  'waiver.title': 'Waiver & Consent',
  'waiver.signName': 'Type your full name as digital signature',
  'safety.title': 'Safety Info',
  'safety.subtitle': 'For your guide in an emergency — keep it short.',
  'safety.emergencyName': 'Emergency contact name',
  'safety.emergencyPhone': 'Emergency contact phone',
  'safety.allergies': 'Allergies',
  'safety.allergies.ph': 'e.g. peanuts, none',
  'safety.medical': 'Medical conditions',
  'safety.medical.ph': 'e.g. asthma, none',
  'safety.insuranceProvider': 'Travel insurance provider',
  'safety.insuranceProvider.ph': 'Company name',
  'safety.insurancePolicy': 'Policy number',
  'safety.insurancePolicy.ph': 'Policy / member no.',
  'safety.otherNotes': 'Anything else we should know',
  'safety.otherNotes.ph': 'e.g. cannot swim, fear of heights, mobility needs',
  'safety.emergencyRequired': 'Emergency contact name and phone are required',
  'safety.insuranceType': 'Insurance type',
  'safety.oshcMembership': 'OSHC membership number',
  'safety.oshcRiskRequired': 'Please acknowledge the OSHC repatriation risk',
  'safety.travelProvider': 'Travel insurance provider',
  'safety.travelPolicy': 'Travel insurance policy number',
  'safety.flightToggle': 'Book flights on my behalf',
  'safety.flightNzNote':
    'Passport & nationality required for NZ flights only — not needed for AU domestic.',
  'safety.flightFirst': 'Legal first name (passport)',
  'safety.flightLast': 'Legal last name (passport)',
  'safety.flightDob': 'Date of birth',
  'safety.flightPassport': 'Passport number',
  'safety.flightNationality': 'Nationality',
  'safety.flightFf': 'Frequent flyer number (optional)',
  'confirm.title': 'Confirmation Summary',
  'confirm.subtitle': 'Your booking checklist — no tax invoice here.',
  'confirm.noInvoice':
    'No tax invoice included here — sent separately per payment.',
  'confirm.nextTitle': 'What happens next',
  'confirm.next.1': 'Transfer your deposit via PayID and send the slip on Facebook.',
  'confirm.next.2': 'We confirm your seat and add you to the trip group chat.',
  'confirm.next.3': 'Before departure, check Trip Prep for packing and meeting point.',
  'confirm.check.deposit': 'Deposit paid',
  'confirm.check.waiver': 'Waiver signed',
  'confirm.check.safety': 'Safety info on file',
  'confirm.check.facebook': 'Message us on Facebook',
  'confirm.download': 'Download summary (PNG)',
  'confirm.email': 'Open Gmail to share',
  'confirm.open': 'Open confirmation summary',
  'staff.safety.quickView': 'Trip-day safety',
  'staff.safety.none': 'No safety notes',
  'staff.safety.allergies': 'Allergies',
  'staff.safety.medical': 'Medical',
  'staff.safety.insurance': 'Insurance',
  'staff.safety.notes': 'Notes',
  'staff.payments.title': 'Customer payments',
  'staff.payments.search': 'Search by customer name',
  'staff.payments.progress': 'Installment progress',
  'staff.payments.add': 'Add installment',
  'staff.payments.markPaid': 'Mark paid',
  'staff.income.title': 'Income (paid installments)',
  'lang.toggle': 'ไทย',
  'validation.email': 'Enter a valid email address',
  'validation.phone': 'Use Australian mobile format: 04XX XXX XXX',
  'validation.required': 'This field is required',
  'validation.waiverClauses': 'Please accept all waiver clauses',
  'booking.rlsError': 'Booking could not be saved. Please contact Trip2Talk on Messenger.',
  'booking.seatsFull': 'This trip is full — no seats left. Please choose another date or trip.',
  'pin.locked': 'Too many attempts. Try again in',
  'pin.invalid': 'Invalid PIN',
  'pin.connection': 'Connection error',
  'pin.welcome': 'Welcome back!',
  'toast.bookingSuccess': 'Booking submitted successfully!',
  'toast.bookingFailed': 'Booking failed. Please try again.',
  'toast.paymentUpdated': 'Payment status updated',
  'toast.paymentFailed': 'Could not update payment status',
  'contact.findUs': 'Find us',
  'contact.facebook': 'Facebook',
  'contact.facebook.sub': 'Follow us here',
  'contact.messenger': 'Messenger',
  'contact.messenger.sub': 'Chat with us',
  'contact.email': 'Email',
  'contact.email.sub': 'Send us a message',
  'contact.phone': 'Call',
  'contact.phone.sub': '0452 044 382',
  'contact.line': 'Line',
  'contact.line.sub': 'Add us on Line',
  'contact.googleReviews': 'Google Reviews',
  'contact.googleReviews.sub': 'See our reviews',
  'footer.tagline.line1': 'Private photo journeys,',
  'footer.tagline.line2': 'led by real photographers.',
  'footer.social.label': 'Stay in touch!',
  'footer.lucky.text': 'Book now!',
  'footer.nav.title1': 'Navigation',
  'footer.nav.title2': 'Info',
  'footer.nav.title3': 'Contact',
  'footer.info.terms': 'Terms of Service',
  'footer.info.privacy': 'Privacy Policy',
  'footer.info.cancellation': 'Cancellation Policy',
  'footer.info.payment': 'Payment Methods',
  'footer.info.help': 'Help & Support',
  'footer.info.contact': 'Contact Us',
  'footer.info.portal': 'Staff Portal',
  'footer.bottom.cta.line1': 'Have a question?',
  'footer.bottom.cta.line2': 'Message us on FB Messenger for more details.',
  'footer.subscribe.placeholder': 'Enter your email',
  'footer.subscribe.button': 'Open Trip2Talk on Facebook',
  'footer.subscribe.toast': "Thanks! We'll be in touch.",
  'footer.copyright': '© 2025 Trip2Talk. All rights reserved.',
}

const th: Map = {
  'nav.home': 'หน้าแรก',
  'nav.explore': 'สำรวจ',
  'nav.trips': 'ทริป',
  'nav.gallery': 'แกลเลอรี',
  'nav.calendar': 'ปฏิทิน',
  'nav.pricing': 'ราคา',
  'nav.about': 'เกี่ยวกับ',
  'nav.portal': 'พอร์ทัล',
  'nav.favorites': 'รายการโปรด',
  'nav.messages': 'ข้อความ',
  'nav.myTrip': 'ทริปของฉัน',
  'nav.account': 'บัญชี',
  'nav.photoGuide': 'คู่มือถ่ายภาพ',
  'nav.help': 'ช่วยเหลือ',
  'btn.bookNow': 'จองเลย',
  'btn.exploreTrips': 'ดูทริปทั้งหมด',
  'btn.viewTrip': 'ดูทริป',
  'btn.comingSoon': 'เร็วๆ นี้',
  'btn.tripCancelled': 'ทริปนี้งดจัดแล้ว',
  'btn.submit': 'ส่งการจอง',
  'btn.copy': 'คัดลอก',
  'btn.copied': 'คัดลอกแล้ว!',
  'form.name': 'ชื่อ',
  'form.nameTh': 'ชื่อ (ไทย)',
  'form.nameEn': 'ชื่อ (อังกฤษ)',
  'form.firstName': 'ชื่อ (First name)',
  'form.lastName': 'นามสกุล (Last name)',
  'form.email': 'อีเมล',
  'form.phone': 'เบอร์โทร',
  'form.passport': 'เลขหนังสือเดินทาง / เลขบัตรนักเรียน',
  'form.dietary': 'ข้อจำกัดอาหาร',
  'form.medical': 'โรคประจำตัว',
  'form.oshcProvider': 'ผู้ให้บริการ OSHC',
  'form.oshcExpiry': 'วันหมดอายุ OSHC',
  'form.dob': 'วันเดือนปีเกิด (ตรงกับพาสปอร์ต)',
  'form.emergencyName': 'ชื่อผู้ติดต่อฉุกเฉิน',
  'form.emergencyPhone': 'เบอร์โทรผู้ติดต่อฉุกเฉิน',
  'booking.selectTrip': 'เลือกทริป',
  'booking.deposit': 'มัดจำ',
  'booking.payment': 'ชำระ PayID',
  'booking.confirmation': 'จองสำเร็จแล้ว!',
  'booking.summary': 'สรุปทริป',
  'booking.reference': 'เลขที่การจอง',
  'booking.uploadSlip': 'อัปโหลดสลิป',
  'booking.success': 'Booking Confirmed!',
  'booking.waiverRequired': 'กรุณาลงนาม waiver ก่อนจอง',
  'common.loading': 'กำลังโหลด…',
  'common.error': 'เกิดข้อผิดพลาด กรุณาลองใหม่',
  'common.success': 'สำเร็จ',
  'common.retry': 'ลองอีกครั้ง',
  'common.required': 'จำเป็น',
  'common.seatsRemaining': 'ที่นั่งเหลือ',
  'common.fromPrice': 'เริ่มต้น',
  'common.full': 'เต็ม',
  'common.aurora': 'ทริปล่าแสงใต้',
  'common.standard': 'มาตรฐาน',
  'common.private': 'ส่วนตัว',
  'common.all': 'ทั้งหมด',
  'common.oneday': 'วันเดียว',
  'common.overnight': 'ค้างคืน',
  'common.multiday': 'หลายวัน',
  'common.clearSearch': 'ล้างคำค้นหา',
  'home.stats.trips': '13 ทริป',
  'home.stats.group': 'กลุ่มเล็ก 100%',
  'home.stats.photographers': 'ช่างภาพท้องถิ่น',
  'home.stats.tripsLabel': 'ทริป',
  'home.stats.groupLabel': 'ขนาดกลุ่ม',
  'home.stats.photographersLabel': 'ช่างภาพ',
  'home.hero.badge': 'ทริปถ่ายภาพพร้อมช่างภาพมืออาชีพ',
  'home.hero.title.line1': 'ทริปถ่ายภาพ',
  'home.hero.title.line2': 'ที่คุณจะไม่มีวันลืม',
  'home.hero.en.line1': 'Capture Moments',
  'home.hero.en.line2': 'Worth Showing Off',
  'home.hero.th.line1': 'ออกไปเก็บภาพ',
  'home.hero.th.line2': 'ที่ทุกคนอยากดู',
  'home.hero.subtitle':
    'ทริปถ่ายภาพทั่วออสเตรเลียและนิวซีแลนด์ จองครบ จบทุกขั้นตอน มีช่างภาพและทีมสไตล์ลิ่งดูแลตลอดทริป',
  'home.promo.eyebrow': 'Learn and Practice',
  'home.promo.title': 'ใหม่! คู่มือถ่ายภาพ — ท่าโพส กล้อง และมือถือ',
  'trips.title': 'เลือกทริปของคุณ',
  'trips.subtitle': 'กลุ่มเล็ก มีช่างภาพมืออาชีพทุกทริป',
  'trips.empty': 'ยังไม่มีทริปในหมวดนี้ — กลับมาเช็คใหม่เร็วๆ นี้',
  'trips.search': 'ค้นหาจุดหมาย',
  'trips.search.empty': 'ไม่พบทริปที่ตรงกับคำค้นหา',
  'trips.going': 'เจอเพื่อนร่วมทริป',
  'trips.going.note': 'เข้ากลุ่มแชท Facebook — รายชื่อผู้ร่วมทริปจริงจะมาทีหลัง',
  'trips.cat.popular': 'ยอดนิยม',
  'trips.cat.desert': 'ทะเลทราย',
  'trips.cat.flagship': 'เรือธง',
  'trips.cat.aurora': 'ล่าแสงใต้',
  'trips.cat.influencer': 'อินฟลู',
  'trips.seatsLeft': 'เหลือ',
  'trips.seatsFull': 'เต็ม',
  'detail.tab.details': 'รายละเอียด',
  'detail.tab.itinerary': 'เส้นทาง',
  'detail.tab.reviews': 'รีวิว',
  'detail.stat.duration': 'ระยะเวลา',
  'detail.stat.seats': 'ที่นั่ง',
  'detail.stat.perPerson': 'ต่อคน',
  'detail.stat.destination': 'ปลายทาง',
  'detail.stat.group': 'ขนาดกลุ่ม',
  'detail.stat.photographer': 'ช่างภาพมืออาชีพ',
  'detail.stat.photographerSub': 'ทุกทริป',
  'detail.highlights': 'ไฮไลท์',
  'detail.includes': 'รวมในราคา',
  'detail.excludes': 'ไม่รวม',
  'detail.accommodation': 'ที่พัก',
  'detail.prep': 'เตรียมตัวก่อนเดินทาง',
  'detail.photoGuide': 'อ่านคู่มือถ่ายภาพก่อนออกเดินทาง',
  'detail.swipePhotos': '↔ ปัดดูรูปเพิ่มเติม',
  'detail.moreTrips': 'ทริปแนะนำเพิ่มเติม',
  'detail.reviews.title': 'รีวิวจากลูกทริป',
  'detail.reviews.body':
    'เรายังไม่ลงรีวิวในเว็บ — อ่านคอมเมนต์และรูปจากลูกทริปจริงได้ที่เพจ Facebook ของเรา',
  'detail.reviews.cta': 'ดูรีวิวบน Facebook',
  'detail.fromPrice': 'เริ่มต้น',
  'home.hero.destination.tasmania': 'แทสเมเนีย',
  'home.hero.destination.uluru': 'อูลูรู',
  'home.hero.destination.sydney': 'ซิดนีย์',
  'home.hero.destination.newZealand': 'นิวซีแลนด์',
  'home.category.title': 'เลือกทริปที่ใช่',
  'home.category.viewPrefix': 'ดูทริป',
  'home.cta.title.line1': 'พร้อมสำหรับทริปถ่ายภาพ',
  'home.cta.title.line2': 'ครั้งต่อไปหรือยัง?',
  'home.cta.subtitle': 'กลุ่มเล็ก ช่างภาพจริง ทริปที่คุณจะไม่มีวันลืม',
  'home.faq.title': 'คำถามที่พบบ่อย',
  'home.faq.q1': 'ราคาทริปรวมอะไรบ้าง?',
  'home.faq.a1':
    'รถส่วนตัวพร้อมคนขับ, ช่างภาพมืออาชีพตลอดทริป, น้ำดื่ม และค่าเข้าอุทยาน/สถานที่ตามที่ระบุ ไม่รวมตั๋วเครื่องบิน อาหาร และประกันการเดินทาง เว้นแต่จะระบุไว้ในหน้าทริปนั้นๆ',
  'home.faq.q2': 'ต้องมีประกัน OSHC หรือประกันการเดินทางไหม?',
  'home.faq.a2':
    'แนะนำอย่างยิ่งให้มี และผู้ถือวีซ่านักเรียนต้องยืนยันว่า OSHC ของตัวเองครอบคลุมการเดินทางในประเทศ Trip2Talk ไม่ใช่ประกัน — ดูรายละเอียดเต็มในเอกสาร waiver',
  'home.faq.q3': 'กลุ่มขนาดเท่าไหร่?',
  'home.faq.a3':
    'เน้นกลุ่มเล็กโดยตั้งใจ — ปกติ 4-6 คนต่อทริป บางทริปพรีเมียมสามารถจัดแบบส่วนตัว 2-3 คนได้ในราคาที่สูงขึ้น เช็คในหน้าทริปนั้นๆ',
  'home.faq.q4': 'ขอห้องพักส่วนตัวได้ไหม?',
  'home.faq.a4':
    'ทริปมาตรฐานพักแบบห้องรวม (Dormitory) อัปเกรดเป็นห้องส่วนตัวได้ในเกือบทุกทริปโดยจ่ายเพิ่มต่อคืน — ทักแชทมาก่อนจองเพื่อจัดการให้',
  'home.faq.q5': 'ถ้าไม่เห็นแสงใต้หรือทางช้างเผือกล่ะ?',
  'home.faq.a5':
    'การเห็นแสงใต้หรือทางช้างเผือกขึ้นอยู่กับธรรมชาติ — ท้องฟ้าโปร่ง กิจกรรมสุริยะ (KP index) และไม่มีแสงรบกวน เราเลือกจุดและเวลาที่ดีที่สุดให้แล้ว แต่ไม่สามารถการันตีได้ และไม่มีการคืนเงินหากสภาพอากาศไม่เป็นใจ',
  'home.faq.q6': 'จ่ายเงินยังไง แล้วถ้าต้องยกเลิกล่ะ?',
  'home.faq.a6':
    'จองผ่าน PayID พร้อมมัดจำเพื่อล็อคที่นั่ง แล้วจ่ายส่วนที่เหลือก่อนวันเดินทาง เงื่อนไขการยกเลิก/คืนเงินแตกต่างกันไปตามทริป ดูรายละเอียดได้ในเอกสาร waiver ก่อนยืนยันการจอง',
  'home.featured': 'ทริปแนะนำ',
  'home.how.title': 'Trip2Talk ทำงานยังไง',
  'home.how.subtitle': 'ตั้งแต่เลือกวันเดินทาง จนได้รับรูปคืน — ครบทุกขั้นตอนที่นี่',
  'home.how.step1.title': 'เลือกทริปและวันเดินทาง',
  'home.how.step1.desc': 'ดูวันออกทริปจริง เช็คที่นั่งว่าง แล้วเลือกปลายทางที่ใช่สไตล์คุณ',
  'home.how.step2.title': 'มัดจำล็อคที่นั่ง',
  'home.how.step2.desc': 'โอนมัดจำผ่าน PayID ไม่ต้องสมัครสมาชิก ไม่ต้องโหลดแอป แค่โอนผ่านแอปธนาคาร',
  'home.how.step3.title': 'ออกเดินทางกับกลุ่ม',
  'home.how.step3.desc': 'พบกลุ่มเล็กและช่างภาพในวันเดินทาง รูปที่แต่งแล้วจะส่งให้หลังทริปจบ',
  'home.how.mock.status': 'ยืนยันมัดจำแล้ว',
  'home.showcase.title': 'ทริปจริง รูปจริง',
  'home.showcase.subtitle': 'ตัวอย่างทริปที่เปิดจองอยู่ตอนนี้',
  'home.showcase.cta': 'ดูทริปทั้งหมด',
  'favorites.subtitle': 'บันทึกไว้ในเครื่องนี้ — ไม่ต้องมีบัญชี',
  'favorites.empty': 'ยังไม่มีทริปที่บันทึก กดหัวใจบนการ์ดทริปเพื่อเซฟไว้ที่นี่',
  'favorites.stale': 'บางรหัสทริปที่บันทึกไว้ไม่มีในรายการแล้ว ลบออกได้ด้านล่าง',
  'favorites.remove': 'ลบ',
  'favorites.add': 'บันทึกทริป',
  'myTrip.subtitle':
    'ใส่เลขที่การจองหรือรหัสทริป พร้อมอีเมลหรือเบอร์ที่ใช้ตอนจอง',
  'myTrip.refOrCode': 'เลขที่การจอง หรือรหัสทริป',
  'myTrip.contact': 'อีเมล หรือเบอร์โทร',
  'myTrip.or': 'หรือ',
  'myTrip.lookup': 'ค้นหาทริปของฉัน',
  'myTrip.notFound': 'ไม่พบการจองที่ตรงกับเลขที่และข้อมูลติดต่อ ลองตรวจสอบอีกครั้ง',
  'myTrip.rpcMissing':
    'ระบบค้นหายังไม่พร้อม (ยังไม่ได้ deploy Edge Function) ทัก Facebook พร้อมเลขที่การจองได้เลย',
  'myTrip.error.reference': 'กรุณาใส่เลขที่การจอง',
  'myTrip.error.contact': 'กรุณาใส่อีเมลหรือเบอร์โทร',
  'myTrip.error.email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'myTrip.status': 'สถานะ',
  'myTrip.departure': 'วันเดินทาง',
  'myTrip.paid': 'ชำระแล้ว',
  'myTrip.balance': 'ยอดคงเหลือ',
  'myTrip.tripTotal': 'ราคารวมทริป',
  'myTrip.messageUs': 'ทัก Facebook เพื่อจัดไฟลต์ ผ่อนชำระ หรือจุดรับ',
  'home.features.title': 'ราคาทริป',
  'home.features.toggle.title': 'อยากได้กลุ่มส่วนตัวไหม?',
  'home.features.toggle.desc':
    'อัปเกรดเป็นที่นั่งกลุ่มส่วนตัว พร้อมโฟกัสช่างภาพและความยืดหยุ่นของเวลาในวันทริป',
  'home.features.price.unit': '/ คน',
  'home.features.price.note': 'ที่นั่งมาตรฐาน',
  'home.features.price.notePrivate': 'อัปเกรดส่วนตัว',
  'home.features.list.1': 'กลุ่มเล็กสูงสุด 6 คน',
  'home.features.list.2': 'ช่างภาพมืออาชีพทุกทริป',
  'home.features.list.3': 'รวมรถส่วนตัว',
  'home.features.list.4': 'ได้ชุดภาพแต่งหลังทริป',
  'home.features.duration': 'โดยทั่วไป 3D2N',
  'home.features.cta': 'จองทริป',
  'home.features.footer.title': 'Trip2Talk Pricing',
  'home.features.footer.sub': 'ราคา',
  'home.audience.title': 'ทริปนี้เหมาะกับใคร?',
  'home.audience.students': 'นักเรียนไทย',
  'home.audience.residents': 'PR & ผู้พำนัก',
  'home.audience.couples': 'คู่รัก',
  'home.audience.groups': 'กลุ่มเพื่อน',
  'pricing.compare': 'เปรียบเทียบ Standard vs Private',
  'pricing.standard.pax': '4–6 ท่าน',
  'pricing.standard.price': 'ราคาตามตาราง',
  'pricing.standard.desc': 'กลุ่มมาตรฐาน ราคาดีที่สุด รอครบจำนวนขั้นต่ำ',
  'pricing.standard.check.1': 'ราคาคุ้มค่าที่สุด',
  'pricing.standard.check.2': 'ช่างภาพมืออาชีพเหมือนกันทุกกลุ่ม',
  'pricing.standard.check.3': 'ออกเดินทางเมื่อครบกลุ่ม',
  'pricing.standard.cta': 'ดูทริปทั้งหมด',
  'pricing.private.badge': 'แนะนำ',
  'pricing.private.pax': '1–3 ท่าน',
  'pricing.private.price': 'ราคา Premium',
  'pricing.private.desc': 'รับประกันออกเดินทาง ยืดหยุ่นกำหนดการ',
  'pricing.private.check.1': 'รับประกันออกเดินทางแน่นอน ไม่ต้องรอครบกลุ่ม',
  'pricing.private.check.2': 'เลือกวันเดินทางเองได้',
  'pricing.private.check.3': 'ความเป็นส่วนตัวเต็มที่',
  'pricing.private.cta': 'จองทริปส่วนตัว',
  'pricing.page.subtitle': 'ตัวเลขเป็นตัวอย่าง — ราคาจริงดูได้ในแต่ละทริป',
  'pricing.mostPopular': 'ยอดนิยม',
  'pricing.audPerPerson': 'AUD / คน',
  'pricing.priceHint': 'จิ้มหรือโฮเวอร์ตัวเลขดูแอนิเมชัน',
  'pricing.tier.day.title': 'ทริปวันเดียว',
  'pricing.tier.day.desc': 'ไม่กี่ชั่วโมง ช่างภาพมืออาชีพหนึ่งคน โลจิสติกส์น้อย',
  'pricing.tier.day.check.1': 'เซสชันถ่ายภาพ 3 ชม.',
  'pricing.tier.day.check.2': 'ช่างภาพมืออาชีพท้องถิ่น',
  'pricing.tier.day.check.3': 'รูปแก้ไม่จำกัด',
  'pricing.tier.day.check.4': 'ส่งอัลบั้มออนไลน์',
  'pricing.tier.day.cta': 'จองทริปวันเดียว',
  'pricing.tier.multi.title': 'ทริปหลายวัน',
  'pricing.tier.multi.desc': '3–4 วัน รวมรถและคนขับ ช่วยจัดการที่พัก',
  'pricing.tier.multi.check.1': 'ทุกอย่างในทริปวันเดียว',
  'pricing.tier.multi.check.2': 'รวมรถ SUV และคนขับ',
  'pricing.tier.multi.check.3': 'ช่วยจองที่พัก',
  'pricing.tier.multi.check.4': 'ค่าเข้าอุทยานและใบอนุญาต',
  'pricing.tier.multi.cta': 'จองทริปหลายวัน',
  'pricing.tier.flagship.title': 'ทริปเรือธง',
  'pricing.tier.flagship.desc': '6 วัน ช่วยประสานตั๋วบิน ทริปเข้มข้นที่สุด',
  'pricing.tier.flagship.check.1': 'ทุกอย่างในทริปหลายวัน',
  'pricing.tier.flagship.check.2': 'ช่วยจองตั๋วเครื่องบิน',
  'pricing.tier.flagship.check.3': 'ที่พัก 5+ คืน',
  'pricing.tier.flagship.check.4': 'ทีมช่างภาพลำดับแรก',
  'pricing.tier.flagship.cta': 'จองทริปเรือธง',
  'pricing.cancel.title': 'นโยบายการยกเลิกและคืนเงิน',
  'pricing.cancel.intro':
    'Trip2Talk รับชำระผ่าน PayID (AUD) โดยมัดจำก่อนเดินทาง ราคาทั้งหมดเป็นดอลลาร์ออสเตรเลีย',
  'pricing.cancel.col.condition': 'เงื่อนไข',
  'pricing.cancel.col.outcome': 'ผลลัพธ์',
  'pricing.cancel.rule.1.condition': 'ยกเลิกล่วงหน้า 10 วันขึ้นไป',
  'pricing.cancel.rule.1.outcome': 'เลื่อนทริปหรือเก็บเครดิตสำหรับทริปถัดไป',
  'pricing.cancel.rule.2.condition': 'ยกเลิกล่วงหน้า 3–9 วัน',
  'pricing.cancel.rule.2.outcome': 'โอนสิทธิ์ให้ผู้อื่นเดินทางแทนเท่านั้น — ไม่คืนเงินสด',
  'pricing.cancel.rule.3.condition': 'ยกเลิกล่วงหน้า 0–2 วัน',
  'pricing.cancel.rule.3.outcome': 'ไม่คืนเงินทุกกรณี รวมมัดจำ',
  'pricing.cancel.rule.4.condition': 'สภาพอากาศ / เหตุสุดวิสัย',
  'pricing.cancel.rule.4.outcome': 'ออกเครดิตเต็มจำนวนสำหรับจองทริปครั้งถัดไป ไม่คืนเป็นเงินสด',
  'pricing.cancel.rule.5.condition': 'จำนวนผู้ร่วมทริปไม่ถึงขั้นต่ำ',
  'pricing.cancel.rule.5.outcome': 'อาจเลื่อนทริปหรือออกเครดิต — Trip2Talk จะแจ้งทาง SMS/อีเมล',
  'calendar.value.badge': 'จองมั่นใจ',
  'calendar.value.heading.line1': 'เลิกเดาสุ่มวันเดินทาง',
  'calendar.value.heading.line2': 'จองแบบมั่นใจ',
  'calendar.value.negative.1': 'ไม่รู้ว่าคนจะครบกลุ่มไหม',
  'calendar.value.negative.2': 'เช็ควันว่างยาก',
  'calendar.value.negative.3': 'ที่นั่งเต็มแล้วไม่รู้ล่วงหน้า',
  'calendar.value.negative.4': 'ราคาไม่ชัดเจน',
  'calendar.value.negative.5': 'ไม่มีปฏิทินรวมดูทริป',
  'calendar.value.positive.1': 'ปฏิทินเดียวเห็นที่นั่งจริง',
  'calendar.value.positive.2': 'ราคาชัดเจน',
  'calendar.value.positive.3': 'ที่นั่งอัปเดตเรียลไทม์',
  'calendar.value.positive.4': 'กลุ่มเล็กยืนยันแล้ว',
  'calendar.value.positive.5': 'จองออนไลน์ได้ทันที',
  'calendar.photo.eyebrow': 'ทุกทริปมีทีมช่างภาพมืออาชีพ',
  'calendar.photo.heading.line1': 'ไปตัวเปล่า',
  'calendar.photo.heading.line2': 'กลับมาพร้อมรูปสวยเป็นร้อย',
  'calendar.photo.sub':
    'ช่างภาพมืออาชีพและตู้เสื้อผ้าสไตล์ลิ่งพร้อมไปด้วยทุกทริป ไม่ต้องพกกล้อง ไม่ต้องคิดว่าจะใส่ชุดอะไร',
  'calendar.photo.feature.1.title': 'ช่างภาพมืออาชีพ',
  'calendar.photo.feature.1.desc': 'ไปด้วยทุกทริป ทุกกลุ่ม ไม่มีค่าใช้จ่ายเพิ่ม',
  'calendar.photo.feature.2.title': 'ตู้เสื้อผ้า+สไตล์ลิ่งพร้อม',
  'calendar.photo.feature.2.desc': 'มีชุดและของประกอบฉากให้เลือก แค่มาเลือกลุค',
  'calendar.photo.feature.3.title': 'ได้ไฟล์ภาพความละเอียดสูง',
  'calendar.photo.feature.3.desc': 'รูปไฟล์เต็ม พร้อมโพสต์ตั้งแต่ทริปยังไม่จบ',
  'calendar.trips.badge': 'เปิดจองแล้ว',
  'calendar.banner.title': 'ทุกทริปมีช่างภาพ · พร้อมทีมสไตล์ลิ่ง',
  'calendar.banner.sub': 'พร้อมทีมสไตล์ลิ่ง/wardrobe ดูแลตลอดทริป',
  'calendar.empty': 'ไม่มีทริปในเดือนนี้',
  'calendar.moreDestinations': 'ทริปอื่นๆ ที่น่าสนใจ',
  'gallery.empty': 'ยังไม่มีรูปในแกลเลอรี',
  'gallery.emptyCategory': 'ไม่มีรูปในหมวดนี้',
  'gallery.exampleAlbum': 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
  'gallery.inspiration': 'แรงบันดาลใจ',
  'photoGuide.back': 'กลับไปหน้าคลังเคล็ดลับ',
  'photoGuide.hub.badge': 'มาเรียนรู้และฝึกฝนไปด้วยกัน',
  'photoGuide.hub.title': 'คลังเคล็ดลับถ่ายภาพ',
  'photoGuide.hub.subtitle':
    'สามคู่มือสำหรับสามสไตล์นักเดินทาง — ลิงก์จากหน้าแรกและหน้าเตรียมตัว',
  'photoGuide.readGuide': 'อ่านคู่มือ →',
  'photoGuide.hub.albumTitle': 'อัลบั้มรูปจากพี่แสน',
  'photoGuide.hub.albumSub': 'รูปคัดสรรจากทริปที่ผ่านมา — ลากหรือดูสไลด์ด้านล่าง',
  'photoGuide.hub.dragHint': '↔ ลากเพื่อดูอัลบั้ม',
  'photoGuide.swipeMore': 'ปัดเพื่อดูเพิ่ม →',
  'photoGuide.fromTheRoad': 'จากทริปจริง',
  'photoGuide.posing.eyebrow': 'คลังเคล็ดลับ · โพสท่า',
  'photoGuide.posing.title': 'คู่มือโพสท่า & แต่งตัว',
  'photoGuide.posing.sub':
    'สำหรับลูกทริปที่ชอบอยู่หน้ากล้อง — ดูอัลบั้มตัวอย่างก่อน แล้วตามด้วยท่าโพสและโทนเสื้อผ้าตามฤดูกาล',
  'photoGuide.posing.posesTitle': 'ท่าโพสแนะนำจากช่างภาพ',
  'photoGuide.posing.seasonTitle': 'โทนเสื้อผ้าตามฤดูกาล',
  'photoGuide.posing.seasonSub':
    'จับคู่กับทริปจริงของ Trip2Talk ให้ชุดเข้ากับวิวที่คุณจะถ่าย',
  'photoGuide.posing.quote':
    '“ไม่ต้องพยายามเป็นนางแบบ — พยายามให้ดูเหมือนวันที่สนุกที่สุดของทริป นั่นคือภาพที่คนหยุดเลื่อนดู”',
  'photoGuide.posing.quoteBy': 'ช่างภาพหลักของ Trip2Talk',
  'photoGuide.camera.eyebrow': 'คลังเคล็ดลับ · ตั้งค่ากล้อง',
  'photoGuide.camera.title': 'คู่มือตั้งค่ากล้อง',
  'photoGuide.camera.sub':
    'ค่าเริ่มต้นสำหรับมือใหม่พก DSLR/mirrorless — จากแสงเช้าถึงดาว ทางช้างเผือก และแสงใต้ในทริป NZ & แทสเมเนีย',
  'photoGuide.camera.examples': 'ตัวอย่างภาพจากทริปของพี่แสน',
  'photoGuide.camera.table.scene': 'ช่วงเวลา/ฉาก',
  'photoGuide.camera.table.aperture': 'รูรับแสง (f)',
  'photoGuide.camera.table.shutter': 'ชัตเตอร์',
  'photoGuide.camera.table.iso': 'ISO',
  'photoGuide.camera.table.notes': 'หมายเหตุ',
  'photoGuide.camera.disclaimer':
    'เป็นค่าเริ่มต้นเท่านั้น ปรับตามเลนส์และกล้องของแต่ละคน',
  'photoGuide.camera.gear': 'อุปกรณ์เบื้องต้นที่ควรมี',
  'photoGuide.mobile.eyebrow': 'คลังเคล็ดลับ · มือถือ',
  'photoGuide.mobile.title': 'คู่มือถ่ายภาพด้วยมือถือ',
  'photoGuide.mobile.sub':
    'ไม่ต้องมีอุปกรณ์เพิ่ม — เทคนิคทิวทัศน์และพอร์ตเทรตที่ลูกทริปใช้ได้แค่ด้วยมือถือ',
  'photoGuide.mobile.landscape': 'ถ่ายวิว',
  'photoGuide.mobile.portrait': 'ถ่ายคน',
  'photoGuide.follow': 'ติดตามเรา',
  'favorites.saved': 'บันทึกไว้',
  'favorites.savedTripsLabel': 'ทริป',
  'trips.suggested': 'ทริปที่คุณอาจสนใจ',
  'account.guestBadge': 'บัญชีผู้เยี่ยมชม Trip2Talk',
  'account.guestSub': 'จองแบบแขก — ไม่ต้องล็อกอิน',
  'account.language': 'ภาษา',
  'about.positioning': 'เราคือใคร',
  'about.page.eyebrow': 'เกี่ยวกับ Trip2Talk',
  'about.page.title': 'เกี่ยวกับ Trip2Talk',
  'about.hero.heading': 'ทริปถ่ายภาพ ที่จัดการให้ครบทุกขั้นตอน',
  'about.hero.story':
    'Trip2Talk เริ่มจากไอเดียง่ายๆ ว่านักเดินทางไม่ควรต้องเลือกระหว่างการไปเที่ยวกับการได้ภาพสวยๆ ทุกทริปมีกลุ่มเล็ก (สูงสุด 6 คน) พร้อมช่างภาพมืออาชีพและทีมสไตล์ลิ่งดูแล คุณแค่โฟกัสกับช่วงเวลานั้น',
  'about.hero.stat.trips': 'ทริป',
  'about.hero.stat.photographers': 'ช่างภาพ',
  'about.hero.stat.travelers': 'นักเดินทาง',
  'about.saen.bio':
    'สวัสดีครับ ผม Saen ช่างภาพผู้หลงใหลในความงามของธรรมชาติและแสงสี ผมเริ่มต้นการเดินทางบนเส้นทางสายการถ่ายภาพด้วยการเรียนรู้ด้วยตนเอง และด้วยความรักในการถ่ายภาพ ผมได้พบกับกลุ่มคนไทยในซิดนีย์ที่มีความสนใจในสิ่งเดียวกัน\n\nตลอด 10 ปีที่ผ่านมา ผมได้พัฒนาทักษะการถ่ายภาพทิวทัศน์อย่างต่อเนื่อง — ผมเชื่อว่าการถ่ายภาพไม่ใช่แค่การบันทึกภาพ แต่เป็นการบันทึกเรื่องราว ความรู้สึก และประสบการณ์',
  'about.ploy.bio':
    'Monsicha Chayakorn (พลอย) — Admin & Trip Staff ดูแลการประสานงานคิวจอง และดูแลลูกทริปให้พร้อมก่อนออกเดินทาง',
  'about.whatToKnow.title': 'สิ่งที่ควรรู้',
  'about.whatToKnow.body':
    'เราไม่ใช่บริษัททัวร์ บริการของเราคือ Photo Trip — เน้นการเดินทางเพื่อถ่ายภาพเป็นหลัก ที่พักเป็นแบบ Hostel/Backpacker/Motel เน้นสะอาดปลอดภัย หากต้องการอัปเกรดห้องพักส่วนตัวสามารถแจ้งและจ่ายเพิ่มได้ อาหารไม่รวมในแพ็กเกจ',
  'about.contact.studio': 'สตูดิโอ',
  'about.contact.hours': 'จันทร์–ศุกร์ 10:00–17:00',
  'about.contact.footer': 'ABN 81 951 461 769 · Chapter 99 Photography',
  'about.stats.heading.line1': 'เกี่ยวกับ',
  'about.stats.heading.line2': 'ทีมงานของเรา',
  'about.stats.intro':
    'Trip2Talk คือแบรนด์ทริปถ่ายภาพสำหรับคนไทยในออสเตรเลีย — กลุ่มเล็ก ช่างภาพจริง และการเดินทางที่น่าจดจำ',
  'about.stats.1.label': 'ทริป',
  'about.stats.1.desc': 'ทริปถ่ายภาพกลุ่มเล็กทั่วออสเตรเลียและนิวซีแลนด์',
  'about.stats.2.label': 'กลุ่มเล็ก',
  'about.stats.2.desc': 'ทุกทริปเป็นกลุ่มเล็กเสมอ ไม่ใช่ทัวร์บัสใหญ่',
  'about.stats.3.label': 'ช่างภาพ',
  'about.stats.3.desc': 'ช่างภาพมืออาชีพท้องถิ่นทุกทริป',
  'about.destinations': 'จุดหมายของเรา',
  'about.oshc': 'OSHC และวีซ่า',
  'about.contact': 'ติดต่อ',
  'about.crew': 'พบกับ Saen',
  'about.tips': 'เคล็ดลับ — ล่าแสงออโรร่า',
  'waiver.title': 'เอกสารยินยอม',
  'waiver.signName': 'พิมพ์ชื่อ-นามสกุลเป็นลายเซ็นดิจิทัล',
  'safety.title': 'ข้อมูลเพื่อความปลอดภัย',
  'safety.subtitle': 'สำหรับไกด์ใช้ตอนฉุกเฉิน — กรอกสั้นๆ พอ',
  'safety.emergencyName': 'ชื่อผู้ติดต่อฉุกเฉิน',
  'safety.emergencyPhone': 'เบอร์ผู้ติดต่อฉุกเฉิน',
  'safety.allergies': 'แพ้อาหาร / สาร',
  'safety.allergies.ph': 'เช่น ถั่วลิสง หรือ none',
  'safety.medical': 'โรคประจำตัว',
  'safety.medical.ph': 'เช่น หอบหืด หรือ none',
  'safety.insuranceProvider': 'บริษัทประกันการเดินทาง',
  'safety.insuranceProvider.ph': 'ชื่อบริษัท',
  'safety.insurancePolicy': 'เลขกรมธรรม์',
  'safety.insurancePolicy.ph': 'เลขกรมธรรม์ / สมาชิก',
  'safety.otherNotes': 'อื่นๆ ที่ควรรู้',
  'safety.otherNotes.ph': 'เช่น ว่ายน้ำไม่ได้ กลัวความสูง มีข้อจำกัดการเคลื่อนไหว',
  'safety.emergencyRequired': 'ต้องกรอกชื่อและเบอร์ผู้ติดต่อฉุกเฉิน',
  'safety.insuranceType': 'ประเภทประกัน',
  'safety.oshcMembership': 'เลขสมาชิก OSHC',
  'safety.oshcRiskRequired': 'กรุณายืนยันการรับทราบความเสี่ยง OSHC',
  'safety.travelProvider': 'บริษัทประกันการเดินทาง',
  'safety.travelPolicy': 'เลขกรมธรรม์ประกันเดินทาง',
  'safety.flightToggle': 'ให้ทีมจองตั๋วบินให้',
  'safety.flightNzNote':
    'หนังสือเดินทางและสัญชาติจำเป็นสำหรับเที่ยวบิน NZ เท่านั้น — ไม่ต้องใช้สำหรับบินในออสฯ',
  'safety.flightFirst': 'ชื่อจริงตามพาสปอร์ต',
  'safety.flightLast': 'นามสกุลตามพาสปอร์ต',
  'safety.flightDob': 'วันเกิด',
  'safety.flightPassport': 'เลขหนังสือเดินทาง',
  'safety.flightNationality': 'สัญชาติ',
  'safety.flightFf': 'เลขสมาชิกสายการบิน (ถ้ามี)',
  'confirm.title': 'สรุปการยืนยันการจอง',
  'confirm.subtitle': 'เช็กลิสต์การจอง — ไม่รวมใบกำกับภาษี',
  'confirm.noInvoice':
    'ไม่มีใบกำกับภาษีในหน้านี้ — ส่งแยกตามแต่ละครั้งที่ชำระ',
  'confirm.nextTitle': 'ขั้นตอนถัดไป',
  'confirm.next.1': 'โอนมัดจำผ่าน PayID แล้วส่งสลิปทาง Facebook',
  'confirm.next.2': 'เรายืนยันที่นั่งและเชิญเข้ากลุ่มแชททริป',
  'confirm.next.3': 'ก่อนเดินทาง ดู Trip Prep สำหรับของที่ต้องเตรียมและจุดนัดพบ',
  'confirm.check.deposit': 'ชำระมัดจำแล้ว',
  'confirm.check.waiver': 'ลงนาม waiver แล้ว',
  'confirm.check.safety': 'มีข้อมูลความปลอดภัยแล้ว',
  'confirm.check.facebook': 'ทัก Facebook หาเรา',
  'confirm.download': 'ดาวน์โหลดสรุป (PNG)',
  'confirm.email': 'เปิด Gmail เพื่อแชร์',
  'confirm.open': 'เปิดสรุปการยืนยัน',
  'staff.safety.quickView': 'ข้อมูลฉุกเฉินวันทริป',
  'staff.safety.none': 'ไม่มีบันทึกความปลอดภัย',
  'staff.safety.allergies': 'แพ้',
  'staff.safety.medical': 'สุขภาพ',
  'staff.safety.insurance': 'ประกัน',
  'staff.safety.notes': 'หมายเหตุ',
  'staff.payments.title': 'การชำระของลูกค้า',
  'staff.payments.search': 'ค้นหาด้วยชื่อลูกค้า',
  'staff.payments.progress': 'ความคืบหน้างวด',
  'staff.payments.add': 'เพิ่มงวด',
  'staff.payments.markPaid': 'บันทึกว่าจ่ายแล้ว',
  'staff.income.title': 'รายได้ (งวดที่จ่ายแล้ว)',
  'lang.toggle': 'EN',
  'validation.email': 'กรุณากรอกอีเมลที่ถูกต้อง',
  'validation.phone': 'ใช้รูปแบบมือถือออสเตรเลีย: 04XX XXX XXX',
  'validation.required': 'กรุณากรอกข้อมูลนี้',
  'validation.waiverClauses': 'กรุณายอมรับข้อตกลงทั้งหมด',
  'booking.rlsError': 'ไม่สามารถบันทึกการจองได้ กรุณาติดต่อ Trip2Talk ทาง Messenger',
  'booking.seatsFull': 'ที่นั่งเต็มแล้วครับ กรุณาเลือกทริปอื่น',
  'pin.locked': 'ลองใหม่ใน',
  'pin.invalid': 'PIN ไม่ถูกต้อง',
  'pin.connection': 'เชื่อมต่อไม่สำเร็จ',
  'pin.welcome': 'ยินดีต้อนรับกลับมา!',
  'toast.bookingSuccess': 'ส่งการจองสำเร็จ!',
  'toast.bookingFailed': 'การจองล้มเหลว กรุณาลองใหม่',
  'toast.paymentUpdated': 'อัปเดตสถานะการชำระเงินแล้ว',
  'toast.paymentFailed': 'อัปเดตสถานะไม่สำเร็จ',
  'contact.findUs': 'ติดต่อเรา',
  'contact.facebook': 'Facebook',
  'contact.facebook.sub': 'ติดตามเราได้ที่นี่',
  'contact.messenger': 'Messenger',
  'contact.messenger.sub': 'แชทกับเรา',
  'contact.email': 'อีเมล',
  'contact.email.sub': 'ส่งข้อความถึงเรา',
  'contact.phone': 'โทร',
  'contact.phone.sub': '0452 044 382',
  'contact.line': 'Line',
  'contact.line.sub': 'เพิ่มเพื่อนบน Line',
  'contact.googleReviews': 'Google Reviews',
  'contact.googleReviews.sub': 'ดูรีวิวจากลูกค้า',
  'footer.tagline.line1': 'ทริปถ่ายภาพส่วนตัว,',
  'footer.tagline.line2': 'นำโดยช่างภาพจริง.',
  'footer.social.label': 'ติดตามเรา!',
  'footer.lucky.text': 'จองเลย!',
  'footer.nav.title1': 'เมนู',
  'footer.nav.title2': 'ข้อมูล',
  'footer.nav.title3': 'ติดต่อเรา',
  'footer.info.terms': 'เงื่อนไขการใช้งาน',
  'footer.info.privacy': 'นโยบายความเป็นส่วนตัว',
  'footer.info.cancellation': 'นโยบายการยกเลิก',
  'footer.info.payment': 'วิธีการชำระเงิน',
  'footer.info.help': 'ช่วยเหลือ',
  'footer.info.contact': 'ติดต่อเรา',
  'footer.info.portal': 'พอร์ทัลพนักงาน',
  'footer.bottom.cta.line1': 'มีคำถามเพิ่มเติม?',
  'footer.bottom.cta.line2': 'ทักทายสอบถามรายละเอียดเพิ่มเติมที่ FB Messenger',
  'footer.subscribe.placeholder': 'กรอกอีเมลของคุณ',
  'footer.subscribe.button': 'เปิดเพจ Trip2Talk',
  'footer.subscribe.toast': 'ขอบคุณ! เราจะติดต่อกลับเร็วๆ นี้',
  'footer.copyright': '© 2025 Trip2Talk. สงวนลิขสิทธิ์.',
}

export const translations: Record<Lang, Map> = { en, th }
