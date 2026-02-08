import { userSchema } from 'core/apis/auth/schemas'
import type { User } from 'core/apis/auth/types'
import { atom } from 'recoil'

const TOKEN_KEY = 'personnel_token'
const USER_KEY = 'personnel_user'

function persistToken(value: string | null): void {
  if (typeof window === 'undefined') return
  if (value) localStorage.setItem(TOKEN_KEY, value)
  else localStorage.removeItem(TOKEN_KEY)
}

function persistUser(value: User | null): void {
  if (typeof window === 'undefined') return
  if (value) localStorage.setItem(USER_KEY, JSON.stringify(value))
  else localStorage.removeItem(USER_KEY)
}

export const authTokenState = atom<string | null>({
  key: 'authToken',
  default: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  effects: [
    ({ onSet }) => {
      onSet(persistToken)
    },
  ],
})

export const authUserState = atom<User | null>({
  key: 'authUser',
  default: (() => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      const data: object = JSON.parse(raw)
      const result = userSchema.safeParse(data)
      return result.success ? result.data : null
    } catch {
      return null
    }
  })(),
  effects: [
    ({ onSet }) => {
      onSet(persistUser)
    },
  ],
})

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/** ใช้หลัง login — เขียน token/user ลง localStorage ทันที เพื่อไม่ให้ getMe() ใน AuthInitializer เรียกก่อน effect จะรัน */
export function persistAuthAfterLogin(token: string, user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
