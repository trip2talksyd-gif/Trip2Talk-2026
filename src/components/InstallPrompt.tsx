import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { useLang } from '../hooks/useLang'

const DISMISS_KEY = 'trip2talk_install_dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const { lang } = useLang()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  useEffect(() => {
    if (deferred && isMobile && localStorage.getItem(DISMISS_KEY) !== '1') {
      setVisible(true)
    }
  }, [deferred, isMobile])

  if (!visible || !isMobile || !deferred) return null

  const title =
    lang === 'th'
      ? 'เพิ่ม Trip2Talk ไปหน้าจอหลัก'
      : 'Add Trip2Talk to your home screen'
  const subtitle =
    lang === 'th'
      ? 'เข้าถึงทริปและจองได้เร็วขึ้น'
      : 'Quick access to trips and booking'

  async function handleInstall() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferred(null)
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-[4.5rem] left-0 right-0 z-[90] mx-auto max-w-2xl px-4">
      <div className="flex items-center gap-3 rounded-xl border border-brand-green/20 bg-white p-3 shadow-lg ring-1 ring-black/5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green text-sm font-bold text-white">
          T2T
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-dark">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-brand-green px-3 py-2 text-xs font-semibold text-white"
        >
          <Download className="inline h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
