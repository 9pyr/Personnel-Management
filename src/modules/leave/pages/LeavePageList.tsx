import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

import { useState } from 'react'

import Inprogress from 'modules/leave/components/Inprogress'
import { LeaveFormModal } from 'modules/leave/components/LeaveFormModal'

const LeavePageList = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null)

  const handleOpenNew = () => {
    setEditingLeaveId(null)
    setModalOpen(true)
  }

  const handleEdit = (leaveId: string) => {
    setEditingLeaveId(leaveId)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">การลา</h1>
          <p className="page-description mt-0.5">รายการคำขอลาและสถานะ</p>
        </div>
        <Button onClick={handleOpenNew} size="default" className="shrink-0">
          <Plus className="h-4 w-4" />
          ขอลา
        </Button>
      </header>
      <Inprogress onEditLeave={handleEdit} />
      <LeaveFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        leaveId={editingLeaveId}
        onSuccess={() => setEditingLeaveId(null)}
      />
    </div>
  )
}

export default LeavePageList
