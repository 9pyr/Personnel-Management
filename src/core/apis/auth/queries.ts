import { useClientQuery } from 'core/hooks/useClientQuery'
import { useClientMutation } from 'core/hooks/useClientMutation'
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

export function useMe() {
  return useClientQuery<User>({
    url: `${AUTH_BASE}/me`,
    select: (data) => userSchema.parse(data),
  })
}

export function useListUsers() {
  return useClientQuery<User[]>({
    url: '/users',
    select: (data) => userListResponseSchema.parse(data),
  })
}

export function useLogin() {
  return useClientMutation<LoginResponse, LoginRequest>({
    method: 'POST',
    url: `${AUTH_BASE}/login`,
    onMutate: async (variables) => {
      const body = loginRequestSchema.parse(variables)
      return body
    },
  })
}

export function useUpdateProfile() {
  return useClientMutation<User, UpdateProfileRequest>({
    method: 'PUT',
    url: `${AUTH_BASE}/profile`,
    invalidateQueries: [`${AUTH_BASE}/me`],
    onMutate: async (variables) => {
      const body = updateProfileRequestSchema.parse(variables)
      return body
    },
  })
}

export function useUploadProfileImage() {
  return useClientMutation<{ profileImageUrl: string }, File>({
    method: 'POST',
    url: `${AUTH_BASE}/profile/avatar`,
    invalidateQueries: [`${AUTH_BASE}/me`],
    onMutate: async (file) => {
      const form = new FormData()
      form.append('avatar', file)
      return form
    },
  })
}

export function useCreateUser() {
  return useClientMutation<User, CreateUserRequest>({
    method: 'POST',
    url: '/users',
    invalidateQueries: ['/users'],
    onMutate: async (variables) => {
      const body = createUserRequestSchema.parse(variables)
      return body
    },
  })
}

export function useUpdateUser() {
  return useClientMutation<User, { id: string } & UpdateUserRequest>({
    method: 'PUT',
    url: (variables) => `/users/${variables.id}`,
    invalidateQueries: ['/users'],
    onMutate: async (variables) => {
      const body = updateUserRequestSchema.parse(variables)
      return { id: variables.id, ...body }
    },
  })
}
