import { z } from 'zod'

export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  relatedId: z.string().uuid().nullable().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const notificationsListResponseSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number().int().min(0),
})

export type Notification = z.infer<typeof notificationSchema>
export type NotificationsListResponse = z.infer<typeof notificationsListResponseSchema>
