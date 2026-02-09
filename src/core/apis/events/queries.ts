import { useClientQuery } from 'core/hooks/useClientQuery'
import { useClientMutation } from 'core/hooks/useClientMutation'
import { eventCreatePayloadSchema, eventSchema, eventUpdatePayloadSchema } from './schemas'
import type { Event, EventCreatePayload, EventUpdatePayload } from './schemas'

export interface GetEventsParams {
  from?: string
  to?: string
  userId?: string
}

function normalizeEvent(raw: Record<string, unknown>): Event {
  const date = (typeof raw.date === 'string' && raw.date.trim().slice(0, 10)) || ''
  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    date,
    title: (typeof raw.title === 'string' && raw.title.trim()) || '',
    userId: (raw.userId as string) ?? (raw.user_id as string),
    userName: (raw.userName as string) ?? (raw.user_name as string),
    startTime: (raw.startTime as string) ?? (raw.start_time as string) ?? '',
    endTime: (raw.endTime as string) ?? (raw.end_time as string),
    eventType: (raw.eventType as string) ?? (raw.event_type as string),
  }
}

function parseEventList(data: unknown): Event[] {
  const raw = Array.isArray(data) ? data : (data as { data?: unknown })?.data
  const list = Array.isArray(raw) ? raw : []
  const result: Event[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    try {
      result.push(eventSchema.parse(item))
    } catch {
      result.push(normalizeEvent(item as Record<string, unknown>))
    }
  }
  return result
}

export function useEvents(params?: GetEventsParams) {
  return useClientQuery<Event[]>({
    url: '/events',
    params: params ? {
      from: params.from,
      to: params.to,
      user_id: params.userId,
    } : undefined,
    select: (data) => parseEventList(data),
  })
}

export function useEventById(id: string) {
  return useClientQuery<Event>({
    url: `/events/${id}`,
    enabled: Boolean(id),
    select: (data) => {
      try {
        return eventSchema.parse(data)
      } catch {
        return normalizeEvent(data as Record<string, unknown>)
      }
    },
  })
}

export function useCreateEvent() {
  return useClientMutation<Event, EventCreatePayload>({
    method: 'POST',
    url: '/events',
    invalidateQueries: ['/events'],
    onMutate: async (variables) => {
      return eventCreatePayloadSchema.parse(variables)
    },
  })
}

export function useUpdateEvent() {
  return useClientMutation<Event, { id: string } & EventUpdatePayload>({
    method: 'PUT',
    url: (variables) => `/events/${variables.id}`,
    invalidateQueries: ['/events'],
    onMutate: async (variables) => {
      const body = eventUpdatePayloadSchema.parse(variables)
      const send: Record<string, string | number | boolean> = {}
      if (body.date != null) send.date = body.date
      if (body.startTime != null) send.start_time = body.startTime
      if (body.endTime != null) send.end_time = body.endTime
      if (body.title != null) send.title = body.title
      if (body.eventType != null) send.event_type = body.eventType
      return { id: variables.id, ...send } as { id: string } & EventUpdatePayload
    },
  })
}

export function useDeleteEvent() {
  return useClientMutation<unknown, { id: string }>({
    method: 'DELETE',
    url: (variables) => `/events/${variables.id}`,
    invalidateQueries: ['/events'],
  })
}
