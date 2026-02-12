import React, { createContext, useMemo } from 'react'

import { UserType } from 'core/apis/auth/types'
import { useAuthStore } from 'core/stores/auth'

export const AuthContext = createContext<UserType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactNode {
  const user = useAuthStore(state => state.user)
  const value = useMemo(() => user, [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
