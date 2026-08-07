import { Link } from 'react-router-dom'
import { Lock, MessageCircle } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  CONTACT_CHANNELS,
  enabledSocialProfiles,
  FACEBOOK_MESSENGER_URL,
} from '../../data/contactChannels'
import type { TranslationKey } from '../../i18n/translations'
import BrandLogo from '../brand/BrandLogo'
import { FooterPaymentIcons } from '../booking/SquareAcceptedPaymentIcons'

const STREET_ADDRESS = '33/14 Jubilee Ave, Warriewood NSW 2102'
const ABN = 'ABN 81 951 461 769'

const navLinks: { to: string; key: TranslationKey }[] = [
  { to: '/trips', key: 'nav.trips' },
  { to: '/gallery', key: 'nav.gallery' },
  { to: '/calendar', key: 'nav.calendar' },
  { to: '/pricing', key: 'nav.pricing' },
  { to: '/about', key: 'nav.about' },
]

const infoLinks: { to: string; key: TranslationKey }[] = [
  { to: '/terms', key: 'footer.info.terms' },
  { to: '/privacy', key: 'footer.info.privacy' },
  { to: '/cancellation', key: 'footer.info.cancellation' },
  { to: '/payment-methods', key: 'footer.info.payment' },
  { to: '/help', key: 'footer.info.help' },
  { to: '/account', key: 'footer.info.contact' },
]

/** Email + phone straight from the canonical channel list, shown as plain values. */
const directChannels = CONTACT_CHANNELS.filter(
  (c) => c.enabled && c.href && (c.id === 'email' || c.id === 'phone'),
)

const colHeading = 'mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-white'
const colLink =
  'mb-2.5 block text-[12px] text-[#a9c4bd] no-underline transition-colors hover:text-white'

export default function PublicFooter() {
  const { t, lang } = useLang()
  const socials = enabledSocialProfiles()

  return (
    <footer className="site-footer bg-teal-900 px-6 pb-6 pt-10 text-[#cfe4de] sm:px-10">
      <div className="mx-auto max-w-[1150px]">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <div className="mb-2 flex items-center gap-2 font-thai text-[17px] font-bold text-white">
              <BrandLogo size="sm" tone="dark" withWordmark decorative wordmarkClassName="text-white" />
            </div>
            <p className="max-w-[260px] text-[11.5px] leading-[1.7] text-[#a9c4bd]">
              {t('footer.tagline.line1')} {t('footer.tagline.line2')}
              <span className="mt-1.5 block font-thai text-[11px] text-[#7a9791]">
                {lang === 'th'
                  ? 'ทริปถ่ายภาพทั่วออสเตรเลียและนิวซีแลนด์ พร้อมช่างภาพมืออาชีพที่เป็นทั้ง Trip Leader และคนขับทุกทริป'
                  : 'Photo trips across Australia & New Zealand — one pro photographer who guides and drives every trip.'}
              </span>
            </p>
          </div>

          <div>
            <h4 className={colHeading}>{t('footer.nav.title1')}</h4>
            {navLinks.map(({ to, key }) => (
              <Link key={to} to={to} className={colLink}>
                {t(key)}
              </Link>
            ))}
          </div>

          <div>
            <h4 className={colHeading}>{t('footer.nav.title2')}</h4>
            {infoLinks.map(({ to, key }) => (
              <Link key={key} to={to} className={colLink}>
                {t(key)}
              </Link>
            ))}
            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#7a9791]">
                {lang === 'th' ? 'รับชำระ' : 'We accept'}
              </p>
              <FooterPaymentIcons />
            </div>
          </div>

          <div>
            <h4 className={colHeading}>{t('footer.nav.title3')}</h4>
            {directChannels.map((channel) => (
              <a key={channel.id} href={channel.href} className={colLink}>
                {channel.href.replace(/^(mailto:|tel:)/, '')}
              </a>
            ))}
            <p className={`${colLink} hover:text-[#a9c4bd]`}>{STREET_ADDRESS}</p>
            <a
              href={FACEBOOK_MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 rounded-[9px] bg-[#0d0d0f] px-[15px] py-[7px] text-[11px] font-bold leading-[1.3] text-white transition-transform duration-150 hover:-translate-y-px"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              {t('footer.subscribe.button')}
            </a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h3 className="font-serif text-[15.5px] text-white">
            {t('footer.social.label')}
            <span className="mt-0.5 block font-thai text-[12.5px] font-medium text-[#a9c4bd]">
              {lang === 'th' ? 'Follow Trip2Talk' : 'ติดตามเรา'}
            </span>
          </h3>
          <div className="mt-4 flex justify-center gap-[18px]">
            {socials.map((social) => {
              const Icon = social.icon
              return (
                <div
                  key={social.id}
                  className="social-tile-item flex flex-col items-center gap-2"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`social-tile ${social.tile}`}
                  >
                    <span className="fold" aria-hidden />
                    <Icon />
                  </a>
                  <span className="social-tile-label">{social.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-[18px] text-[10.5px] text-[#7a9791]">
          <span>
            {t('footer.copyright')} · {ABN}
          </span>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 font-thai no-underline transition-colors hover:text-white"
            aria-label="Staff PIN login"
          >
            <Lock className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
            {t('footer.info.portal')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
