import apiCaller from 'core/endpoints/apiCaller'

import {
  createCommentRequestSchema,
  createPostRequestSchema,
  feedCommentListSchema,
  feedCommentSchema,
  feedPostListSchema,
  feedPostSchema,
  updateCommentRequestSchema,
} from './schemas'
import type {
  CreateCommentRequest,
  CreatePostRequest,
  FeedComment,
  FeedPost,
  UpdateCommentRequest,
} from './types'

const FEED_BASE = '/feed'

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
}

const DEFAULT_FEED_LIMIT = 20

export interface GetFeedParams {
  limit?: number
  offset?: number
}

/** ดึงรายการโพสต์จาก Backend (GET /feed) รองรับ pagination */
export const getFeed = async (params?: GetFeedParams): Promise<FeedPost[]> => {
  const limit = params?.limit ?? DEFAULT_FEED_LIMIT
  const offset = params?.offset ?? 0
  const { data } = await apiCaller.get<object>(FEED_BASE, {
    params: { limit, offset },
  })
  return parseResponse(data, feedPostListSchema)
}

export const createPost = async (payload: CreatePostRequest): Promise<FeedPost> => {
  const body = createPostRequestSchema.parse(payload)
  const { data } = await apiCaller.post<object>(FEED_BASE, body)
  return parseResponse(data, feedPostSchema)
}

export const updatePost = async (id: string, payload: CreatePostRequest): Promise<FeedPost> => {
  const body = createPostRequestSchema.parse(payload)
  const { data } = await apiCaller.put<object>(`${FEED_BASE}/${id}`, body)
  return parseResponse(data, feedPostSchema)
}

export const deletePost = async (id: string): Promise<void> => {
  await apiCaller.delete(`${FEED_BASE}/${id}`)
}

export const getComments = async (postId: string): Promise<FeedComment[]> => {
  const { data } = await apiCaller.get<object>(`${FEED_BASE}/${postId}/comments`)
  return parseResponse(data, feedCommentListSchema)
}

export const createComment = async (
  postId: string,
  payload: CreateCommentRequest
): Promise<FeedComment> => {
  const body = createCommentRequestSchema.parse(payload)
  const { data } = await apiCaller.post<object>(`${FEED_BASE}/${postId}/comments`, body)
  return parseResponse(data, feedCommentSchema)
}

export const updateComment = async (
  id: string,
  payload: UpdateCommentRequest
): Promise<FeedComment> => {
  const body = updateCommentRequestSchema.parse(payload)
  const { data } = await apiCaller.put<object>(`${FEED_BASE}/comments/${id}`, body)
  return parseResponse(data, feedCommentSchema)
}

export const deleteComment = async (id: string): Promise<void> => {
  await apiCaller.delete(`${FEED_BASE}/comments/${id}`)
}
