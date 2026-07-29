import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import InstallPrompt from '../InstallPrompt'
import PublicFooter from './PublicFooter'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'

const TRIP2TALK_LOGO_URL =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Logo/Trip2talk%20(1).png'

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

// Desktop top bar — mockup order + Photo Guide hub (Guides), no Account (icon-only).
const desktopNavOrder = ['/trips', '/gallery', '/photo-guide', '/calendar', '/pricing', '/about']

export default function PublicLayout() {
  const { t, toggleLang, lang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`flex min-h-svh flex-col ${isHome ? 'bg-teal-900' : 'bg-cream'}`}>
      <OfflineBanner />
      <header
        className={
          isHome
            ? 'sticky top-0 z-50 border-b border-white/8 bg-teal-900/95 backdrop-blur'
            : 'sticky top-0 z-50 border-b border-line bg-card/95 backdrop-blur'
        }
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10 lg:py-[18px]">
          <Link
            to="/"
            className={`flex min-w-0 items-center gap-2 font-thai text-base font-bold sm:gap-2.5 sm:text-lg ${
              isHome ? 'text-cream' : 'text-teal-800'
            }`}
          >
            <img
              src={TRIP2TALK_LOGO_URL}
              alt=""
              className="h-[30px] w-[30px] shrink-0 rounded-full object-cover sm:h-[34px] sm:w-[34px]"
            />
            <span className="truncate">Trip2Talk</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {desktopNavOrder
              .map((to) => menuLinks.find((l) => l.to === to))
              .filter((l): l is (typeof menuLinks)[number] => Boolean(l))
              .map(({ to, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-[12.5px] font-semibold leading-snug transition-colors ${
                      isHome
                        ? isActive
                          ? 'text-teal-400'
                          : 'text-cream/65 hover:text-cream'
                        : isActive
                          ? 'text-teal-700'
                          : 'text-ink-soft hover:text-ink'
                    }`
                  }
                >
                  {t(key)}
                </NavLink>
              ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleLang}
              className={
                isHome
                  ? 'rounded-full border border-teal-400/40 px-3 py-1 text-xs font-medium text-teal-400'
                  : 'inline-flex rounded-full border border-line bg-mint-100 p-[3px] text-[10px] font-bold'
              }
              aria-label={t('lang.toggle')}
            >
              {isHome ? (
                t('lang.toggle')
              ) : (
                <>
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      lang === 'en' ? 'bg-teal-500 text-cream' : 'text-teal-800'
                    }`}
                  >
                    EN
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      lang === 'th' ? 'bg-teal-500 text-cream' : 'text-teal-800'
                    }`}
                  >
                    TH
                  </span>
                </>
              )}
            </button>

            <NavLink
              to="/account"
              aria-label={t('nav.account')}
              className={({ isActive }) =>
                `rounded-editorial p-2 ${
                  isHome
                    ? isActive
                      ? 'text-teal-400'
                      : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                    : isActive
                      ? 'text-teal-700'
                      : 'text-ink-soft hover:bg-mint-100 hover:text-ink'
                }`
              }
            >
              <User className="h-4 w-4" />
            </NavLink>

            {/* Wrapper owns the breakpoint: .nav-cta sets display:block outside
                Tailwind's layers, so `hidden` on the link itself loses. */}
            <span className="hidden sm:block">
              <Link to="/trips" className="nav-cta !px-5 !py-2.5 !text-[11.5px]">
                {t('btn.bookNow')}
              </Link>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`rounded-editorial p-2 lg:hidden ${
                isHome ? 'text-cream hover:bg-white/5' : 'text-ink hover:bg-mint-100'
              }`}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className={`border-t px-4 py-3 lg:hidden ${
              isHome ? 'border-white/8' : 'border-line bg-card'
            }`}
          >
            <ul className="space-y-1">
              {menuLinks.map(({ to, key }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-editorial px-3 py-2 text-sm ${
                        isHome
                          ? isActive
                            ? 'font-medium text-teal-400'
                            : 'text-cream/65'
                          : isActive
                            ? 'font-medium text-teal-700'
                            : 'text-ink-soft'
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
        className={`mx-auto w-full flex-1 px-4 pt-4 sm:px-6 ${
          isHome
            ? 'max-w-2xl pb-4 text-cream'
            : 'max-w-[1280px] pb-24 text-ink lg:px-10'
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
