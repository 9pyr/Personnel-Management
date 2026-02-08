import { Box, Button, Grid2, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import Inprogress from '../components/Inprogress'

const LeavePageList = () => {
  const navigate = useNavigate()

  return (
    <Box>
      <Stack spacing={2}>
        <Grid2 container>
          <Grid2 size={6}>
            <strong>การลา</strong>
          </Grid2>
          <Grid2 size={6} className="flex justify-end">
            <Button variant="contained" onClick={() => navigate('/leave/new')}>
              ขอลา
            </Button>
          </Grid2>
        </Grid2>
        <Inprogress />
      </Stack>
    </Box>
  )
}

export default LeavePageList
