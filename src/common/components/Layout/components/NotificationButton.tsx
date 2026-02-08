import { Bell } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from 'core/apis/notifications'
import type { Notification } from 'core/apis/notifications/types'

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
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchList = useCallback(async () => {
    try {
      const response = await getNotifications()
      setItems(response.items)
      setUnreadCount(response.unreadCount)
    } catch {
      setItems([])
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    void fetchList()
    const onRefresh = () => void fetchList()
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
  }, [fetchList])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) void fetchList()
  }

  const handleMarkRead = useCallback(
    async (notification: Notification) => {
      try {
        await markNotificationRead(n.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setItems(prev =>
          prev.map(item => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item))
        )
        setOpen(false)

        const isFeedComment = n.type === 'FEED_COMMENT' || n.type === 'FEED_COMMENT_REPLY'
        if (isFeedComment && n.relatedId) {
          navigate('/feed', {
            state: {
              highlightPostId: n.relatedId,
              highlightCommentId: n.commentId ?? undefined,
            },
          })
          return
        }
        if (n.relatedId && !isFeedComment) {
          navigate('/leave')
        }
      } catch {
        // ignore
      }
    },
    [navigate]
  )

  const handleMarkAllRead = useCallback(async () => {
    setLoading(true)
    try {
      await markAllNotificationsRead()
      setUnreadCount(0)
      setItems(prev =>
        prev.map(notification => ({
          ...notification,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
      )
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`การแจ้งเตือน${unreadCount > 0 ? ` ${unreadCount} รายการยังไม่อ่าน` : ''}`}>
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
                  <span className={notification.readAt ? 'font-normal' : 'font-semibold'}>{notification.title}</span>
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
