import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useQueryClient } from '@tanstack/react-query'

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  useComments,
  useCreateComment,
  useCreatePost,
  useDeleteComment,
  useDeletePost,
  useFeed,
  useUpdateComment,
  useUpdatePost,
} from 'core/apis/feed/queries'
import { feedPostListSchema } from 'core/apis/feed/schemas'
import type { FeedComment, FeedPost } from 'core/apis/feed/types'
import { AuthContext } from 'core/contexts/AuthContext'
import apiCaller from 'core/endpoints/apiCaller'
import { FeedCard } from 'modules/feed/components/FeedCard'
import { FEED_COMMENT_EVENT, type FeedCommentEventDetail } from 'modules/feed/feedRealtime'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const FEED_PAGE_SIZE = 20

interface FeedCardWithCommentsProps {
  post: FeedPost
  isOwner: boolean
  isEditing: boolean
  editingContent: string
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

function FeedCardWithComments({ post, ...rest }: FeedCardWithCommentsProps) {
  const commentsQuery = useComments(post.id)
  const comments = commentsQuery.data ?? []

  return <FeedCard post={post} comments={comments} {...rest} />
}

export interface FeedHighlightState {
  highlightPostId?: string
  highlightCommentId?: string
}

function isFeedHighlightState(state: unknown): state is FeedHighlightState {
  return (
    state != null &&
    typeof state === 'object' &&
    ('highlightPostId' in state || 'highlightCommentId' in state)
  )
}

function isFeedCommentEventDetail(detail: unknown): detail is FeedCommentEventDetail {
  if (detail == null || typeof detail !== 'object') return false
  return 'postId' in detail && 'comment' in detail
}

const FeedPage = () => {
  const user = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const highlightState = isFeedHighlightState(location.state) ? location.state : undefined

  const [offset, setOffset] = useState(0)
  const [content, setContent] = useState('')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const feedQuery = useFeed({ limit: FEED_PAGE_SIZE, offset: 0 })
  const createPostMutation = useCreatePost()
  const updatePostMutation = useUpdatePost()
  const deletePostMutation = useDeletePost()
  const createCommentMutation = useCreateComment()
  const updateCommentMutation = useUpdateComment()
  const deleteCommentMutation = useDeleteComment()

  const posts = useMemo(() => {
    if (!feedQuery.data) return []
    return [...feedQuery.data].sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
  }, [feedQuery.data])

  const hasMore = feedQuery.data ? feedQuery.data.length >= FEED_PAGE_SIZE : false
  const loading = feedQuery.isLoading
  const loadingMore = false

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return
    const nextOffset = offset + FEED_PAGE_SIZE
    setOffset(nextOffset)
    const queryKey = `/feed?limit=${FEED_PAGE_SIZE}&offset=${nextOffset}`
    const nextData = await queryClient.fetchQuery({
      queryKey: [queryKey],
      queryFn: async () => {
        const { data } = await apiCaller.get<object>('/feed', {
          params: { limit: FEED_PAGE_SIZE, offset: nextOffset },
        })
        return feedPostListSchema.parse(data)
      },
    })
    queryClient.setQueryData(['/feed'], (old: FeedPost[] | undefined) => {
      if (!old) return nextData
      return [...old, ...nextData]
    })
  }, [loadingMore, hasMore, loading, offset, queryClient])

  useEffect(() => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== 'object')
        return
      const detail: unknown = event.detail
      if (!isFeedCommentEventDetail(detail)) return
      const { postId, comment } = detail
      if (!postId || !comment) return
      queryClient.setQueryData([`/feed/${postId}/comments`], (old: FeedComment[] | undefined) => {
        if (!old) return [comment]
        if (
          old.some(
            commentItem =>
              commentItem.id === comment.id ||
              (commentItem.createdByUserId === comment.createdByUserId &&
                commentItem.content === comment.content &&
                commentItem.createdAt === comment.createdAt),
          )
        ) {
          return old
        }
        return [...old, comment]
      })
    }
    window.addEventListener(FEED_COMMENT_EVENT, handler)
    return () => window.removeEventListener(FEED_COMMENT_EVENT, handler)
  }, [queryClient])

  useEffect(() => {
    const sentinelElement = sentinelRef.current
    if (!sentinelElement || !hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    )
    observer.observe(sentinelElement)
    return () => observer.disconnect()
  }, [hasMore, loadMore, loading])

  useEffect(() => {
    const postId = highlightState?.highlightPostId
    if (!postId || !posts.some(post => post.id === postId)) return
    void queryClient.invalidateQueries({ queryKey: [`/feed/${postId}/comments`] })
  }, [highlightState?.highlightPostId, posts, queryClient])

  useEffect(() => {
    const postId = highlightState?.highlightPostId
    const commentId = highlightState?.highlightCommentId
    if (!postId) return
    const postInList = posts.some(post => post.id === postId)
    if (!postInList) return

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
  }, [highlightState?.highlightPostId, highlightState?.highlightCommentId, posts, navigate])

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.warning('กรุณากรอกข้อความ')
      return
    }
    try {
      await createPostMutation.mutateAsync({ content: trimmed })
      setContent('')
      await feedQuery.refetch()
      toast.success('โพสต์แล้ว')
    } catch {
      toast.error('โพสต์ไม่สำเร็จ')
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync({ id: postId })
      await feedQuery.refetch()
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
      await updatePostMutation.mutateAsync({ id: editingPostId, content: trimmed })
      cancelEdit()
      await feedQuery.refetch()
      toast.success('แก้ไขโพสต์แล้ว')
    } catch {
      toast.error('แก้ไขโพสต์ไม่สำเร็จ')
    }
  }

  const handleAddComment = useCallback(
    async (
      postId: string,
      payload: { content: string; parentId?: string | null; replyToUserId?: string | null },
    ) => {
      try {
        await createCommentMutation.mutateAsync({ postId, ...payload })
        await queryClient.invalidateQueries({ queryKey: [`/feed/${postId}/comments`] })
        toast.success('แสดงความคิดเห็นแล้ว')
      } catch {
        toast.error('แสดงความคิดเห็นไม่สำเร็จ')
      }
    },
    [createCommentMutation, queryClient],
  )

  const handleUpdateComment = useCallback(
    async (postId: string, commentId: string, content: string) => {
      try {
        await updateCommentMutation.mutateAsync({ id: commentId, content })
        await queryClient.invalidateQueries({ queryKey: [`/feed/${postId}/comments`] })
        toast.success('แก้ไขความคิดเห็นแล้ว')
      } catch {
        toast.error('แก้ไขความคิดเห็นไม่สำเร็จ')
      }
    },
    [updateCommentMutation, queryClient],
  )

  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      try {
        await deleteCommentMutation.mutateAsync({ id: commentId })
        await queryClient.invalidateQueries({ queryKey: [`/feed/${postId}/comments`] })
        toast.success('ลบความคิดเห็นแล้ว')
      } catch {
        toast.error('ลบความคิดเห็นไม่สำเร็จ')
      }
    },
    [deleteCommentMutation, queryClient],
  )

  return (
    <div className="w-full max-w-[680px] mx-auto px-0 sm:px-0">
      <div className="flex flex-col gap-4">
        <header className="page-header">
          <div>
            <h1 className="page-title">ประกาศ</h1>
            <p className="page-description mt-0.5">โพสต์และติดตามข่าวจากทีม</p>
          </div>
        </header>

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
                  onClick={() => {
                    void handleSubmit()
                  }}
                  disabled={createPostMutation.isPending || !content.trim()}
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
                    currentUserId={user?.id}
                    isOwner={user?.id === post.createdByUserId}
                    isEditing={editingPostId === post.id}
                    editingContent={editingContent}
                    onStartEdit={startEdit}
                    onEditingContentChange={setEditingContent}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={() => {
                      void handleUpdatePost()
                    }}
                    onDelete={postId => {
                      void handleDelete(postId)
                    }}
                    onAddComment={payload => handleAddComment(post.id, payload)}
                    onUpdateComment={(commentId, content) =>
                      handleUpdateComment(post.id, commentId, content)
                    }
                    onDeleteComment={commentId => handleDeleteComment(post.id, commentId)}
                  />
                </div>
              ))}
              <div ref={sentinelRef} className="h-px min-h-px" aria-hidden="true" />
              {loadingMore && (
                <p className="py-4 text-center text-sm text-muted-foreground">กำลังโหลด...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedPage
