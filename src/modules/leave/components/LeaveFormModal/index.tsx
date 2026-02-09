import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import LeaveFormContent from '../LeaveFormContent'

interface LeaveFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leaveId: string | null
  onSuccess?: () => void
}

export function LeaveFormModal({ open, onOpenChange, leaveId, onSuccess }: LeaveFormModalProps) {
  const isNew = leaveId == null

  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
    window.dispatchEvent(new CustomEvent('leave-list-refresh'))
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'ขอลา' : 'แก้ไขคำขอลา'}</DialogTitle>
        </DialogHeader>
        <LeaveFormContent
          leaveId={leaveId ?? undefined}
          isNew={isNew}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
