import DashboardIcon from '@mui/icons-material/Dashboard'
import SailingIcon from '@mui/icons-material/Sailing'

import DashboardPage from 'modules/dashboard/page'
import LeavePage from 'modules/leave/page'
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
    element: <LeavePage />,
  },
]
