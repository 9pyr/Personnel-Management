import Layout from 'common/components/layout/Layout'
import DashboardPage from 'modules/dashboard/page'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: '/about',
        element: <div>About</div>,
      },
    ],
  },
])
