import { Navigate, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { authTokenState } from 'core/stores/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useRecoilValue(authTokenState)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
