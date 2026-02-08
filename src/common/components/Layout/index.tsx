import Box from '@mui/material/Box'

import { Outlet } from 'react-router-dom'

import NotificationListener from 'common/components/NotificationListener'
import SideMenu from './components/SideMenu'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <NotificationListener />
      <SideMenu />
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          component="main"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            maxWidth: 2048,
            width: '100%',
            pt: 2,
            px: 2,
            minHeight: '100vh',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
