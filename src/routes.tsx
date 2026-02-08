import ArticleIcon from '@mui/icons-material/Article'
import AssignmentIcon from '@mui/icons-material/Assignment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import SailingIcon from '@mui/icons-material/Sailing'

import type { Role } from 'core/apis/auth/types'
import DashboardPage from 'modules/dashboard/page'
import FeedPage from 'modules/feed/pages/FeedPage'
import LeavePageForm from 'modules/leave/pages/LeavePageForm'
import LeavePageList from 'modules/leave/pages/LeavePageList'
import LeaveTypesPage from 'modules/leave/pages/LeaveTypesPage'
import ProfilePage from 'modules/profile/pages/ProfilePage'
import UserListPage from 'modules/users/pages/UserListPage'
import { RouteObject } from 'react-router-dom'

export const menuItems: ({ name: string; icon: JSX.Element; roles?: Role[] } & RouteObject)[] = [
  {
    name: 'หน้าหลัก',
    icon: <DashboardIcon />,
    element: <DashboardPage />,
    index: true,
  },
  {
    path: '/profile',
    name: 'โปรไฟล์',
    icon: <PersonIcon />,
    element: <ProfilePage />,
  },
  {
    path: '/feed',
    name: 'ประกาศ',
    icon: <ArticleIcon />,
    element: <FeedPage />,
  },
  {
    path: '/leave',
    name: 'การลา',
    icon: <SailingIcon />,
    children: [
      { index: true, element: <LeavePageList /> },
      { path: 'new', element: <LeavePageForm /> },
      { path: ':id/edit', element: <LeavePageForm /> },
    ],
  },
  {
    path: '/leave-types',
    name: 'จัดการประเภทการลา',
    icon: <AssignmentIcon />,
    roles: ['PEOPLE', 'ADMIN'],
    element: <LeaveTypesPage />,
  },
  {
    path: '/users',
    name: 'จัดการผู้ใช้',
    icon: <PeopleIcon />,
    roles: ['ADMIN', 'PEOPLE'],
    element: <UserListPage />,
  },
]
