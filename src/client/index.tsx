import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { StrictMode, Suspense } from 'react'

import AuthInitializer from 'common/components/AuthInitializer'
import Layout from 'common/components/Layout'
import ProtectedRoute from 'common/components/ProtectedRoute'
import 'common/styles/index.css'
import { AuthProvider } from 'core/contexts/AuthContext'
import LoginPage from 'modules/auth/pages/LoginPage'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { menuItems } from 'routes'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: menuItems.map(({ name: _name, icon: _icon, ...props }) => props),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInitializer />
        <Suspense
          fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
        >
          <Toaster position="top-right" richColors />
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
