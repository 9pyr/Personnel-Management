import { Box } from '@mui/material'

import Table from 'common/components/Table'

const Inprogress = () => {
  return (
    <Box>
      <Table
        columns={[{ label: 'Leave Date', source: 'leaveDate' }]}
        data={[{ leaveDate: '2024-09-18' }]}
      />
    </Box>
  )
}

export default Inprogress
