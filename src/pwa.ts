/**
 * PWA service-worker registration — auto-update + periodic check.
 * Used instead of the injected registerSW.js script (injectRegister: null).
 */
import { registerSW } from 'virtual:pwa-register'

const UPDATE_INTERVAL_MS = 5 * 60 * 1000

export function registerPwa(): void {
  if (!('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    // autoUpdate (vite.config) reloads the page when a new SW takes control.
    // Keep an explicit reload here so we never depend on a prompt UX.
    onNeedRefresh() {
      window.location.reload()
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      const checkForUpdate = () => {
        void registration.update().catch(() => {
          /* offline / aborted — ignore */
        })
      }

      window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS)

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })

      window.addEventListener('focus', checkForUpdate)
    },
  })
}
