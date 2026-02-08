import { useSnackbar } from 'notistack'
import { useWebSocket } from 'core/hooks/useWebSocket'

import { dispatchNotificationsRefresh } from 'common/components/Layout/components/NotificationButton'
import { dispatchFeedComment } from 'modules/feed/feedRealtime'
import type { FeedComment } from 'core/apis/feed/types'

function NotificationListener() {
  const { enqueueSnackbar } = useSnackbar()

  useWebSocket(msg => {
    switch (msg.type) {
      case 'LEAVE_APPROVED':
        enqueueSnackbar('การลาของคุณได้รับการอนุมัติแล้ว', { variant: 'success' })
        dispatchNotificationsRefresh()
        break
      case 'LEAVE_REJECTED':
        enqueueSnackbar('การลาของคุณถูกปฏิเสธ', { variant: 'warning' })
        dispatchNotificationsRefresh()
        break
      case 'NEW_LEAVE_REQUEST':
        enqueueSnackbar('มีคำขอลาใหม่ รอการดำเนินการ', { variant: 'info' })
        dispatchNotificationsRefresh()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leave-list-refresh'))
        }
        break
      case 'LEAVE_CANCELLED':
        enqueueSnackbar('มีคำขอลาถูกยกเลิก', { variant: 'info' })
        dispatchNotificationsRefresh()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leave-list-refresh'))
        }
        break
      case 'NEW_FEED_COMMENT':
        if (
          typeof window !== 'undefined' &&
          msg.postId &&
          msg.id &&
          msg.createdByUserId &&
          msg.content != null &&
          msg.createdAt &&
          msg.authorName != null
        ) {
          const comment: FeedComment = {
            id: msg.id,
            postId: msg.postId,
            parentId: msg.parentId ?? undefined,
            createdByUserId: msg.createdByUserId,
            replyToUserId: msg.replyToUserId ?? undefined,
            content: msg.content,
            createdAt: msg.createdAt,
            authorName: msg.authorName,
            replyToUserName: msg.replyToUserName,
          }
          dispatchFeedComment(msg.postId, comment)
        }
        break
      case 'FEED_COMMENT':
        enqueueSnackbar('มีความคิดเห็นใหม่ในโพสต์ของคุณ', { variant: 'info' })
        dispatchNotificationsRefresh()
        break
      case 'FEED_COMMENT_REPLY':
        enqueueSnackbar('มีคนตอบกลับความคิดเห็นของคุณ', { variant: 'info' })
        dispatchNotificationsRefresh()
        break
      default:
        break
    }
  })

  return null
}

export default NotificationListener
