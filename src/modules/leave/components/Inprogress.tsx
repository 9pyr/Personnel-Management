import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import Table from 'common/components/Table'
import { getListLeave } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { authUserState } from 'core/stores/auth'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

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
  const [tabIndex, setTabIndex] = useState(0)

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
    <Box>
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="การลาของฉัน" />
        {canApproveLeave && <Tab label="คำขอลาจากคนอื่น" />}
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          {loading ? (
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          ) : tableData.length === 0 ? (
            <Typography color="text.secondary">ไม่มีรายการลาของคุณ</Typography>
          ) : (
            <Table
              columns={BASE_COLUMNS}
              data={tableData}
              rowClick={id => navigate(`/leave/${id}/edit`)}
            />
          )}
        </Box>
      )}

      {tabIndex === 1 && canApproveLeave && (
        <Box>
          {loading ? (
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          ) : (
            <LeaveRequestCards leaves={othersPending} onActionDone={fetchLeaves} />
          )}
        </Box>
      )}
    </Box>
  )
}

export default Inprogress
