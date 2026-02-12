import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { useMemo, useState } from 'react'

import { FeedComment, FeedPost } from 'core/apis/feed/types'
import { Pencil, Trash2 } from 'lucide-react'
import { CommentBlock } from 'modules/feed/components/CommentBlock'
import { buildCommentTree } from 'modules/feed/utils/commentTree'
import { formatPostTime } from 'modules/feed/utils/formatTime'

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

export function FeedCard({
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
                  onChange={evt => onEditingContentChange(evt.target.value)}
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
              <span className="text-sm font-semibold text-primary">
                {replyTarget.replyToUserName}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setReplyTarget(null)}>
                ยกเลิก
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-start">
            <Textarea
              className="min-h-[60px] flex-1"
              placeholder={
                replyTarget
                  ? `เขียนข้อความถึง ${replyTarget.replyToUserName}...`
                  : 'เขียนความคิดเห็น...'
              }
              value={newCommentContent}
              onChange={evt => setNewCommentContent(evt.target.value)}
              rows={1}
            />
            <Button
              size="sm"
              onClick={() => {
                void handleSubmitComment()
              }}
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
