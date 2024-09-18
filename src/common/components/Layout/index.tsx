import Box from '@mui/material/Box'

import { Outlet } from 'react-router-dom'

import SideMenu from './components/SideMenu'

const Layout = () => {
  return (
    <div className="flex">
      <SideMenu />
      <div className="w-full">
        <Box
          component="main"
          className="flex justify-content-center max-w-[1024px] w-full pt-4 px-4"
        >
          <Outlet />
        </Box>
      </div>
    </div>
  )
}

export default Layout
