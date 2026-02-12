import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'

import { type AnyValue, type JsonLike, isJsonLike } from 'core/endpoints/caseTransform'

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

function isRecord(value: AnyValue): value is Record<string, JsonLike> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toAnyValueFromArray(item: AnyValue): AnyValue {
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null) {
    return item
  }
  if (typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date)) {
    return item
  }
  return null
}

function convertAnyToAnyValue(value: AnyValue): AnyValue {
  return value
}

function getArrayItemFromAny(arr: AnyValue, index: number): AnyValue {
  const array = arr
  const item = array[index]
  return convertAnyToAnyValue(item)
}

function getNestedData(value: AnyValue): JsonLike | undefined {
  if (Array.isArray(value)) {
    const arr: JsonLike[] = []
    for (let i = 0; i < value.length; i++) {
      const item = getArrayItemFromAny(value, i)
      const itemChecked = toAnyValueFromArray(item)
      if (itemChecked != null && isJsonLike(itemChecked)) {
        arr.push(itemChecked)
      }
    }
    return arr.length === value.length ? arr : undefined
  }
  if (!isRecord(value)) return undefined
  return value['data']
}

function normalizeEvent(raw: Record<string, JsonLike>): Event {
  const date = (typeof raw.date === 'string' && raw.date.trim().slice(0, 10)) || ''
  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    date,
    title: (typeof raw.title === 'string' && raw.title.trim()) || '',
    userId: typeof raw.userId === 'string' ? raw.userId : undefined,
    userName: typeof raw.userName === 'string' ? raw.userName : undefined,
    startTime: typeof raw.startTime === 'string' ? raw.startTime : '',
    endTime: typeof raw.endTime === 'string' ? raw.endTime : undefined,
    eventType: typeof raw.eventType === 'string' ? raw.eventType : undefined,
  }
}

function parseEventList(data: AnyValue): Event[] {
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
