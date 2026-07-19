import { Compass, Heart, Luggage, MessageCircle, Ticket } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { useLang } from '../../hooks/useLang'

export default function BottomNav() {
  const { t } = useLang()
  const { pathname } = useLocation()

  // Floating dock sits over the home hero video — hide there only.
  if (pathname === '/') return null

  const iconBtn = (isActive: boolean) =>
    `flex h-6 w-6 items-center justify-center transition-colors ${
      isActive ? 'text-cream' : 'text-cream/68'
    }`

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto flex h-[46px] items-center justify-center gap-4 rounded-[23px] px-[18px]"
        style={{
          background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))',
          boxShadow:
            '0 12px 22px -10px rgba(15,28,30,.5), 0 1px 0 rgba(255,255,255,.2) inset',
        }}
      >
        <NavLink to="/" end aria-label={t('nav.explore')} className={({ isActive }) => iconBtn(isActive)}>
          <Compass className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </NavLink>

        <NavLink to="/trips" aria-label={t('nav.trips')} className={({ isActive }) => iconBtn(isActive)}>
          <Luggage className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </NavLink>

        <NavLink
          to="/favorites"
          aria-label={t('nav.favorites')}
          className={({ isActive }) => iconBtn(isActive)}
        >
          <Heart className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </NavLink>

        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('nav.messages')}
          className={iconBtn(false)}
        >
          <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </a>

        <NavLink
          to="/my-trip"
          aria-label={t('nav.myTrip')}
          className={({ isActive }) => iconBtn(isActive)}
        >
          <Ticket className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </NavLink>
      </div>
    </nav>
  )
}
