import DashboardIcon from '@mui/icons-material/Dashboard'
import SailingIcon from '@mui/icons-material/Sailing'

import DashboardPage from 'modules/dashboard/page'
import LeavePageForm from 'modules/leave/pages/LeavePageForm'
import LeavePageList from 'modules/leave/pages/LeavePageList'
import { RouteObject } from 'react-router-dom'

export const menuItems: ({ name: string; icon: JSX.Element } & RouteObject)[] = [
  {
    // default path is slash
    name: 'Dashboard',
    icon: <DashboardIcon />,
    element: <DashboardPage />,
    index: true,
  },
  {
    path: '/leave',
    name: 'Leave',
    icon: <SailingIcon />,
    children: [
      {
        index: true,
        element: <LeavePageList />,
      },
      {
        path: ':id/edit',
        element: <LeavePageForm />,
      },
    ],
  },
]
