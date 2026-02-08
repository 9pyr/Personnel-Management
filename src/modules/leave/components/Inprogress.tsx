import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Table from 'common/components/Table'
import { getListLeave } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { AuthContext } from 'core/contexts/AuthContext'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { TableRowData } from 'common/components/Table'

import { leaveFields, LEAVE_STATUS } from '../constants'

import LeaveRequestCards from './LeaveRequestCards'
import LeaveStatusBadge from './LeaveStatusBadge'

function getStatusKey(row: TableRowData): string | undefined {
  const statusValue = row[leaveFields.status]
  return typeof statusValue === 'string' ? statusValue : undefined
}

const BASE_COLUMNS = [
  { label: 'ผู้ขอลา', source: 'createdByName' },
  { label: 'จากวันที่', source: leaveFields.startDate },
  { label: 'ถึงวันที่', source: leaveFields.endDate },
  { label: 'รายละเอียด', source: leaveFields.description },
  {
    label: 'สถานะ',
    source: leaveFields.status,
    render: (row: TableRowData) => (
      <LeaveStatusBadge statusKey={getStatusKey(row)} />
    ),
  },
]

const Inprogress = () => {
  const navigate = useNavigate()
  const user = useContext(AuthContext)
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)

  const canApproveLeave =
    user?.role === 'MANAGER' || user?.role === 'PEOPLE' || user?.role === 'ADMIN'

  const fetchLeaves = useCallback(async () => {
    try {
      const list = await getListLeave()
      setLeaves(Array.isArray(list) ? list : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchLeaves()
  }, [fetchLeaves])

  useEffect(() => {
    const onRefresh = () => void fetchLeaves()
    window.addEventListener('leave-list-refresh', onRefresh)
    return () => window.removeEventListener('leave-list-refresh', onRefresh)
  }, [fetchLeaves])

  const myLeaves = leaves.filter(leave => leave.createdByUserId === user?.id)
  const othersPending = leaves.filter(
    leave =>
      leave.createdByUserId !== user?.id && leave.status === LEAVE_STATUS.PENDING
  )

  const tableData = myLeaves.map(leave => ({
    id: leave.id,
    createdByName: leave.createdByName ?? '-',
    [leaveFields.startDate]: leave.startDate ?? '-',
    [leaveFields.endDate]: leave.endDate ?? '-',
    [leaveFields.description]: (leave.description?.trim() ?? '') ? leave.description : '-',
    [leaveFields.status]: leave.status ?? '-',
  }))

  return (
    <div>
      <Tabs defaultValue="mine" className="mb-4">
        <TabsList>
          <TabsTrigger value="mine">การลาของฉัน</TabsTrigger>
          {canApproveLeave && (
            <TabsTrigger value="others">คำขอลาจากคนอื่น</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="mine">
          {loading ? (
            <p className="text-muted-foreground">กำลังโหลด...</p>
          ) : tableData.length === 0 ? (
            <p className="text-muted-foreground">ไม่มีรายการลาของคุณ</p>
          ) : (
            <Table
              columns={BASE_COLUMNS}
              data={tableData}
              rowClick={leaveId => navigate(`/leave/${leaveId}/edit`)}
            />
          )}
        </TabsContent>

        {canApproveLeave && (
          <TabsContent value="others">
            {loading ? (
              <p className="text-muted-foreground">กำลังโหลด...</p>
            ) : (
              <LeaveRequestCards leaves={othersPending} onActionDone={fetchLeaves} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default Inprogress
