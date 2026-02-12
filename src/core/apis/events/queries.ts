import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'

import {
  type Event,
  type EventCreatePayload,
  type EventUpdatePayload,
  eventCreatePayloadSchema,
  eventSchema,
  eventUpdatePayloadSchema,
} from './schemas'

export interface GetEventsParams {
  from?: string
  to?: string
  userId?: string
}

interface EventRawShape {
  id?: unknown
  date?: unknown
  title?: unknown
  userId?: unknown
  userName?: unknown
  startTime?: unknown
  endTime?: unknown
  eventType?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toEventRawShape(rawInput: Record<string, unknown>): EventRawShape {
  return rawInput
}

function getNestedData(value: unknown): unknown {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return undefined
  return value['data']
}

function normalizeEvent(raw: Record<string, unknown>): Event {
  const source = toEventRawShape(raw)
  const date = (typeof raw.date === 'string' && raw.date.trim().slice(0, 10)) || ''
  return {
    id: typeof source.id === 'string' ? source.id : undefined,
    date,
    title: (typeof source.title === 'string' && source.title.trim()) || '',
    userId: typeof source.userId === 'string' ? source.userId : undefined,
    userName: typeof source.userName === 'string' ? source.userName : undefined,
    startTime: typeof source.startTime === 'string' ? source.startTime : '',
    endTime: typeof source.endTime === 'string' ? source.endTime : undefined,
    eventType: typeof source.eventType === 'string' ? source.eventType : undefined,
  }
}

function parseEventList(data: unknown): Event[] {
  const raw = getNestedData(data)
  const list = Array.isArray(raw) ? raw : []
  const result: Event[] = []
  for (const item of list) {
    if (!isRecord(item)) continue
    try {
      result.push(eventSchema.parse(item))
    } catch {
      result.push(normalizeEvent(item))
    }
  }
  return result
}

export function useEvents(params?: GetEventsParams) {
  return useClientQuery<Event[]>({
    url: '/events',
    params: params
      ? {
          from: params.from,
          to: params.to,
          userId: params.userId,
        }
      : undefined,
    select: data => parseEventList(data),
  })
}

export function useEventById(id: string) {
  return useClientQuery<Event>({
    url: `/events/${id}`,
    enabled: Boolean(id),
    select: data => {
      try {
        return eventSchema.parse(data)
      } catch {
        return normalizeEvent(isRecord(data) ? data : {})
      }
    },
  })
}

export function useCreateEvent() {
  return useClientMutation<Event, EventCreatePayload>({
    method: 'POST',
    url: '/events',
    invalidateQueries: ['/events'],
    buildPayload: variables => eventCreatePayloadSchema.parse(variables),
  })
}

export function useUpdateEvent() {
  return useClientMutation<Event, { id: string } & EventUpdatePayload>({
    method: 'PUT',
    url: variables => `/events/${variables.id}`,
    invalidateQueries: ['/events'],
    buildPayload: variables => {
      const body = eventUpdatePayloadSchema.parse(variables)
      const send: Record<string, string | number | boolean> = {}
      if (body.date != null) send.date = body.date
      if (body.startTime != null) send.startTime = body.startTime
      if (body.endTime != null) send.endTime = body.endTime
      if (body.title != null) send.title = body.title
      if (body.eventType != null) send.eventType = body.eventType
      return { id: variables.id, ...send }
    },
  })
}

export function useDeleteEvent() {
  return useClientMutation<void, { id: string }>({
    method: 'DELETE',
    url: variables => `/events/${variables.id}`,
    invalidateQueries: ['/events'],
    buildPayload: () => ({}),
  })
}
