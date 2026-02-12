import { userSchema } from 'core/apis/auth/schemas'
import { User } from 'core/apis/auth/types'
import { parseJSONToAnyValue } from 'core/endpoints/parseJson'
import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: User | null
  setToken: (value: string | null) => void
  setUser: (value: User | null) => void
  clearAuth: () => void
}

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

function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function parseJSONSafe(text: string): object | null {
  try {
    const parsed = parseJSONToAnyValue(text)
    if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  const parsed = parseJSONSafe(raw)
  if (parsed == null) return null
  const result = userSchema.safeParse(parsed)
  return result.success ? result.data : null
}

export const useAuthStore = create<AuthState>(set => ({
  token: getInitialToken(),
  user: getInitialUser(),
  setToken: value => {
    persistToken(value)
    set({ token: value })
  },
  setUser: value => {
    persistUser(value)
    set({ user: value })
  },
  clearAuth: () => {
    clearAuthStorage()
    set({ token: null, user: null })
  },
}))

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

export function useAuthToken(): string | null {
  return useAuthStore(state => state.token)
}

export function useAuthUser(): User | null {
  return useAuthStore(state => state.user)
}

export function useAuthActions(): {
  setToken: (value: string | null) => void
  setUser: (value: User | null) => void
  clearAuth: () => void
} {
  const setToken = useAuthStore(state => state.setToken)
  const setUser = useAuthStore(state => state.setUser)
  const clearAuth = useAuthStore(state => state.clearAuth)
  return { setToken, setUser, clearAuth }
}
