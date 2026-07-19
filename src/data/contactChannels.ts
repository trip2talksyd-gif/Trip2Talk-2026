import type { LucideIcon } from 'lucide-react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { TranslationKey } from '../i18n/translations'
import { FacebookIcon } from '../components/contact/contactIcons'

/** Canonical Trip2Talk Facebook Page — update only here. */
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/TriptoTalk'

/** Messenger deep-link for the same Page (username form). */
export const FACEBOOK_MESSENGER_URL = 'https://m.me/TriptoTalk'

export type ContactChannelId =
  | 'facebook'
  | 'messenger'
  | 'email'
  | 'phone'
  | 'line'
  | 'googleReviews'

export type ContactChannel = {
  id: ContactChannelId
  enabled: boolean
  href: string
  external?: boolean
  icon: LucideIcon | typeof FacebookIcon
  labelKey: TranslationKey
  subtextKey: TranslationKey
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'facebook',
    enabled: true,
    href: FACEBOOK_PAGE_URL,
    external: true,
    icon: FacebookIcon,
    labelKey: 'contact.facebook',
    subtextKey: 'contact.facebook.sub',
  },
  {
    id: 'messenger',
    enabled: true,
    href: FACEBOOK_MESSENGER_URL,
    external: true,
    icon: MessageCircle,
    labelKey: 'contact.messenger',
    subtextKey: 'contact.messenger.sub',
  },
  {
    id: 'email',
    enabled: true,
    href: 'mailto:trip2talksyd@gmail.com',
    icon: Mail,
    labelKey: 'contact.email',
    subtextKey: 'contact.email.sub',
  },
  {
    id: 'phone',
    enabled: true,
    href: 'tel:+61452044382',
    icon: Phone,
    labelKey: 'contact.phone',
    subtextKey: 'contact.phone.sub',
  },
  {
    id: 'line',
    enabled: false,
    href: '',
    external: true,
    icon: MessageCircle,
    labelKey: 'contact.line',
    subtextKey: 'contact.line.sub',
  },
  {
    id: 'googleReviews',
    enabled: false,
    href: '',
    external: true,
    icon: MessageCircle,
    labelKey: 'contact.googleReviews',
    subtextKey: 'contact.googleReviews.sub',
  },
]

export function enabledContactChannels(): ContactChannel[] {
  return CONTACT_CHANNELS.filter((c) => c.enabled && c.href)
}
