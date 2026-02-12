import { z } from 'zod'

const uuidLike = z.string().min(1)

export const feedPostSchema = z.object({
  id: uuidLike,
  content: z.string(),
  createdByUserId: uuidLike,
  createdAt: z.string(),
  authorName: z.string(),
})

export type FeedPost = z.infer<typeof feedPostSchema>

export const feedPostListSchema = z
  .union([z.array(feedPostSchema), z.null(), z.undefined()])
  .transform(val => val ?? [])
export type FeedPostList = z.infer<typeof feedPostListSchema>

export const createPostRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
})

export type CreatePostRequest = z.infer<typeof createPostRequestSchema>

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

export type FeedComment = z.infer<typeof feedCommentSchema>

export const feedCommentListSchema = z
  .union([z.array(feedCommentSchema), z.null(), z.undefined()])
  .transform(val => val ?? [])

export type FeedCommentList = z.infer<typeof feedCommentListSchema>

export const createCommentRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
  parentId: z.string().uuid().optional().nullable(),
  replyToUserId: z.string().uuid().optional().nullable(),
})

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>

export const updateCommentRequestSchema = z.object({
  content: z.string().min(1, 'กรุณากรอกข้อความ'),
})

export type UpdateCommentRequest = z.infer<typeof updateCommentRequestSchema>
