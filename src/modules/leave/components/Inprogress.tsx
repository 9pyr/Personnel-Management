import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import Table from 'common/components/Table'
import { getListLeave } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { authUserState } from 'core/stores/auth'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { leaveFields } from '../constants'

import LeaveRequestCards from './LeaveRequestCards'

const BASE_COLUMNS = [
  { label: 'ผู้ขอลา', source: 'createdByName' },
  { label: 'จากวันที่', source: leaveFields.startDate },
  { label: 'ถึงวันที่', source: leaveFields.endDate },
  { label: 'รายละเอียด', source: leaveFields.description },
  { label: 'สถานะ', source: leaveFields.status },
]

const Inprogress = () => {
  const navigate = useNavigate()
  const user = useRecoilValue(authUserState)
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

  const myLeaves = leaves.filter(l => l.createdByUserId === user?.id)
  const othersPending = leaves.filter(
    l => l.createdByUserId !== user?.id && l.status === 'PENDING'
  )

  const tableData = myLeaves.map(l => ({
    id: l.id,
    createdByName: l.createdByName ?? '-',
    [leaveFields.startDate]: l.startDate ? dayjs(l.startDate).format('DD/MM/YYYY') : '-',
    [leaveFields.endDate]: l.endDate ? dayjs(l.endDate).format('DD/MM/YYYY') : '-',
    [leaveFields.description]: (l.description?.trim() ?? '') ? l.description : '-',
    [leaveFields.status]: l.status ?? '-',
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
              rowClick={id => navigate(`/leave/${id}/edit`)}
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
