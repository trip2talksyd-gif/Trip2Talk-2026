import { Compass, Heart, Luggage, MessageCircle, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'

/** Booking / waiver / prep flows own the bottom of the screen — no dock there. */
const FLOW_ROUTE_PREFIXES = ['/waiver', '/booking', '/trip-prep', '/waitlist']

const ITEMS = [
  { to: '/', end: true, icon: Compass, en: 'Explore', th: 'สำรวจ' },
  { to: '/trips', end: false, icon: Luggage, en: 'Trips', th: 'ทริป' },
  { to: '/favorites', end: false, icon: Heart, en: 'Favorites', th: 'รายการโปรด' },
  {
    href: FACEBOOK_PAGE_URL,
    icon: MessageCircle,
    en: 'Messages',
    th: 'ข้อความ',
  },
  { to: '/account', end: false, icon: User, en: 'Profile', th: 'โปรไฟล์' },
] as const

export default function BottomNav() {
  const { pathname } = useLocation()

  // Hidden on Home — would sit on top of the hero video (matches mockup `.home-screen .bottom-nav`).
  if (pathname === '/') return null
  if (FLOW_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null
  if (pathname.endsWith('/prep')) return null

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto flex items-end justify-center gap-3 rounded-[23px] px-3.5 pb-1.5 pt-1.5"
        style={{
          background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))',
          boxShadow:
            '0 12px 22px -10px rgba(15,28,30,.5), 0 1px 0 rgba(255,255,255,.2) inset',
        }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon
          const label = (
            <span className="mt-0.5 block max-w-[52px] truncate text-center text-[7px] font-bold leading-[1.15]">
              {item.en}
              <span className="block font-thai text-[6px] font-medium opacity-85">{item.th}</span>
            </span>
          )

          if ('href' in item) {
            return (
              <a
                key={item.en}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.en} / ${item.th}`}
                className="flex flex-col items-center text-cream/68"
              >
                <Icon className="h-[15px] w-[15px]" strokeWidth={2.25} />
                {label}
              </a>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={`${item.en} / ${item.th}`}
              className={({ isActive }) =>
                `flex flex-col items-center ${isActive ? 'text-cream' : 'text-cream/68'}`
              }
            >
              <Icon className="h-[15px] w-[15px]" strokeWidth={2.25} />
              {label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
