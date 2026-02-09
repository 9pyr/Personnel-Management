import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useCallback, useEffect, useState } from 'react'

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from 'core/apis/notifications/queries'
import type { Notification } from 'core/apis/notifications/types'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NOTIFICATIONS_REFRESH_EVENT = 'notifications-refresh'

function formatNotificationTime(createdAt: string): string {
  try {
    const d = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'เมื่อสักครู่'
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export default function NotificationButton() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  const items = notificationsQuery.data?.items ?? []
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0
  const loading = markAllReadMutation.isPending

  useEffect(() => {
    const onRefresh = () => void notificationsQuery.refetch()
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
  }, [notificationsQuery])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) void notificationsQuery.refetch()
  }

  const handleMarkRead = useCallback(
    async (notification: Notification) => {
      try {
        await markReadMutation.mutateAsync({ id: notification.id })
        await notificationsQuery.refetch()
        setOpen(false)

        const isFeedComment =
          notification.type === 'FEED_COMMENT' || notification.type === 'FEED_COMMENT_REPLY'
        if (isFeedComment && notification.relatedId) {
          navigate('/feed', {
            state: {
              highlightPostId: notification.relatedId,
              highlightCommentId: notification.commentId ?? undefined,
            },
          })
          return
        }
        if (notification.relatedId && !isFeedComment) {
          navigate('/leave')
        }
      } catch {
        // ignore
      }
    },
    [navigate, markReadMutation, notificationsQuery],
  )

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllReadMutation.mutateAsync(undefined as void)
      await notificationsQuery.refetch()
    } catch {
      // ignore
    }
  }, [markAllReadMutation, notificationsQuery])

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full bg-muted/90 hover:bg-primary/15 hover:text-primary"
          aria-label={`การแจ้งเตือน${unreadCount > 0 ? ` ${unreadCount} รายการยังไม่อ่าน` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-2 py-3">
          <span className="font-semibold">การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={loading}>
              อ่านทั้งหมด
            </Button>
          )}
        </div>
        <ScrollArea className="h-[320px]">
          {items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              ไม่มีรายการแจ้งเตือน
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map(notification => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkRead(notification)}
                  className={`flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                    !notification.readAt ? 'border-l-4 border-l-primary bg-accent/50' : ''
                  }`}
                >
                  <span className={notification.readAt ? 'font-normal' : 'font-semibold'}>
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground">{notification.body}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function dispatchNotificationsRefresh(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
  }
}
