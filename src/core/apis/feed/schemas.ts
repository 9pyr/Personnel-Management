import { z } from 'zod'

const uuidLike = z.string().min(1)

export const feedPostSchema = z.object({
  id: uuidLike,
  content: z.string(),
  createdByUserId: uuidLike,
  createdAt: z.string(),
  authorName: z.string(),
})

export const feedPostListSchema = z
  .union([z.array(feedPostSchema), z.null(), z.undefined()])
  .transform(val => val ?? [])

export const createPostRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
})

export const feedCommentSchema = z.object({
  id: uuidLike,
  postId: uuidLike,
  parentId: uuidLike.nullable().optional(),
  createdByUserId: uuidLike,
  replyToUserId: uuidLike.nullable().optional(),
  content: z.string(),
  createdAt: z.string(),
  authorName: z.string(),
  replyToUserName: z.string().optional(),
})

export const feedCommentListSchema = z
  .union([z.array(feedCommentSchema), z.null(), z.undefined()])
  .transform(val => val ?? [])

export const createCommentRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
  parentId: z.string().uuid().optional().nullable(),
  replyToUserId: z.string().uuid().optional().nullable(),
})

export const updateCommentRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
})

export type FeedPostType = z.infer<typeof feedPostSchema>
export type FeedPostListType = z.infer<typeof feedPostListSchema>
export type CreatePostRequestType = z.infer<typeof createPostRequestSchema>
export type FeedCommentType = z.infer<typeof feedCommentSchema>
export type FeedCommentListType = z.infer<typeof feedCommentListSchema>
export type CreateCommentRequestType = z.infer<typeof createCommentRequestSchema>
export type UpdateCommentRequestType = z.infer<typeof updateCommentRequestSchema>
