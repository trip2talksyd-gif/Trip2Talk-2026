import { useEffect, useState, useCallback, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { verifyStaffPin } from '../../lib/toursApi'
import type { StaffRole } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { setStaffSession } from '../../lib/supabaseStaff'
import { staffShellClass } from '../../components/app/staffUi'
import BrandLogo from '../../components/brand/BrandLogo'

const MAX_ATTEMPTS = 3
const LOCKOUT_MS = 30_000

/** Full-bleed PIN gate background (The Neck, Tasmania). */
const PIN_GATE_BG_SRC =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Tasmania/Hobat/the%20neckweb.jpg'

function redirectForRole(role: StaffRole): string {
  switch (role) {
    case 'CASHIER':
      return '/app/cashier'
    case 'OWNER':
      return '/app/owner'
    case 'MANAGER':
    case 'GUIDE':
    default:
      return '/app/staff'
  }
}

export default function PinGatePage() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [lockSeconds, setLockSeconds] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  useEffect(() => {
    if (!lockedUntil) {
      setLockSeconds(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setLockSeconds(remaining)
      if (remaining <= 0) setLockedUntil(null)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [lockedUntil])

  const verifyPin = useCallback(
    async (fullPin: string) => {
      if (isLocked || fullPin.length !== 4) return

      setLoading(true)
      setError('')

      try {
        const staff = await verifyStaffPin(fullPin)
        if (staff) {
          setStaffSession(staff.token, staff.role, staff.full_name)
          navigate(redirectForRole(staff.role))
          return
        }

        const next = attempts + 1
        setAttempts(next)
        setPin('')
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS)
          setAttempts(0)
          setError(t('pin.locked'))
        } else {
          setError(`${t('pin.invalid')} (${next}/${MAX_ATTEMPTS})`)
        }
      } catch {
        setError(t('pin.connection'))
      } finally {
        setLoading(false)
      }
    },
    [attempts, isLocked, navigate, t],
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    verifyPin(pin)
  }

  function handleKey(k: string) {
    if (isLocked || loading) return
    if (k === 'back') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) verifyPin(next)
  }

  function pressKey(k: string) {
    setActiveKey(k)
    setTimeout(() => setActiveKey(null), 150)
    handleKey(k)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const

  return (
    <div className={`${staffShellClass} relative`}>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PIN_GATE_BG_SRC})` }}
        aria-hidden
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-near-black-green/60 via-near-black-green/40 to-near-black-green/90"
        aria-hidden
      />

      <div
        className="app-scroll flex min-h-full flex-col items-center justify-center px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        data-app-scroll
      >
      <div className="liquid-glass relative w-full max-w-xs rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <Link
            to="/"
            aria-label="Home"
            className="rounded-full transition-opacity hover:opacity-80 active:opacity-70"
          >
            <BrandLogo size="xl" tone="dark" decorative />
          </Link>
          <h1 className="mt-5 font-serif text-xl text-cream">{t('pin.welcome')}</h1>
          <p className="mt-1 text-sm text-cream-muted">Enter 4-digit PIN</p>

          <form onSubmit={handleSubmit} className="mt-8 w-full">
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                    pin.length > i ? 'scale-110 bg-gold shadow-[0_0_8px_rgba(212,168,83,0.6)]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {error && !isLocked && (
              <p className="mt-4 text-center text-sm text-red-400">{error}</p>
            )}

            {isLocked && (
              <div className="mt-4 rounded-editorial border border-gold/30 bg-gold/10 px-4 py-3 text-center">
                <p className="text-sm text-gold">{t('pin.locked')}</p>
                <p className="mt-1 font-serif text-2xl font-bold text-gold">{lockSeconds}s</p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-3">
              {keys.map((key) => (
                <button
                  key={key || 'empty'}
                  type="button"
                  disabled={!key || isLocked || loading}
                  onClick={() => key && pressKey(key)}
                  className={`rounded-editorial py-4 text-lg font-medium transition-all duration-150 disabled:invisible ${
                    activeKey === key
                      ? 'scale-95 bg-gold text-gold-dark shadow-lg shadow-gold/30'
                      : 'bg-surface-card text-cream hover:bg-deep-green active:scale-95'
                  }`}
                >
                  {key === 'back' ? '⌫' : key}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}
