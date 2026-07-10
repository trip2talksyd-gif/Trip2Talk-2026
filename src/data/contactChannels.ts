import type { LucideIcon } from 'lucide-react'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { TranslationKey } from '../i18n/translations'
import { FacebookIcon } from '../components/contact/contactIcons'

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
    href: 'https://www.facebook.com/profile.php?id=61586534972406',
    external: true,
    icon: FacebookIcon,
    labelKey: 'contact.facebook',
    subtextKey: 'contact.facebook.sub',
  },
  {
    id: 'messenger',
    enabled: true,
    href: 'https://m.me/61586534972406',
    external: true,
    icon: MessageCircle,
    labelKey: 'contact.messenger',
    subtextKey: 'contact.messenger.sub',
  },
  {
    id: 'email',
    enabled: true,
    href: 'mailto:chapter99solutions@gmail.com',
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
