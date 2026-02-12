import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'

import { notificationsListResponseSchema } from './schemas'
import { NotificationsListResponseType } from './types'

export function useNotifications() {
  return useClientQuery<NotificationsListResponseType>({
    url: '/notifications',
    select: data => notificationsListResponseSchema.parse(data),
  })
}

export function useMarkNotificationRead() {
  return useClientMutation<void, { id: string }>({
    method: 'PATCH',
    url: variables => `/notifications/${variables.id}/read`,
    invalidateQueries: ['/notifications'],
  })
}

export function useMarkAllNotificationsRead() {
  return useClientMutation<void, void>({
    method: 'PATCH',
    url: '/notifications/read-all',
    invalidateQueries: ['/notifications'],
  })
}
