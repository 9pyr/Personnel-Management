import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'

import {
  createUserRequestSchema,
  loginRequestSchema,
  updateProfileRequestSchema,
  updateUserRequestSchema,
  userListResponseSchema,
  userSchema,
} from './schemas'
import {
  CreateUserRequestType,
  LoginRequestType,
  LoginResponseType,
  UpdateProfileRequestType,
  UpdateUserRequestType,
  UserType,
} from './types'

const AUTH_BASE = '/auth'

export function useMe(options?: { enabled?: boolean }) {
  return useClientQuery<UserType>({
    url: `${AUTH_BASE}/me`,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    select: data => userSchema.parse(data),
  })
}

export function useListUsers(options?: { enabled?: boolean }) {
  return useClientQuery<UserType[]>({
    url: '/users',
    enabled: options?.enabled !== undefined ? options.enabled : true,
    select: data => userListResponseSchema.parse(data),
  })
}

export function useLogin() {
  return useClientMutation<LoginResponseType, LoginRequestType>({
    method: 'POST',
    url: `${AUTH_BASE}/login`,
    buildPayload: variables => loginRequestSchema.parse(variables),
  })
}

export function useUpdateProfile() {
  return useClientMutation<UserType, UpdateProfileRequestType>({
    method: 'PUT',
    url: `${AUTH_BASE}/profile`,
    invalidateQueries: [`${AUTH_BASE}/me`],
    buildPayload: variables => updateProfileRequestSchema.parse(variables),
  })
}

export function useUploadProfileImage() {
  return useClientMutation<{ profileImageUrl: string }, File>({
    method: 'POST',
    url: `${AUTH_BASE}/profile/avatar`,
    invalidateQueries: [`${AUTH_BASE}/me`],
    buildPayload: file => {
      const form = new FormData()
      form.append('avatar', file)
      return form
    },
  })
}

export function useCreateUser() {
  return useClientMutation<UserType, CreateUserRequestType>({
    method: 'POST',
    url: '/users',
    invalidateQueries: ['/users'],
    buildPayload: variables => createUserRequestSchema.parse(variables),
  })
}

export function useUpdateUser() {
  return useClientMutation<UserType, { id: string } & UpdateUserRequestType>({
    method: 'PUT',
    url: variables => `/users/${variables.id}`,
    invalidateQueries: ['/users'],
    buildPayload: variables => {
      const body = updateUserRequestSchema.parse(variables)
      return { id: variables.id, ...body }
    },
  })
}
