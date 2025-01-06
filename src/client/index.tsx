import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { StrictMode, Suspense } from 'react'

import Layout from 'common/components/Layout'
import 'common/styles/index.css'
import { SnackbarProvider } from 'notistack'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { menuItems } from 'routes'

import theme from '../common/styles/theme'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    children: menuItems.map(({ name, icon, ...props }) => props),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <Suspense fallback={<div>Loading...</div>}>
          <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <CssBaseline />
            <RouterProvider router={router} />
          </SnackbarProvider>
        </Suspense>
      </RecoilRoot>
    </ThemeProvider>
  </StrictMode>,
)
