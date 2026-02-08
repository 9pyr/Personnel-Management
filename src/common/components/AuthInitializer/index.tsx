import { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { getMe } from 'core/apis/auth'
import { authTokenState, authUserState } from 'core/stores/auth'

/**
 * เมื่อมี token จะดึง user/role ล่าสุดจาก DB (GET /auth/me) แล้วอัปเดต Recoil
 * ทำให้ role และ user เป็น source of truth จาก DB หลัง refresh
 */
const AuthInitializer = () => {
  const token = useRecoilValue(authTokenState)
  const setUser = useSetRecoilState(authUserState)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getMe()
      .then(me => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        // 401 จัดการโดย apiCaller (clear + redirect)
      })
    return () => {
      cancelled = true
    }
  }, [token, setUser])

  return null
}

export default AuthInitializer
