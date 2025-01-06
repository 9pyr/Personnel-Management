import { Box } from '@mui/material'

import Table from 'common/components/Table'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { leaveFields } from '../constants'
import { leaveListState } from '../stores/query'

const COLUMN_LEAVE_INPROGRESS = [
  { label: 'Leave Date from', source: leaveFields.startDate },
  { label: 'Leave Date to', source: leaveFields.endDate },
  { label: 'Description', source: leaveFields.description },
  { label: 'Status', source: leaveFields.status },
]

const Inprogress = () => {
  const navigation = useNavigate()

  const leaves = useRecoilValue(leaveListState)

  return (
    <Box>
      <Table
        columns={COLUMN_LEAVE_INPROGRESS}
        data={leaves}
        rowClick={id => {
          navigation(`${id}/edit`)
        }}
      />
    </Box>
  )
}

export default Inprogress
