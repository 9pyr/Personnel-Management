import Box from '@mui/material/Box'

import { Outlet } from 'react-router-dom'

import SideMenu from './components/SideMenu'

const Layout = () => {
  return (
    <div className="flex">
      <SideMenu />
      <div className="flex justify-center w-full">
        <Box component="main" className="flex justify-center max-w-[2048px] w-full pt-4 px-4">
          <div className="w-full">
            <Outlet />
          </div>
        </Box>
      </div>
    </div>
  )
}

export default Layout
