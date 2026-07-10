import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Calendar, Home, Image, Lock, Menu, X } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import InstallPrompt from '../InstallPrompt'
import PublicFooter from './PublicFooter'

const menuLinks = [
  { to: '/trips', key: 'nav.trips' as const },
  { to: '/gallery', key: 'nav.gallery' as const },
  { to: '/calendar', key: 'nav.calendar' as const },
  { to: '/pricing', key: 'nav.pricing' as const },
  { to: '/about', key: 'nav.about' as const },
]

const bottomNav = [
  { to: '/', icon: Home, key: 'nav.home' as const, end: true },
  { to: '/calendar', icon: Calendar, key: 'nav.calendar' as const },
  { to: '/gallery', icon: Image, key: 'nav.gallery' as const },
  { to: '/app', icon: Lock, key: 'nav.portal' as const },
]

export default function PublicLayout() {
  const { t, toggleLang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`flex min-h-svh flex-col ${isHome ? 'bg-near-black-green' : 'bg-cream'}`}>
      <header className="sticky top-0 z-50 border-b border-white/8 bg-near-black-green/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-serif text-lg font-semibold text-cream">
            Trip2Talk
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {menuLinks.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-editorial px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider ${
                    isActive ? 'text-gold' : 'text-cream-muted hover:text-cream'
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleLang}
            className="rounded-editorial border border-gold/40 px-3 py-1 text-xs font-medium text-gold"
          >
            {t('lang.toggle')}
          </button>

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
                        isActive ? 'font-medium text-gold' : 'text-cream-muted'
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
        className={`mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4 ${
          isHome ? 'text-cream' : 'text-brand-dark'
        }`}
      >
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-near-black-green/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
          {bottomNav.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-editorial px-3 py-1 text-[10px] uppercase tracking-wider ${
                  isActive ? 'text-gold' : 'text-cream-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <InstallPrompt />

      <PublicFooter />
    </div>
  )
}
