import type { FeedComment } from 'core/apis/feed/types'

export interface CommentTreeNode extends FeedComment {
  replies: CommentTreeNode[]
}

export function buildCommentTree(comments: FeedComment[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>()
  comments.forEach(comment => {
    byId.set(comment.id, { ...comment, replies: [] })
  })
  const roots: CommentTreeNode[] = []
  comments.forEach(comment => {
    const node = byId.get(comment.id)
    if (!node) return
    const parentId = comment.parentId ?? undefined
    if (parentId === null || parentId === undefined || !byId.has(parentId)) {
      roots.push(node)
    } else {
      const parent = byId.get(parentId)
      if (parent) parent.replies.push(node)
    }
  })
  roots.sort(
    (first, second) =>
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  )
  byId.forEach(node => {
    node.replies.sort(
      (first, second) =>
        new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    )
  })
  return roots
}
