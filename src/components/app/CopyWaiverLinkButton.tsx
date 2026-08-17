import { useState } from 'react'
import { Copy, Link2 } from 'lucide-react'
import { issueWaiverLink } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton } from './staffUi'
import StaffActionTile from './StaffActionTile'

type Props = {
  bookingId: string
  onSessionExpired?: () => void
  layout?: 'button' | 'tile'
}

export default function CopyWaiverLinkButton({
  bookingId,
  onSessionExpired,
  layout = 'button',
}: Props) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copy() {
    setBusy(true)
    try {
      const { path } = await issueWaiverLink(bookingId)
      const url = `${window.location.origin}${path}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('คัดลอกลิงก์ waiver แล้ว — วางใน Messenger ได้', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      toast('คัดลอกลิงก์ไม่สำเร็จ', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (layout === 'tile') {
    return (
      <StaffActionTile
        icon={copied ? Copy : Link2}
        label={copied ? 'Copied' : 'Waiver link'}
        labelTh="ลิงก์ waiver"
        busy={busy}
        onClick={() => void copy()}
      />
    )
  }

  return (
    <StaffButton
      type="button"
      variant="secondary"
      className="!w-auto gap-1.5 px-3 py-1.5 text-[11px]"
      disabled={busy}
      onClick={() => void copy()}
    >
      {copied ? <Copy className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {busy ? '…' : copied ? 'Copied' : 'Copy waiver link'}
    </StaffButton>
  )
}
