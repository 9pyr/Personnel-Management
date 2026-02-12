import { FeedComment } from 'core/apis/feed/types'

export const FEED_COMMENT_EVENT = 'feed-comment'

export interface FeedCommentEventDetail {
  postId: string
  comment: FeedComment
}

export function dispatchFeedComment(postId: string, comment: FeedComment): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FEED_COMMENT_EVENT, { detail: { postId, comment } }))
  }
}
