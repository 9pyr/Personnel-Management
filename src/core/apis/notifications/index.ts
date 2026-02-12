import apiCaller from 'core/endpoints/apiCaller'

import { notificationsListResponseSchema } from './schemas'
import { NotificationsListResponse } from './types'

export async function getNotifications(): Promise<NotificationsListResponse> {
  const { data } = await apiCaller.get<object>('/notifications')
  return notificationsListResponseSchema.parse(data)
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiCaller.patch(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiCaller.patch('/notifications/read-all')
}
