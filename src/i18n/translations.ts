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
  | 'btn.viewTrip'
  | 'btn.comingSoon'
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
  | 'trips.subtitle'
  | 'trips.empty'
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
  | 'about.positioning'
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
  'btn.viewTrip': 'View Trip',
  'btn.comingSoon': 'Coming soon',
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
  'form.passport': 'Passport Number',
  'form.dietary': 'Dietary Requirements',
  'form.medical': 'Medical Conditions',
  'form.oshcProvider': 'OSHC Provider',
  'form.oshcExpiry': 'OSHC Expiry Date',
  'booking.selectTrip': 'Select a trip',
  'booking.deposit': 'Deposit due',
  'booking.payment': 'PayID Payment',
  'booking.confirmation': 'Booking Confirmation',
  'booking.summary': 'Trip Summary',
  'booking.reference': 'Booking Reference',
  'booking.uploadSlip': 'Upload payment slip',
  'booking.success': 'Booking submitted! We will verify your PayID deposit shortly.',
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
  'home.stats.trips': '13 Trips',
  'home.stats.group': '100% Small Group',
  'home.stats.photographers': 'Local Photographers',
  'home.stats.tripsLabel': 'Trips',
  'home.stats.groupLabel': 'Group size',
  'home.stats.photographersLabel': 'Photographers',
  'home.hero.badge': '13 curated trips · small groups only · pro photographer on every trip',
  'home.hero.title.line1': 'Photo journeys',
  'home.hero.title.line2': 'worth remembering',
  'home.hero.en.line1': 'Capture Moments',
  'home.hero.en.line2': 'Worth Showing Off',
  'home.hero.th.line1': 'จับภาพโมเมนต์',
  'home.hero.th.line2': 'ที่อยากอวด',
  'home.hero.subtitle':
    'From aurora hunts in Tasmania to sunrise over Uluru — private, small-group trips with a professional photographer, built for Thai travellers in Australia.',
  'home.promo.eyebrow': "Let's Learn and Practice",
  'home.promo.title': 'Photo Guide — posing, settings & mobile tips',
  'trips.subtitle': 'Small groups, pro photographer on every trip.',
  'trips.empty': 'No trips in this category yet — check back soon.',
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
  'about.positioning': 'Who we are',
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
  'waiver.title': 'Digital Waiver',
  'waiver.signName': 'Type your full name as digital signature',
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
  'btn.viewTrip': 'ดูทริป',
  'btn.comingSoon': 'เร็วๆ นี้',
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
  'form.passport': 'เลขหนังสือเดินทาง',
  'form.dietary': 'ข้อจำกัดอาหาร',
  'form.medical': 'โรคประจำตัว',
  'form.oshcProvider': 'ผู้ให้บริการ OSHC',
  'form.oshcExpiry': 'วันหมดอายุ OSHC',
  'booking.selectTrip': 'เลือกทริป',
  'booking.deposit': 'มัดจำ',
  'booking.payment': 'ชำระ PayID',
  'booking.confirmation': 'ยืนยันการจอง',
  'booking.summary': 'สรุปทริป',
  'booking.reference': 'เลขที่การจอง',
  'booking.uploadSlip': 'อัปโหลดสลิป',
  'booking.success': 'ส่งการจองแล้ว! เราจะตรวจสอบมัดจำ PayID ของคุณเร็วๆ นี้',
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
  'home.stats.trips': '13 ทริป',
  'home.stats.group': 'กลุ่มเล็ก 100%',
  'home.stats.photographers': 'ช่างภาพท้องถิ่น',
  'home.stats.tripsLabel': 'ทริป',
  'home.stats.groupLabel': 'ขนาดกลุ่ม',
  'home.stats.photographersLabel': 'ช่างภาพ',
  'home.hero.badge': '13 ทริปคัดสรร · กลุ่มเล็กเท่านั้น · มีช่างภาพมืออาชีพทุกทริป',
  'home.hero.title.line1': 'ทริปถ่ายภาพ',
  'home.hero.title.line2': 'ที่คุณจะไม่มีวันลืม',
  'home.hero.en.line1': 'Capture Moments',
  'home.hero.en.line2': 'Worth Showing Off',
  'home.hero.th.line1': 'จับภาพโมเมนต์',
  'home.hero.th.line2': 'ที่อยากอวด',
  'home.hero.subtitle':
    'ตั้งแต่ล่าแสงใต้ที่แทสเมเนีย ถึงพระอาทิตย์ขึ้นที่อูลูรู — ทริปกลุ่มเล็กส่วนตัว พร้อมช่างภาพมืออาชีพ ออกแบบมาเพื่อคนไทยในออสเตรเลียโดยเฉพาะ',
  'home.promo.eyebrow': 'Learn and Practice',
  'home.promo.title': 'คู่มือถ่ายภาพ — โพสท่า ตั้งค่ากล้อง และมือถือ',
  'trips.subtitle': 'กลุ่มเล็ก มีช่างภาพมืออาชีพทุกทริป',
  'trips.empty': 'ยังไม่มีทริปในหมวดนี้ — กลับมาเช็คใหม่เร็วๆ นี้',
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
  'about.positioning': 'เราคือใคร',
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
  'waiver.title': 'ข้อตกลงดิจิทัล',
  'waiver.signName': 'พิมพ์ชื่อ-นามสกุลเป็นลายเซ็นดิจิทัล',
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
