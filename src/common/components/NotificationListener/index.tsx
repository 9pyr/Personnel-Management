import { dispatchNotificationsRefresh } from 'common/components/Layout/components/NotificationButton'
import type { FeedComment } from 'core/apis/feed/types'
import { useWebSocket } from 'core/hooks/useWebSocket'
import { dispatchFeedComment } from 'modules/feed/feedRealtime'
import { toast } from 'sonner'

function NotificationListener() {
  useWebSocket(msg => {
    switch (msg.type) {
      case 'LEAVE_APPROVED':
        toast.success('การลาของคุณได้รับการอนุมัติแล้ว')
        dispatchNotificationsRefresh()
        break
      case 'LEAVE_REJECTED':
        toast.warning('การลาของคุณถูกปฏิเสธ')
        dispatchNotificationsRefresh()
        break
      case 'NEW_LEAVE_REQUEST':
        toast.info('มีคำขอลาใหม่ รอการดำเนินการ')
        dispatchNotificationsRefresh()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leave-list-refresh'))
        }
        break
      case 'LEAVE_CANCELLED':
        toast.info('มีคำขอลาถูกยกเลิก')
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
        toast.info('มีความคิดเห็นใหม่ในโพสต์ของคุณ')
        dispatchNotificationsRefresh()
        break
      case 'FEED_COMMENT_REPLY':
        toast.info('มีคนตอบกลับความคิดเห็นของคุณ')
        dispatchNotificationsRefresh()
        break
      default:
        break
    }
  })

  return null
}

export default NotificationListener
