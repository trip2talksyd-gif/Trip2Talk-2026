import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../../hooks/useLang'
import InstallPrompt from '../InstallPrompt'
import PublicFooter from './PublicFooter'
import AppTabBar from './AppTabBar'
import OfflineBanner from './OfflineBanner'
import BrandLogo from '../brand/BrandLogo'
import ShareButton from '../ui/ShareButton'

const menuLinks = [
  { to: '/', key: 'nav.discover' as const },
  { to: '/photo-guide', key: 'nav.photoGuide' as const },
  { to: '/trips', key: 'nav.trips' as const },
  { to: '/calendar', key: 'nav.calendar' as const },
  { to: '/pricing', key: 'nav.pricing' as const },
  { to: '/about', key: 'nav.about' as const },
  { to: '/favorites', key: 'nav.favorites' as const },
  { to: '/my-trip', key: 'nav.myTrip' as const },
  { to: '/account', key: 'nav.account' as const },
  { to: '/help', key: 'nav.help' as const },
  { to: '/app', key: 'nav.portal' as const },
]

const desktopNavOrder = [
  '/',
  '/photo-guide',
  '/trips',
  '/calendar',
  '/pricing',
  '/about',
]

export default function PublicLayout() {
  const { t, setLang, lang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden bg-cream">
      <OfflineBanner />

      <header
        className="z-50 shrink-0 border-b border-line bg-card/95 pt-[env(safe-area-inset-top)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10 lg:py-[18px]">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 font-thai text-base font-bold text-teal-800 sm:gap-2.5 sm:text-lg"
          >
            <BrandLogo
              size="md"
              tone="light"
              withWordmark
              decorative
              wordmarkClassName="text-teal-800"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {desktopNavOrder
              .map((to) => menuLinks.find((l) => l.to === to))
              .filter((l): l is (typeof menuLinks)[number] => Boolean(l))
              .map(({ to, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `text-[12.5px] font-semibold leading-snug transition-colors ${
                      isActive ? 'text-teal-700' : 'text-ink-soft hover:text-ink'
                    }`
                  }
                >
                  {t(key)}
                </NavLink>
              ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div
              role="group"
              aria-label="Language"
              className="inline-flex rounded-full border border-line bg-mint-100 p-[3px] text-[10px] font-bold"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'en' ? 'bg-teal-500 text-cream' : 'text-teal-800'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('th')}
                aria-pressed={lang === 'th'}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === 'th' ? 'bg-teal-500 text-cream' : 'text-teal-800'
                }`}
              >
                TH
              </button>
            </div>

            <ShareButton />

            <NavLink
              to="/account"
              aria-label={t('nav.account')}
              className={({ isActive }) =>
                `rounded-editorial p-2 ${
                  isActive
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
              className="rounded-editorial p-2 text-ink hover:bg-mint-100 lg:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-line bg-card px-4 py-3 lg:hidden">
            <ul className="space-y-1">
              {menuLinks.map(({ to, key }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-editorial px-3 py-2 text-sm ${
                        isActive ? 'font-medium text-teal-700' : 'text-ink-soft'
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

      <div className="app-scroll" data-app-scroll>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-4 text-ink sm:px-6 lg:px-10">
          <Outlet />
        </main>

        <PublicFooter />
      </div>

      <AppTabBar />

      <InstallPrompt />
    </div>
  )
}
