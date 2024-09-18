import { Box } from '@mui/material'

import Table from 'common/components/Table'
import { getListLeave } from 'core/apis/leave/inde'
import { useNavigate } from 'react-router-dom'

import { leaveFields } from '../constants'

const COLUMN_LEAVE_INPROGRESS = [
  { label: 'Leave Date from', source: leaveFields.dateFrom },
  { label: 'Leave Date to', source: leaveFields.dateTo },
  { label: 'Description', source: leaveFields.description },
  { label: 'Status', source: leaveFields.status },
]

const Inprogress = () => {
  const navigation = useNavigate()

  return (
    <Box>
      <Table
        columns={COLUMN_LEAVE_INPROGRESS}
        data={getListLeave()}
        rowClick={() => {
          navigation('test/edit')
        }}
      />
    </Box>
  )
}

export default Inprogress
