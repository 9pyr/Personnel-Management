import { StrictMode, Suspense } from 'react'

import AuthInitializer from 'common/components/AuthInitializer'
import Layout from 'common/components/Layout'
import ProtectedRoute from 'common/components/ProtectedRoute'
import 'common/styles/index.css'
import { AuthProvider } from 'core/contexts/AuthContext'
import LoginPage from 'modules/auth/pages/LoginPage'
import { Toaster } from 'sonner'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { menuItems } from 'routes'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    children: menuItems.map(({ name, icon, ...props }) => props),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <AuthProvider>
        <AuthInitializer />
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
          <Toaster position="top-right" richColors />
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </RecoilRoot>
  </StrictMode>,
)
