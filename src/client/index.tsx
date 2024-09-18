import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { StrictMode } from 'react'

import Layout from 'common/components/Layout2'
import 'common/styles/index.css'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { menuItems } from 'routes'

import theme from '../common/styles/theme'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    children: menuItems.map(({ name, icon, ...props }) => props),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
