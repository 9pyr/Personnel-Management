import NotificationListener from 'common/components/NotificationListener'
import { Outlet } from 'react-router-dom'

import SideMenu from './components/SideMenu'
import { drawerWidth } from './styles'

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-muted">
      <NotificationListener />
      <SideMenu />
      <div className="flex flex-1 justify-center" style={{ marginLeft: drawerWidth }}>
        <main className="flex w-full max-w-[2048px] flex-1 justify-center px-4 pt-4 min-h-screen">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
