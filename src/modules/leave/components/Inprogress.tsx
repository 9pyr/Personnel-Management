import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useContext, useEffect } from 'react'

import Table, { type TableRowData } from 'common/components/Table'
import { useListLeave } from 'core/apis/leave/queries'
import { AuthContext } from 'core/contexts/AuthContext'
import { LEAVE_STATUS, leaveFields } from 'modules/leave/constants'
import { useNavigate } from 'react-router-dom'

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
    render: (row: TableRowData) => <LeaveStatusBadge statusKey={getStatusKey(row)} />,
  },
]

const Inprogress = () => {
  const navigate = useNavigate()
  const user = useContext(AuthContext)
  const leavesQuery = useListLeave()
  const leaves = leavesQuery.data ?? []
  const loading = leavesQuery.isLoading

  const canApproveLeave =
    user?.role === 'MANAGER' || user?.role === 'PEOPLE' || user?.role === 'ADMIN'

  useEffect(() => {
    const onRefresh = () => void leavesQuery.refetch()
    window.addEventListener('leave-list-refresh', onRefresh)
    return () => window.removeEventListener('leave-list-refresh', onRefresh)
  }, [leavesQuery])

  const myLeaves = leaves.filter(leave => leave.createdByUserId === user?.id)
  const othersPending = leaves.filter(
    leave => leave.createdByUserId !== user?.id && leave.status === LEAVE_STATUS.PENDING,
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
          {canApproveLeave && <TabsTrigger value="others">คำขอลาจากคนอื่น</TabsTrigger>}
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
              <LeaveRequestCards
                leaves={othersPending}
                onActionDone={() => leavesQuery.refetch()}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default Inprogress
