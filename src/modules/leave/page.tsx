import { Box, Stack } from '@mui/material'

import Tabs from 'common/components/Tabs'

import Approved from './components/Approved'
import Inprogress from './components/Inprogress'

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

const LeavePage = () => {
  return (
    <Box>
      <Stack spacing={2}>
        <Box>Leave</Box>
        <Box>
          <Tabs items={TABS} />
        </Box>
      </Stack>
    </Box>
  )
}

export default LeavePage
