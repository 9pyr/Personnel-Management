import { Box } from '@mui/material'

import Table from 'common/components/Table'
import { useNavigate } from 'react-router-dom'

const Inprogress = () => {
  const navigation = useNavigate()

  return (
    <Box>
      <Table
        columns={[{ label: 'Leave Date', source: 'leaveDate' }]}
        data={[{ leaveDate: '2024-09-18' }]}
        rowClick={() => {
          navigation('test/edit')
        }}
      />
    </Box>
  )
}

export default Inprogress
