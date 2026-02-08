import type { User } from 'core/apis/auth/types'
import { createContext, useMemo, type ReactNode } from 'react'
import { useRecoilValue } from 'recoil'
import { authUserState } from 'core/stores/auth'

export const AuthContext = createContext<User | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  const user = useRecoilValue(authUserState)
  const value = useMemo(() => user, [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
