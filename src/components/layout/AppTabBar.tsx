import { NavLink, useLocation } from 'react-router-dom'

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
      <path d="m15.5 8.5-2.2 5.8-5.8 2.2 2.2-5.8z" />
    </svg>
  )
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
    </svg>
  )
}

function GemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M6 3h12l4 7-10 11L2 10z" />
      <path d="M2 10h20M12 21 8 10l4-7 4 7z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" />
    </svg>
  )
}

const TABS = [
  { to: '/discover', end: true, label: 'Discover', Icon: CompassIcon },
  { to: '/experience', end: false, label: 'Experience', Icon: FilmIcon },
  { to: '/trips', end: false, label: 'Packages', Icon: GemIcon },
  { to: '/about', end: false, label: 'The Pro', Icon: UserIcon },
] as const

const FLOW_PREFIXES = ['/waiver', '/booking', '/trip-prep', '/waitlist']

/** Mobile / PWA 4-tab bar — hidden from md+ so desktop top-nav stays unchanged. */
export default function AppTabBar() {
  const { pathname } = useLocation()

  if (pathname === '/') return null
  if (FLOW_PREFIXES.some((p) => pathname.startsWith(p))) return null
  if (pathname.endsWith('/prep')) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="App tabs"
    >
      <ul className="mx-auto flex max-w-lg items-start justify-around px-2">
        {TABS.map(({ to, end, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 transition-opacity motion-reduce:transition-none ${
                  isActive ? 'text-teal-dark opacity-100' : 'text-teal-dark opacity-40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" />
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                  ) : (
                    <span className="h-1.5 w-1.5" aria-hidden />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
