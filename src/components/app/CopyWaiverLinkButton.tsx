import { useState } from 'react'
import { Copy, Link2 } from 'lucide-react'
import { issueWaiverLink } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton } from './staffUi'

type Props = {
  bookingId: string
  onSessionExpired?: () => void
}

export default function CopyWaiverLinkButton({ bookingId, onSessionExpired }: Props) {
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
