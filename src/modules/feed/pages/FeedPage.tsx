import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { useSnackbar } from 'notistack'

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
import { authUserState } from 'core/stores/auth'
import { FEED_COMMENT_EVENT, type FeedCommentEventDetail } from '../feedRealtime'
import _ from 'lodash'

dayjs.extend(relativeTime)
dayjs.locale('th')

const FEED_PAGE_SIZE = 20

function formatPostTime(iso: string): string {
  const d = dayjs(iso)
  const diffDays = dayjs().diff(d, 'day')
  if (diffDays === 0) return d.fromNow()
  if (diffDays < 7) return d.fromNow()
  return d.format('D MMM YYYY, HH:mm')
}

export interface CommentTreeNode extends FeedComment {
  replies: CommentTreeNode[]
}

function buildCommentTree(comments: FeedComment[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>()
  comments.forEach(c => {
    byId.set(c.id, { ...c, replies: [] })
  })
  const roots: CommentTreeNode[] = []
  comments.forEach(c => {
    const node = byId.get(c.id)
    if (!node) return
    const parentId = c.parentId ?? undefined
    if (_.isNil(parentId) || !byId.has(parentId)) {
      roots.push(node)
    } else {
      const parent = byId.get(parentId)
      if (parent) parent.replies.push(node)
    }
  })
  roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  byId.forEach(n => n.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
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
    <Box sx={{ ml: depth > 0 ? 3 : 0, mb: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
          {node.authorName?.charAt(0) ?? '?'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {node.authorName}
            </Typography>
            {node.replyToUserName && (
              <>
                <Typography variant="body2" color="text.secondary">
                  ตอบกลับ
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    cursor: 'default',
                  }}
                >
                  {node.replyToUserName}
                </Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {formatPostTime(node.createdAt)}
            </Typography>
          </Stack>
          {editing ? (
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={1}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                variant="outlined"
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setEditing(false)}>
                  ยกเลิก
                </Button>
                <Button size="small" variant="contained" onClick={handleSaveEdit}>
                  บันทึก
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.25, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {node.content}
            </Typography>
          )}
          {!editing && (
            <Stack direction="row" spacing={0} sx={{ mt: 0.25 }}>
              <Button
                size="small"
                sx={{ minWidth: 'auto', px: 1, textTransform: 'none' }}
                onClick={() => onReply(node.id, node.createdByUserId, node.authorName)}
              >
                ตอบกลับ
              </Button>
              {isOwner && (
                <>
                  <Button
                    size="small"
                    sx={{ minWidth: 'auto', px: 1, textTransform: 'none' }}
                    onClick={() => {
                      setEditing(true)
                      setEditContent(node.content)
                    }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ minWidth: 'auto', px: 1, textTransform: 'none' }}
                    onClick={() => onDelete(node.id)}
                  >
                    ลบ
                  </Button>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
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
    </Box>
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
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {post.authorName?.charAt(0) ?? '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {post.authorName}
              </Typography>
              {isOwner && !isEditing && (
                <Stack direction="row" spacing={0}>
                  <IconButton
                    size="small"
                    onClick={() => onStartEdit(post)}
                    aria-label="แก้ไขโพสต์"
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(post.id)}
                    aria-label="ลบโพสต์"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatPostTime(post.createdAt)}
            </Typography>
            {isEditing ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editingContent}
                  onChange={e => onEditingContentChange(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={onCancelEdit}>
                    ยกเลิก
                  </Button>
                  <Button size="small" variant="contained" onClick={onSaveEdit}>
                    บันทึก
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Typography
                sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                variant="body2"
              >
                {post.content}
              </Typography>
            )}
          </Box>
        </Stack>

        {comments.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              ความคิดเห็น ({comments.length})
            </Typography>
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
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          {replyTarget && (
            <Stack direction="row" alignItems="center" sx={{ mb: 1, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ตอบกลับ
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {replyTarget.replyToUserName}
              </Typography>
              <Button size="small" onClick={() => setReplyTarget(null)}>
                ยกเลิก
              </Button>
            </Stack>
          )}
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              fullWidth
              size="small"
              placeholder={replyTarget ? `เขียนข้อความถึง ${replyTarget.replyToUserName}...` : 'เขียนความคิดเห็น...'}
              value={newCommentContent}
              onChange={e => setNewCommentContent(e.target.value)}
              multiline
              minRows={1}
              maxRows={4}
              variant="outlined"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmitComment}
              disabled={submitting || !newCommentContent.trim()}
            >
              ส่ง
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

const FeedPage = () => {
  const { enqueueSnackbar } = useSnackbar()
  const user = useRecoilValue(authUserState)
  const sentinelRef = useRef<HTMLDivElement>(null)

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

  const loadComments = useCallback(
    async (postId: string) => {
      if (requestedCommentsRef.current.has(postId)) return
      requestedCommentsRef.current.add(postId)
      try {
        const list = await getComments(postId)
        setCommentsByPostId(prev => ({ ...prev, [postId]: list }))
      } catch {
        enqueueSnackbar('โหลดความคิดเห็นไม่สำเร็จ', { variant: 'error' })
      }
    },
    [enqueueSnackbar]
  )

  const sortPostsNewestFirst = useCallback((items: FeedPost[]) =>
    [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getFeed({ limit: FEED_PAGE_SIZE, offset: 0 })
      setPosts(sortPostsNewestFirst(list))
      setHasMore(list.length >= FEED_PAGE_SIZE)
    } catch {
      enqueueSnackbar('โหลดฟีดไม่สำเร็จ', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar, sortPostsNewestFirst])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const list = await getFeed({ limit: FEED_PAGE_SIZE, offset: posts.length })
      setPosts(prev => sortPostsNewestFirst([...prev, ...list]))
      setHasMore(list.length >= FEED_PAGE_SIZE)
    } catch {
      enqueueSnackbar('โหลดเพิ่มไม่สำเร็จ', { variant: 'error' })
    } finally {
      setLoadingMore(false)
    }
  }, [enqueueSnackbar, loadingMore, hasMore, posts.length, sortPostsNewestFirst])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  useEffect(() => {
    const handler = (e: Event) => {
      const { postId, comment } = (e as CustomEvent<FeedCommentEventDetail>).detail
      if (!postId || !comment) return
      setCommentsByPostId(prev => {
        const list = prev[postId]
        if (!list) return prev
        if (list.some(c => c.id === comment.id)) return prev
        return { ...prev, [postId]: [...list, comment] }
      })
    }
    window.addEventListener(FEED_COMMENT_EVENT, handler)
    return () => window.removeEventListener(FEED_COMMENT_EVENT, handler)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore, loading, posts.length])

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      enqueueSnackbar('กรุณากรอกข้อความ', { variant: 'warning' })
      return
    }
    setSubmitting(true)
    try {
      const created = await createPost({ content: trimmed })
      setContent('')
      setPosts(prev => [created, ...prev])
      enqueueSnackbar('โพสต์แล้ว', { variant: 'success' })
    } catch {
      enqueueSnackbar('โพสต์ไม่สำเร็จ', { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      enqueueSnackbar('ลบโพสต์แล้ว', { variant: 'success' })
    } catch {
      enqueueSnackbar('ลบโพสต์ไม่สำเร็จ', { variant: 'error' })
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
      enqueueSnackbar('กรุณากรอกข้อความ', { variant: 'warning' })
      return
    }
    try {
      const updated = await updatePost(editingPostId, { content: trimmed })
      setPosts(prev =>
        prev.map(p => (p.id === editingPostId ? updated : p))
      )
      cancelEdit()
      enqueueSnackbar('แก้ไขโพสต์แล้ว', { variant: 'success' })
    } catch {
      enqueueSnackbar('แก้ไขโพสต์ไม่สำเร็จ', { variant: 'error' })
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
      enqueueSnackbar('แสดงความคิดเห็นแล้ว', { variant: 'success' })
    },
    [enqueueSnackbar]
  )

  const handleUpdateComment = useCallback(
    async (postId: string, id: string, content: string) => {
      const updated = await updateComment(id, { content })
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map(c => (c.id === id ? updated : c)),
      }))
      enqueueSnackbar('แก้ไขความคิดเห็นแล้ว', { variant: 'success' })
    },
    [enqueueSnackbar]
  )

  const handleDeleteComment = useCallback(
    async (postId: string, id: string) => {
      await deleteComment(id)
      setCommentsByPostId(prev => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter(c => c.id !== id),
      }))
      enqueueSnackbar('ลบความคิดเห็นแล้ว', { variant: 'success' })
    },
    [enqueueSnackbar]
  )

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h5">ประกาศ / Feed</Typography>

        <Stack spacing={1}>
          <Card variant="outlined">
            <CardContent>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="มีอะไรบางอย่างไหม?"
                value={content}
                onChange={e => setContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                >
                  โพสต์
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {loading ? (
          <Typography color="text.secondary">กำลังโหลด...</Typography>
        ) : posts.length === 0 ? (
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" align="center">
                ยังไม่มีโพสต์ — เป็นคนแรกที่โพสต์เลย
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {posts.map(post => (
              <FeedCardWithComments
                key={post.id}
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
                onUpdateComment={(id, content) => handleUpdateComment(post.id, id, content)}
                onDeleteComment={id => handleDeleteComment(post.id, id)}
              />
            ))}
            <Box ref={sentinelRef} sx={{ height: 1, minHeight: 1 }} aria-hidden="true" />
            {loadingMore && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                กำลังโหลด...
              </Typography>
            )}
          </Stack>
        )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default FeedPage
