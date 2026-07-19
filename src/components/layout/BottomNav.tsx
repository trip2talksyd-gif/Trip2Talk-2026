import { Compass, Heart, Luggage, MessageCircle, Ticket } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { CONTACT_CHANNELS } from '../../data/contactChannels'
import { useLang } from '../../hooks/useLang'

const facebookPageHref =
  CONTACT_CHANNELS.find((c) => c.id === 'facebook')?.href ??
  'https://www.facebook.com/profile.php?id=61586534972406'

export default function BottomNav() {
  const { t } = useLang()
  const { pathname } = useLocation()

  // Floating dock sits over the home hero video — hide there only.
  if (pathname === '/') return null

  const iconBtn = (isActive: boolean) =>
    `flex h-9 w-10 items-center justify-center rounded-full transition-colors ${
      isActive ? 'bg-teal-900/90 text-cream' : 'text-ink/80 hover:bg-teal-900/15'
    }`

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto flex h-[46px] items-center gap-1 rounded-full px-2 shadow-[0_10px_30px_rgba(22,38,43,0.35)]"
        style={{
          background: 'linear-gradient(135deg, #f4b476 0%, #e8935a 100%)',
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
          href={facebookPageHref}
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
