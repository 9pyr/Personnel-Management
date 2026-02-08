import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Pencil, Trash2 } from 'lucide-react'
import _ from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getComments,
  getFeed,
  updateComment,
  updatePost,
} from 'core/apis/feed'
import type { FeedComment, FeedPost } from 'core/apis/feed/types'
import { AuthContext } from 'core/contexts/AuthContext'
import { FEED_COMMENT_EVENT, type FeedCommentEventDetail } from '../feedRealtime'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

dayjs.extend(relativeTime)
dayjs.locale('th')

const FEED_PAGE_SIZE = 20

function formatPostTime(iso: string): string {
  const date = dayjs(iso)
  const diffDays = dayjs().diff(date, 'day')
  if (diffDays === 0) return date.fromNow()
  if (diffDays < 7) return date.fromNow()
  return date.format('D MMM YYYY, HH:mm')
}

export interface CommentTreeNode extends FeedComment {
  replies: CommentTreeNode[]
}

function buildCommentTree(comments: FeedComment[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>()
  comments.forEach(comment => {
    byId.set(comment.id, { ...comment, replies: [] })
  })
  const roots: CommentTreeNode[] = []
  comments.forEach(comment => {
    const node = byId.get(comment.id)
    if (!node) return
    const parentId = comment.parentId ?? undefined
    if (_.isNil(parentId) || !byId.has(parentId)) {
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

interface FeedCardProps {
  post: FeedPost
  isOwner: boolean
  isEditing: boolean
  editingContent: string
  comments: FeedComment[]
  currentUserId: string | undefined
  onStartEdit: (post: FeedPost) => void
  onEditingContentChange: (value: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: (id: string) => void
  onAddComment: (payload: {
    content: string
    parentId?: string | null
    replyToUserId?: string | null
  }) => Promise<void>
  onUpdateComment: (id: string, content: string) => Promise<void>
  onDeleteComment: (id: string) => Promise<void>
}

interface CommentBlockProps {
  node: CommentTreeNode
  currentUserId: string | undefined
  onReply: (parentId: string, replyToUserId: string, replyToUserName: string) => void
  onUpdate: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  depth?: number
}

function CommentBlock({
  node,
  currentUserId,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
}: CommentBlockProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(node.content)
  const isOwner = currentUserId === node.createdByUserId

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    await onUpdate(node.id, trimmed)
    setEditing(false)
  }

  return (
    <div
      data-comment-id={node.id}
      className={depth > 0 ? 'ml-6 mb-1.5' : 'mb-1.5'}
    >
      <div className="flex flex-row items-start gap-2">
        <Avatar className="h-7 w-7 text-sm">
          <AvatarFallback>{node.authorName?.charAt(0) ?? '?'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-sm font-semibold">{node.authorName}</span>
            {node.replyToUserName && (
              <>
                <span className="text-sm text-muted-foreground">ตอบกลับ</span>
                <span className="text-sm font-semibold text-primary">{node.replyToUserName}</span>
              </>
            )}
            <span className="ml-1 text-xs text-muted-foreground">
              {formatPostTime(node.createdAt)}
            </span>
          </div>
          {editing ? (
            <div className="mt-1 flex flex-col gap-2">
              <Textarea
                className="min-h-[60px] w-full"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  ยกเลิก
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  บันทึก
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{node.content}</p>
          )}
          {!editing && (
            <div className="mt-0.5 flex flex-row gap-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-auto px-2 py-1 text-sm"
                onClick={() => onReply(node.id, node.createdByUserId, node.authorName ?? '')}
              >
                ตอบกลับ
              </Button>
              {isOwner && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto px-2 py-1 text-sm"
                    onClick={() => {
                      setEditing(true)
                      setEditContent(node.content)
                    }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto px-2 py-1 text-sm text-destructive hover:text-destructive"
                    onClick={() => onDelete(node.id)}
                  >
                    ลบ
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {node.replies.map(reply => (
        <CommentBlock
          key={reply.id}
          node={reply}
          currentUserId={currentUserId}
          onReply={onReply}
          onUpdate={onUpdate}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

interface FeedCardWithCommentsProps extends FeedCardProps {
  loadComments: (postId: string) => void
}

function FeedCardWithComments({
  post,
  loadComments,
  ...rest
}: FeedCardWithCommentsProps) {
  useEffect(() => {
    loadComments(post.id)
  }, [post.id, loadComments])
  return <FeedCard post={post} {...rest} />
}

function FeedCard({
  post,
  isOwner,
  isEditing,
  editingContent,
  comments,
  currentUserId,
  onStartEdit,
  onEditingContentChange,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: FeedCardProps) {
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string
    replyToUserId: string
    replyToUserName: string
  } | null>(null)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const tree = useMemo(() => buildCommentTree(comments), [comments])

  const handleSubmitComment = async () => {
    const trimmed = newCommentContent.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await onAddComment({
        content: trimmed,
        parentId: replyTarget?.parentId ?? null,
        replyToUserId: replyTarget?.replyToUserId ?? null,
      })
      setNewCommentContent('')
      setReplyTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mb-2 border">
      <CardContent className="pt-6">
        <div className="flex flex-row items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{post.authorName?.charAt(0) ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{post.authorName}</span>
              {isOwner && !isEditing && (
                <div className="flex gap-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStartEdit(post)}
                    aria-label="แก้ไขโพสต์"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(post.id)}
                    aria-label="ลบโพสต์"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatPostTime(post.createdAt)}</p>
            {isEditing ? (
              <div className="mt-2 flex flex-col gap-2">
                <Textarea
                  className="min-h-[80px] w-full"
                  value={editingContent}
                  onChange={e => onEditingContentChange(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={onCancelEdit}>
                    ยกเลิก
                  </Button>
                  <Button size="sm" onClick={onSaveEdit}>
                    บันทึก
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">{post.content}</p>
            )}
          </div>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              ความคิดเห็น ({comments.length})
            </p>
            {tree.map(node => (
              <CommentBlock
                key={node.id}
                node={node}
                currentUserId={currentUserId}
                onReply={(parentId, replyToUserId, replyToUserName) =>
                  setReplyTarget({ parentId, replyToUserId, replyToUserName })
                }
                onUpdate={onUpdateComment}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
        )}

        <div className="mt-4">
          {replyTarget && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ตอบกลับ</span>
              <span className="text-sm font-semibold text-primary">{replyTarget.replyToUserName}</span>
              <Button size="sm" variant="ghost" onClick={() => setReplyTarget(null)}>
                ยกเลิก
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-start">
            <Textarea
              className="min-h-[60px] flex-1"
              placeholder={replyTarget ? `เขียนข้อความถึง ${replyTarget.replyToUserName}...` : 'เขียนความคิดเห็น...'}
              value={newCommentContent}
              onChange={e => setNewCommentContent(e.target.value)}
              rows={1}
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={submitting || !newCommentContent.trim()}
            >
              ส่ง
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface FeedHighlightState {
  highlightPostId?: string
  highlightCommentId?: string
}

function isFeedHighlightState(
  state: object | null | undefined
): state is FeedHighlightState {
  return (
    state != null &&
    typeof state === 'object' &&
    ('highlightPostId' in state || 'highlightCommentId' in state)
  )
}

function isFeedCommentEventDetail(detail: object): detail is FeedCommentEventDetail {
  return 'postId' in detail && 'comment' in detail
}

const FeedPage = () => {
  const user = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const highlightState = isFeedHighlightState(location.state)
    ? location.state
    : undefined

  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, FeedComment[]>>({})
  const requestedCommentsRef = useRef<Set<string>>(new Set())

  const loadComments = useCallback(async (postId: string) => {
    if (requestedCommentsRef.current.has(postId)) return
    requestedCommentsRef.current.add(postId)
    try {
      const list = await getComments(postId)
      setCommentsByPostId(prev => ({ ...prev, [postId]: list }))
    } catch {
      toast.error('โหลดความคิดเห็นไม่สำเร็จ')
    }
  }, [])

  const sortPostsNewestFirst = useCallback(
    (items: FeedPost[]) =>
      [...items].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      ),
    []
  )

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getFeed({ limit: FEED_PAGE_SIZE, offset: 0 })
      setPosts(sortPostsNewestFirst(list))
      setHasMore(list.length >= FEED_PAGE_SIZE)
    } catch {
      toast.error('โหลดฟีดไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [sortPostsNewestFirst])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const list = await getFeed({ limit: FEED_PAGE_SIZE, offset: posts.length })
      setPosts(prev => sortPostsNewestFirst([...prev, ...list]))
      setHasMore(list.length >= FEED_PAGE_SIZE)
    } catch {
      toast.error('โหลดเพิ่มไม่สำเร็จ')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, posts.length, sortPostsNewestFirst])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== 'object')
        return
      const detail = event.detail
      if (!isFeedCommentEventDetail(detail)) return
      const { postId, comment } = detail
      if (!postId || !comment) return
      setCommentsByPostId(prev => {
        const list = prev[postId]
        if (!list) return prev
        if (list.some(commentItem => commentItem.id === comment.id)) return prev
        return { ...prev, [postId]: [...list, comment] }
      })
    }
    window.addEventListener(FEED_COMMENT_EVENT, handler)
    return () => window.removeEventListener(FEED_COMMENT_EVENT, handler)
  }, [])

  useEffect(() => {
    const sentinelElement = sentinelRef.current
    if (!sentinelElement || !hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    )
    observer.observe(sentinelElement)
    return () => observer.disconnect()
  }, [hasMore, loadMore, loading, posts.length])

  useEffect(() => {
    const postId = highlightState?.highlightPostId
    if (!postId || !posts.some(post => post.id === postId)) return
    loadComments(postId)
  }, [highlightState?.highlightPostId, posts, loadComments])

  useEffect(() => {
    const postId = highlightState?.highlightPostId
    const commentId = highlightState?.highlightCommentId
    if (!postId) return
    const postInList = posts.some(post => post.id === postId)
    const commentsLoaded = postInList && postId in commentsByPostId
    if (!postInList || !commentsLoaded) return

    const scrollToTarget = () => {
      if (commentId) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`)
        if (commentElement instanceof HTMLElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          commentElement.style.setProperty('background', 'hsl(var(--accent))', 'important')
          setTimeout(() => commentElement.style.removeProperty('background'), 2000)
        }
      } else {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`)
        postElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      navigate('/feed', { replace: true, state: {} })
    }

    const timeoutId = setTimeout(scrollToTarget, 300)
    return () => clearTimeout(timeoutId)
  }, [highlightState?.highlightPostId, highlightState?.highlightCommentId, posts, commentsByPostId, navigate])

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.warning('กรุณากรอกข้อความ')
      return
    }
    setSubmitting(true)
    try {
      const created = await createPost({ content: trimmed })
      setContent('')
      setPosts(prev => [created, ...prev])
      toast.success('โพสต์แล้ว')
    } catch {
      toast.error('โพสต์ไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
      toast.success('ลบโพสต์แล้ว')
    } catch {
      toast.error('ลบโพสต์ไม่สำเร็จ')
    }
  }

  const startEdit = (post: FeedPost) => {
    setEditingPostId(post.id)
    setEditingContent(post.content)
  }

  const cancelEdit = () => {
    setEditingPostId(null)
    setEditingContent('')
  }

  const handleUpdatePost = async () => {
    if (!editingPostId) return
    const trimmed = editingContent.trim()
    if (!trimmed) {
      toast.warning('กรุณากรอกข้อความ')
      return
    }
    try {
      const updated = await updatePost(editingPostId, { content: trimmed })
      setPosts(prev =>
        prev.map(post => (post.id === editingPostId ? updated : post))
      )
      cancelEdit()
      toast.success('แก้ไขโพสต์แล้ว')
    } catch {
      toast.error('แก้ไขโพสต์ไม่สำเร็จ')
    }
  }

  const handleAddComment = useCallback(
    async (
      postId: string,
      payload: { content: string; parentId?: string | null; replyToUserId?: string | null }
    ) => {
      const created = await createComment(postId, payload)
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), created],
      }))
      toast.success('แสดงความคิดเห็นแล้ว')
    },
    []
  )

  const handleUpdateComment = useCallback(
    async (postId: string, commentId: string, content: string) => {
      const updated = await updateComment(commentId, { content })
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map(commentItem =>
          commentItem.id === commentId ? updated : commentItem
        ),
      }))
      toast.success('แก้ไขความคิดเห็นแล้ว')
    },
    []
  )

  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      await deleteComment(commentId)
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter(commentItem => commentItem.id !== commentId),
      }))
      toast.success('ลบความคิดเห็นแล้ว')
    },
    []
  )

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">ประกาศ / Feed</h2>

        <div className="flex flex-col gap-2">
          <Card className="border">
            <CardContent className="pt-6">
              <Textarea
                className="mb-4 min-h-[80px] w-full"
                placeholder="มีอะไรบางอย่างไหม?"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                >
                  โพสต์
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <p className="text-muted-foreground">กำลังโหลด...</p>
          ) : posts.length === 0 ? (
            <Card className="border">
              <CardContent>
                <p className="text-center text-muted-foreground">
                  ยังไม่มีโพสต์ — เป็นคนแรกที่โพสต์เลย
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <div key={post.id} data-post-id={post.id}>
                  <FeedCardWithComments
                    post={post}
                    comments={commentsByPostId[post.id] ?? []}
                    currentUserId={user?.id}
                    loadComments={loadComments}
                    isOwner={user?.id === post.createdByUserId}
                    isEditing={editingPostId === post.id}
                    editingContent={editingContent}
                    onStartEdit={startEdit}
                    onEditingContentChange={setEditingContent}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={handleUpdatePost}
                    onDelete={handleDelete}
                    onAddComment={payload => handleAddComment(post.id, payload)}
                    onUpdateComment={(commentId, content) => handleUpdateComment(post.id, commentId, content)}
                    onDeleteComment={commentId => handleDeleteComment(post.id, commentId)}
                  />
                </div>
              ))}
              <div ref={sentinelRef} className="h-px min-h-px" aria-hidden="true" />
              {loadingMore && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  กำลังโหลด...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedPage
