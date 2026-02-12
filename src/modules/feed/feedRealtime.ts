import { FeedCommentType } from 'core/apis/feed/types'

export const FEED_COMMENT_EVENT = 'feed-comment'

export interface FeedCommentTypeEventDetail {
  postId: string
  comment: FeedCommentType
}

export function dispatchFeedCommentType(postId: string, comment: FeedCommentType): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FEED_COMMENT_EVENT, { detail: { postId, comment } }))
  }
}
