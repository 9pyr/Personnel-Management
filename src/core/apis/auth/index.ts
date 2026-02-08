import apiCaller from 'core/endpoints/apiCaller'

import {
  createUserRequestSchema,
  loginRequestSchema,
  loginResponseSchema,
  profileImageUrlResponseSchema,
  updateProfileRequestSchema,
  updateUserRequestSchema,
  userListResponseSchema,
  userSchema,
} from './schemas'
import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UpdateUserRequest,
  User,
} from './types'

const AUTH_BASE = '/auth'

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const body = loginRequestSchema.parse(payload)
  const { data } = await apiCaller.post<object>(`${AUTH_BASE}/login`, body)
  return parseResponse(data, loginResponseSchema)
}

export const getMe = async (): Promise<User> => {
  const { data } = await apiCaller.get<object>(`${AUTH_BASE}/me`)
  return parseResponse(data, userSchema)
}

export const updateProfile = async (payload: UpdateProfileRequest): Promise<User> => {
  const body = updateProfileRequestSchema.parse(payload)
  const { data } = await apiCaller.put<object>(`${AUTH_BASE}/profile`, body)
  return parseResponse(data, userSchema)
}

export const uploadProfileImage = async (file: File): Promise<{ profileImageUrl: string }> => {
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await apiCaller.post<object>(`${AUTH_BASE}/profile/avatar`, form)
  return parseResponse(data, profileImageUrlResponseSchema)
}

export const getListUsers = async (): Promise<User[]> => {
  const { data } = await apiCaller.get<object>('/users')
  return parseResponse(data, userListResponseSchema)
}

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
  const body = createUserRequestSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/users', body)
  return parseResponse(data, userSchema)
}

export const updateUser = async (id: string, payload: UpdateUserRequest): Promise<User> => {
  const body = updateUserRequestSchema.parse(payload)
  const { data } = await apiCaller.put<object>(`/users/${id}`, body)
  return parseResponse(data, userSchema)
}
