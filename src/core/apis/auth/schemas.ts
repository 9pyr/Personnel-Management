import { z } from 'zod'

export const roleSchema = z.enum(['ADMIN', 'PEOPLE', 'MANAGER', 'STAFF'])

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

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
})

export const updateProfileRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  education: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
})

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
  role: roleSchema,
  department: z.string().optional(),
  managerId: uuidLike.optional(),
})

export const profileImageUrlResponseSchema = z.object({
  profileImageUrl: z.string(),
})

export const userListResponseSchema = z.array(userSchema)

export const updateUserRequestSchema = z.object({
  managerId: z.string().optional().nullable(),
  role: roleSchema.optional(),
  department: z.string().optional().nullable(),
})

export type RoleType = z.infer<typeof roleSchema>
export type UserType = z.infer<typeof userSchema>
export type LoginRequestType = z.infer<typeof loginRequestSchema>
export type LoginResponseType = z.infer<typeof loginResponseSchema>
export type UpdateProfileRequestType = z.infer<typeof updateProfileRequestSchema>
export type CreateUserRequestType = z.infer<typeof createUserRequestSchema>
export type ProfileImageUrlResponseType = z.infer<typeof profileImageUrlResponseSchema>
export type UserListResponseType = z.infer<typeof userListResponseSchema>
export type UpdateUserRequestType = z.infer<typeof updateUserRequestSchema>
