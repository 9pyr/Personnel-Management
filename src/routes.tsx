import type { ReactElement } from 'react'

import type { Role } from 'core/apis/auth/types'
import {
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Sailboat,
  User,
  Users,
} from 'lucide-react'
import CalendarPage from 'modules/calendar/pages/CalendarPage'
import DashboardPage from 'modules/dashboard/page'
import FeedPage from 'modules/feed/pages/FeedPage'
import LeavePageForm from 'modules/leave/pages/LeavePageForm'
import LeavePageList from 'modules/leave/pages/LeavePageList'
import LeaveTypesPage from 'modules/leave/pages/LeaveTypesPage'
import ProfilePage from 'modules/profile/pages/ProfilePage'
import UserListPage from 'modules/users/pages/UserListPage'
import { RouteObject } from 'react-router-dom'

const iconClass = 'h-5 w-5'

export const menuItems: ({ name: string; icon: ReactElement; roles?: Role[] } & RouteObject)[] = [
  {
    name: 'หน้าหลัก',
    icon: <LayoutDashboard className={iconClass} />,
    element: <DashboardPage />,
    index: true,
  },
  {
    path: '/profile',
    name: 'โปรไฟล์',
    icon: <User className={iconClass} />,
    element: <ProfilePage />,
  },
  {
    path: '/feed',
    name: 'ประกาศ',
    icon: <FileText className={iconClass} />,
    element: <FeedPage />,
  },
  {
    path: '/leave',
    name: 'การลา',
    icon: <Sailboat className={iconClass} />,
    children: [
      { index: true, element: <LeavePageList /> },
      { path: 'new', element: <LeavePageForm /> },
      { path: ':id/edit', element: <LeavePageForm /> },
    ],
  },
  {
    path: '/calendar',
    name: 'ปฏิทิน',
    icon: <Calendar className={iconClass} />,
    element: <CalendarPage />,
  },
  {
    path: '/leave-types',
    name: 'จัดการประเภทการลา',
    icon: <ClipboardList className={iconClass} />,
    roles: ['PEOPLE', 'ADMIN'],
    element: <LeaveTypesPage />,
  },
  {
    path: '/users',
    name: 'จัดการผู้ใช้',
    icon: <Users className={iconClass} />,
    roles: ['ADMIN', 'PEOPLE'],
    element: <UserListPage />,
  },
]
