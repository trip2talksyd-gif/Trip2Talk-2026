import { Share2 } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import BiDisplayHeading from './BiDisplayHeading'
import { useToast } from './Toast'

type Props = {
  /** `header` = cream public chrome; `hero` = home overlay on dark video */
  tone?: 'header' | 'hero'
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError'
}

export default function ShareButton({ tone = 'header' }: Props) {
  const { toast } = useToast()
  const { lang } = useLang()
  const isHero = tone === 'hero'

  async function onShare() {
    const url = window.location.href
    const title = document.title

    // Prefer the native share sheet when the browser supports it. Cancelling
    // the sheet throws AbortError — ignore that. If share is missing (typical
    // desktop) or fails for another reason, copy the URL and confirm via toast.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        if (isAbortError(err)) return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast(lang === 'th' ? 'คัดลอกลิงก์แล้ว' : 'Link copied', 'success')
    } catch {
      toast(lang === 'th' ? 'คัดลอกลิงก์ไม่สำเร็จ' : 'Could not copy link', 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      aria-label={lang === 'th' ? 'แชร์' : 'Share'}
      className={
        isHero
          ? 'inline-flex items-center gap-1.5 rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-2.5'
          : 'inline-flex items-center gap-1 rounded-editorial p-2 text-ink-soft transition-colors hover:bg-mint-100 hover:text-ink sm:gap-1.5'
      }
    >
      <Share2 className="h-4 w-4 shrink-0" aria-hidden />
      <BiDisplayHeading
        as="span"
        thAs="span"
        className={`text-left leading-none ${isHero ? 'hidden md:block' : 'hidden sm:block'}`}
        en="Share"
        th="แชร์"
        enClassName={`text-[10px] font-semibold leading-none ${isHero ? 'text-white' : 'text-teal-dark'}`}
        thClassName={`mt-0.5 text-[9px] leading-snug ${isHero ? 'text-white/70' : 'text-ink-soft'}`}
      />
    </button>
  )
}
