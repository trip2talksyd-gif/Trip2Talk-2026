import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import InstallPrompt from '../InstallPrompt'
import PublicFooter from './PublicFooter'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'

const menuLinks = [
  { to: '/trips', key: 'nav.trips' as const },
  { to: '/favorites', key: 'nav.favorites' as const },
  { to: '/my-trip', key: 'nav.myTrip' as const },
  { to: '/account', key: 'nav.account' as const },
  { to: '/photo-guide', key: 'nav.photoGuide' as const },
  { to: '/gallery', key: 'nav.gallery' as const },
  { to: '/calendar', key: 'nav.calendar' as const },
  { to: '/pricing', key: 'nav.pricing' as const },
  { to: '/help', key: 'nav.help' as const },
  { to: '/about', key: 'nav.about' as const },
  { to: '/app', key: 'nav.portal' as const },
]

// Desktop top bar only — deliberately excludes /account (that lives next to
// the language toggle as an icon instead, so it doesn't get mistaken for a
// content section like Trips/Gallery/Calendar/Pricing/About).
const desktopNavOrder = ['/trips', '/about', '/gallery', '/calendar', '/pricing']

export default function PublicLayout() {
  const { t, toggleLang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`flex min-h-svh flex-col ${isHome ? 'bg-teal-900' : 'bg-cream'}`}>
      <OfflineBanner />
      <header className="sticky top-0 z-50 border-b border-white/8 bg-teal-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-serif text-lg font-semibold text-cream">
            Trip2Talk
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {desktopNavOrder
              .map((to) => menuLinks.find((l) => l.to === to))
              .filter((l): l is (typeof menuLinks)[number] => Boolean(l))
              .map(({ to, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-editorial px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider ${
                      isActive ? 'text-teal-400' : 'text-cream/65 hover:text-cream'
                    }`
                  }
                >
                  {t(key)}
                </NavLink>
              ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-editorial border border-teal-400/40 px-3 py-1 text-xs font-medium text-teal-400"
            >
              {t('lang.toggle')}
            </button>

            <NavLink
              to="/account"
              aria-label={t('nav.account')}
              className={({ isActive }) =>
                `rounded-editorial p-2 hover:bg-white/5 ${isActive ? 'text-teal-400' : 'text-cream/70 hover:text-cream'}`
              }
            >
              <User className="h-4 w-4" />
            </NavLink>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-editorial p-2 text-cream hover:bg-white/5"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/8 px-4 py-3 md:hidden">
            <ul className="space-y-1">
              {menuLinks.map(({ to, key }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-editorial px-3 py-2 text-sm ${
                        isActive ? 'font-medium text-teal-400' : 'text-cream/65'
                      }`
                    }
                  >
                    {t(key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 pt-4 ${
          isHome ? 'max-w-2xl pb-4 text-cream' : 'max-w-5xl pb-24 text-ink'
        }`}
      >
        <Outlet />
      </main>

      <BottomNav />

      <InstallPrompt />

      <PublicFooter />
    </div>
  )
}
