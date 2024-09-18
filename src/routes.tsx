import { createBrowserRouter } from "react-router-dom"
import Layout from "common/components/layout/Layout"
import DashboardPage from "modules/landing/pages/DashboardPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "/about",
        element: <div>About</div>,
      },
    ],
  },
])
