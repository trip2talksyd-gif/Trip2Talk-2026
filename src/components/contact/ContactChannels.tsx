import { enabledContactChannels } from '../../data/contactChannels'
import { useLang } from '../../hooks/useLang'

type Props = {
  variant?: 'dark' | 'light'
}

export default function ContactChannels({ variant = 'dark' }: Props) {
  const { t } = useLang()
  const channels = enabledContactChannels()
  const isDark = variant === 'dark'

  return (
    <section className="mb-4">
      <h2
        className={`font-serif text-sm ${isDark ? 'text-cream' : 'text-brand-dark'}`}
      >
        {t('contact.findUs')}
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {channels.map(({ id, href, external, icon: Icon, labelKey, subtextKey }) => (
          <li key={id}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex flex-col items-center text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-deep-green text-gold shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                <Icon className="h-5 w-5" {...(id === 'facebook' ? {} : { strokeWidth: 1.75 })} />
              </span>
              <span
                className={`mt-2 text-[11px] font-medium ${isDark ? 'text-cream' : 'text-brand-dark'}`}
              >
                {t(labelKey)}
              </span>
              <span
                className={`mt-0.5 text-[10px] leading-snug ${isDark ? 'text-cream-muted' : 'text-brand-dark/60'}`}
              >
                {t(subtextKey)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
