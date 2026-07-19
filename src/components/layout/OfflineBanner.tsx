import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

/** PWA offline banner — no service-worker changes required. */
export default function OfflineBanner() {
  const { lang } = useLang()
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  useEffect(() => {
    function on() {
      setOffline(false)
    }
    function off() {
      setOffline(true)
    }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-coral px-3 py-2 text-center text-xs font-semibold text-cream shadow"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      {lang === 'th'
        ? 'ไม่มีการเชื่อมต่อ — บางฟีเจอร์อาจใช้ไม่ได้จนกว่าจะออนไลน์'
        : 'You’re offline — some features won’t work until you’re back online'}
    </div>
  )
}
