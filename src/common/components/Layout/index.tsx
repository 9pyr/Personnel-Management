import { Sheet, SheetContent } from '@/components/ui/sheet'

import { useEffect, useState } from 'react'

import NotificationListener from 'common/components/NotificationListener'
import { Outlet, useLocation } from 'react-router-dom'

import MobileHeader from './components/MobileHeader'
import SideMenu, { SidebarContent } from './components/SideMenu'

const Layout = () => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-content-bg">
      <NotificationListener />
      <MobileHeader onMenuClick={() => setSheetOpen(true)} />
      <SideMenu />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(240px,85vw)] flex-col border-sidebar-border bg-sidebar-bg p-0"
        >
          <div className="flex h-full flex-col pt-2">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col pt-14 lg:pt-0">
        <div className="flex flex-1 justify-center lg:ml-[240px]">
          <main className="flex min-h-screen w-full max-w-[2048px] flex-1 justify-center px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 xl:px-8">
            <div className="w-full min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
