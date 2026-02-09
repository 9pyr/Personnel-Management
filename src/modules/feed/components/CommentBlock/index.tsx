import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { useState } from 'react'

import type { CommentTreeNode } from 'modules/feed/utils/commentTree'
import { formatPostTime } from 'modules/feed/utils/formatTime'

interface CommentBlockProps {
  node: CommentTreeNode
  currentUserId: string | undefined
  onReply: (parentId: string, replyToUserId: string, replyToUserName: string) => void
  onUpdate: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  depth?: number
}

export function CommentBlock({
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
    <div data-comment-id={node.id} className={depth > 0 ? 'ml-6 mb-1.5' : 'mb-1.5'}>
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
