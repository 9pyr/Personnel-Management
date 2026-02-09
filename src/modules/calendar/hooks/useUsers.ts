import { useContext } from 'react'

import { useListUsers } from 'core/apis/auth/queries'
import { AuthContext } from 'core/contexts/AuthContext'

export function useUsers() {
  const user = useContext(AuthContext)
  const canListUsers = user?.role === 'ADMIN' || user?.role === 'PEOPLE'
  const usersQuery = useListUsers({ enabled: canListUsers })

  return { users: usersQuery.data ?? [], canListUsers }
}
