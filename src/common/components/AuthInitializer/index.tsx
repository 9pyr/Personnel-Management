import { useEffect } from 'react'

import { useMe } from 'core/apis/auth/queries'
import { useAuthActions, useAuthToken } from 'core/stores/auth'

/**
 * เมื่อมี token จะดึง user/role ล่าสุดจาก DB (GET /auth/me) แล้วอัปเดต Zustand
 * ทำให้ role และ user เป็น source of truth จาก DB หลัง refresh
 */
const AuthInitializer = () => {
  const token = useAuthToken()
  const { setUser } = useAuthActions()
  const meQuery = useMe({ enabled: Boolean(token) })

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data)
    }
  }, [meQuery.data, setUser])

  return null
}

export default AuthInitializer
