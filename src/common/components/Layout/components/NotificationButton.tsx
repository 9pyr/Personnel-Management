import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchList = useCallback(async () => {
    try {
      const res = await getNotifications()
      setItems(res.items)
      setUnreadCount(res.unreadCount)
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

  const open = Boolean(anchorEl)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    if (!open) void fetchList()
  }

  const handleClose = () => setAnchorEl(null)

  const handleMarkRead = useCallback(
    async (n: Notification) => {
      try {
        await markNotificationRead(n.id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setItems(prev =>
          prev.map(item => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item))
        )
        handleClose()

        const isFeedComment =
          n.type === 'FEED_COMMENT' || n.type === 'FEED_COMMENT_REPLY'
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
      setItems(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={`การแจ้งเตือน${unreadCount > 0 ? ` ${unreadCount} รายการยังไม่อ่าน` : ''}`}
        onClick={handleOpen}
        size="small"
      >
        <Badge badgeContent={unreadCount} color="error" showZero={false}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 400 } } }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            การแจ้งเตือน
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} disabled={loading}>
              อ่านทั้งหมด
            </Button>
          )}
        </Box>
        <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
          {items.length === 0 ? (
            <ListItemButton disabled>
              <ListItemText primary="ไม่มีรายการแจ้งเตือน" />
            </ListItemButton>
          ) : (
            items.map(n => (
              <ListItemButton
                key={n.id}
                onClick={() => handleMarkRead(n)}
                sx={{
                  bgcolor: n.readAt ? undefined : 'action.hover',
                  borderLeft: n.readAt ? undefined : '3px solid',
                  borderColor: 'primary.main',
                }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                    <Typography component="span" variant="body2" color="text.secondary" display="block">
                      {n.body}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatNotificationTime(n.createdAt)}
                    </Typography>
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: n.readAt ? 400 : 600 }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </>
  )
}

export function dispatchNotificationsRefresh(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
  }
}
