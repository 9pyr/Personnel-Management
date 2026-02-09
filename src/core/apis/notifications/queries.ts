import { useClientQuery } from 'core/hooks/useClientQuery'
import { useClientMutation } from 'core/hooks/useClientMutation'
import { notificationsListResponseSchema } from './schemas'
import type { NotificationsListResponse } from './types'

export function useNotifications() {
  return useClientQuery<NotificationsListResponse>({
    url: '/notifications',
    select: (data) => notificationsListResponseSchema.parse(data),
  })
}

export function useMarkNotificationRead() {
  return useClientMutation<unknown, { id: string }>({
    method: 'PATCH',
    url: (variables) => `/notifications/${variables.id}/read`,
    invalidateQueries: ['/notifications'],
  })
}

export function useMarkAllNotificationsRead() {
  return useClientMutation<unknown, void>({
    method: 'PATCH',
    url: '/notifications/read-all',
    invalidateQueries: ['/notifications'],
  })
}
