import Box from '@mui/material/Box'

import { Outlet } from 'react-router-dom'

import SideMenu from './components/SideMenu'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box component="main" className="max-w-[1024px] w-full pt-4 px-4">
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
