import { Box, Button, Grid2, Stack } from '@mui/material'

import Tabs from 'common/components/Tabs'

import Approved from '../components/Approved'
import Inprogress from '../components/Inprogress'

const TABS = [
  {
    label: 'Inprogress',
    element: <Inprogress />,
  },
  {
    label: 'Approved',
    element: <Approved />,
  },
]

const LeavePageList = () => {
  return (
    <Box>
      <Stack spacing={2}>
        <Grid2 container>
          <Grid2 size={6}>Leave</Grid2>
          <Grid2 size={6} className="flex justify-end">
            <Button variant="contained">Add</Button>
          </Grid2>
        </Grid2>
        <Box>
          <Tabs items={TABS} />
        </Box>
      </Stack>
    </Box>
  )
}

export default LeavePageList
