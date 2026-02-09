import { Button } from '@/components/ui/button'

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
    <div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <strong>การลา</strong>
          <div className="flex justify-end">
            <Button onClick={handleOpenNew}>ขอลา</Button>
          </div>
        </div>
        <Inprogress onEditLeave={handleEdit} />
      </div>
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
