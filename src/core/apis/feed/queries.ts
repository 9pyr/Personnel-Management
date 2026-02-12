import { useInfiniteQuery } from '@tanstack/react-query'

import apiCaller from 'core/endpoints/apiCaller'
import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'

import {
  createCommentRequestSchema,
  createPostRequestSchema,
  feedCommentListSchema,
  feedPostListSchema,
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
const DEFAULT_FEED_LIMIT = 20

export interface GetFeedParams {
  limit?: number
  offset?: number
}

export function useFeed(params?: GetFeedParams) {
  const limit = params?.limit ?? DEFAULT_FEED_LIMIT
  const offset = params?.offset ?? 0

  return useClientQuery<FeedPost[]>({
    url: FEED_BASE,
    params: { limit, offset },
    select: data => feedPostListSchema.parse(data),
  })
}

export function useFeedInfinite() {
  return useInfiniteQuery({
    queryKey: [FEED_BASE],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await apiCaller.get<object>(FEED_BASE, {
        params: { limit: DEFAULT_FEED_LIMIT, offset: pageParam },
      })
      return feedPostListSchema.parse(data)
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < DEFAULT_FEED_LIMIT) return undefined
      return allPages.length * DEFAULT_FEED_LIMIT
    },
    initialPageParam: 0,
  })
}

export function useComments(postId: string) {
  return useClientQuery<FeedComment[]>({
    url: `${FEED_BASE}/${postId}/comments`,
    enabled: Boolean(postId),
    select: data => feedCommentListSchema.parse(data),
  })
}

export function useCreatePost() {
  return useClientMutation<FeedPost, CreatePostRequest>({
    method: 'POST',
    url: FEED_BASE,
    invalidateQueries: [FEED_BASE],
    buildPayload: variables => createPostRequestSchema.parse(variables),
  })
}

export function useUpdatePost() {
  return useClientMutation<FeedPost, { id: string } & CreatePostRequest>({
    method: 'PUT',
    url: variables => `${FEED_BASE}/${variables.id}`,
    invalidateQueries: [FEED_BASE],
    buildPayload: variables => {
      const body = createPostRequestSchema.parse(variables)
      return { id: variables.id, ...body }
    },
  })
}

export function useDeletePost() {
  return useClientMutation<void, { id: string }>({
    method: 'DELETE',
    url: variables => `${FEED_BASE}/${variables.id}`,
    invalidateQueries: [FEED_BASE],
    buildPayload: () => ({}),
  })
}

export function useCreateComment() {
  return useClientMutation<FeedComment, { postId: string } & CreateCommentRequest>({
    method: 'POST',
    url: variables => `${FEED_BASE}/${variables.postId}/comments`,
    invalidateQueries: [FEED_BASE],
    buildPayload: variables => {
      const body = createCommentRequestSchema.parse(variables)
      return { postId: variables.postId, ...body }
    },
  })
}

export function useUpdateComment() {
  return useClientMutation<FeedComment, { id: string } & UpdateCommentRequest>({
    method: 'PUT',
    url: variables => `${FEED_BASE}/comments/${variables.id}`,
    invalidateQueries: [FEED_BASE],
    buildPayload: variables => {
      const body = updateCommentRequestSchema.parse(variables)
      return { id: variables.id, ...body }
    },
  })
}

export function useDeleteComment() {
  return useClientMutation<void, { id: string }>({
    method: 'DELETE',
    url: variables => `${FEED_BASE}/comments/${variables.id}`,
    invalidateQueries: [FEED_BASE],
    buildPayload: () => ({}),
  })
}
