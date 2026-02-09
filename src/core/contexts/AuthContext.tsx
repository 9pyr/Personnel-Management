import React, { createContext, useMemo } from 'react'

import { User } from 'core/apis/auth/types'
import { useAuthUser } from 'core/stores/auth'

export const AuthContext = createContext<User | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactNode {
  const user = useAuthUser()
  const value = useMemo(() => user, [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
