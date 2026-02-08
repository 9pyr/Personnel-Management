import { z } from 'zod'

export const roleSchema = z.enum(['ADMIN', 'PEOPLE', 'MANAGER', 'STAFF'])
export type Role = z.infer<typeof roleSchema>

const uuidLike = z.string().min(1)

export const userSchema = z.object({
  id: uuidLike,
  email: z.string().email(),
  name: z.string().min(1),
  role: roleSchema,
  department: z.string().optional(),
  managerId: uuidLike.optional(),
  profileImageUrl: z.string().optional(),
  education: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const updateProfileRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  education: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
  role: roleSchema,
  department: z.string().optional(),
  managerId: uuidLike.optional(),
})

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>

export const profileImageUrlResponseSchema = z.object({
  profileImageUrl: z.string(),
})

export type ProfileImageUrlResponse = z.infer<typeof profileImageUrlResponseSchema>

export const userListResponseSchema = z.array(userSchema)
export type UserListResponse = z.infer<typeof userListResponseSchema>

export const updateUserRequestSchema = z.object({
  managerId: z.string().optional().nullable(),
  role: roleSchema.optional(),
  department: z.string().optional().nullable(),
})
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>
