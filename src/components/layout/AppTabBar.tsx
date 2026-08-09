import { NavLink, useLocation } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'

/** SVG line icons — matched to Trip2Talk-Discover-Tab-v3-Brand-Icons-Mockup.html bottom nav */
const ICON = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5L10 10l-.5 4.5L14 14z" />
    </svg>
  )
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10l4-2.5v9L17 14" />
    </svg>
  )
}

function GemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 15.3 6.8 18l1-5.8L3.5 8.1l5.9-.9z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-4 5-5.5 7-5.5S18.5 16 20 20" />
    </svg>
  )
}

const TABS: {
  to: string
  end: boolean
  labelKey: TranslationKey
  Icon: typeof CompassIcon
}[] = [
  { to: '/discover', end: true, labelKey: 'nav.discover', Icon: CompassIcon },
  { to: '/experience', end: false, labelKey: 'nav.experience', Icon: FilmIcon },
  { to: '/trips', end: false, labelKey: 'nav.packages', Icon: GemIcon },
  { to: '/about', end: false, labelKey: 'nav.thePro', Icon: UserIcon },
]

const FLOW_PREFIXES = ['/waiver', '/booking', '/trip-prep', '/waitlist']

/** Mobile / PWA 4-tab bar — hidden from md+ so desktop top-nav stays unchanged. */
export default function AppTabBar() {
  const { pathname } = useLocation()
  const { tt } = useLang()

  if (pathname === '/') return null
  if (FLOW_PREFIXES.some((p) => pathname.startsWith(p))) return null
  if (pathname.endsWith('/prep')) return null

  const tabsLabel = tt('nav.appTabs')

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-teal-dark/10 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
      aria-label={`${tabsLabel.en} / ${tabsLabel.th}`}
    >
      <ul className="mx-auto flex max-w-lg items-start justify-around px-1">
        {TABS.map(({ to, end, labelKey, Icon }) => {
          const label = tt(labelKey)
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                aria-label={`${label.en} / ${label.th}`}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-0.5 transition-opacity motion-reduce:transition-none ${
                    isActive ? 'text-teal-dark' : 'text-ink-app/55'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5" />
                    {isActive ? (
                      <span className="mt-1 h-1 w-1 rounded-full bg-orange" aria-hidden />
                    ) : (
                      <span className="mt-1 h-1 w-1" aria-hidden />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
