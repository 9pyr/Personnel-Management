import apiCaller from 'core/endpoints/apiCaller'
import { AnyValue, JsonLike, isJsonLike } from 'core/endpoints/caseTransform'

import {
  EventType,
  EventCreatePayloadType,
  EventUpdatePayloadType,
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
  if (
    typeof item === 'string' ||
    typeof item === 'number' ||
    typeof item === 'boolean' ||
    item === null
  ) {
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

function isAnyValueArray(value: AnyValue): value is AnyValue[] {
  return Array.isArray(value)
}

function getArrayItemFromAny(arr: AnyValue, index: number): AnyValue {
  if (!isAnyValueArray(arr)) return undefined
  const item = arr[index]
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

function normalizeEvent(raw: Record<string, JsonLike>): EventType {
  const dateSource =
    typeof raw.date === 'string' && raw.date.trim().length > 0 ? raw.date.trim().slice(0, 10) : ''
  const title = typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : ''
  const userId = typeof raw.userId === 'string' ? raw.userId : undefined
  const userName = typeof raw.userName === 'string' ? raw.userName : undefined
  const startTimeSource = typeof raw.startTime === 'string' ? raw.startTime : ''
  const endTimeSource = typeof raw.endTime === 'string' ? raw.endTime : undefined
  const eventTypeSource = typeof raw.eventType === 'string' ? raw.eventType : undefined

  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    date: dateSource,
    title,
    userId,
    userName,
    startTime: startTimeSource || '',
    endTime: endTimeSource,
    eventType: eventTypeSource,
  }
}

export async function getEvents(params?: GetEventsParams): Promise<EventType[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('userId', params.userId)
  const qs = search.toString()
  const url = qs ? `/events?${qs}` : '/events'
  const { data } = await apiCaller.get<object>(url)
  const raw = getNestedData(data)
  const list = Array.isArray(raw) ? raw : []
  const result: EventType[] = []
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

export async function getEventById(id: string): Promise<EventType> {
  const { data } = await apiCaller.get<object>(`/events/${id}`)
  return eventSchema.parse(data)
}

export async function createEvent(payload: EventCreatePayloadType): Promise<EventType> {
  const body = eventCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/events', {
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    title: body.title,
    eventType: body.eventType,
  })
  return eventSchema.parse(data)
}

export async function updateEvent(id: string, payload: EventUpdatePayloadType): Promise<EventType> {
  const body = eventUpdatePayloadSchema.parse(payload)
  const send: Record<string, string | number | boolean> = {}
  if (body.date != null) send.date = body.date
  if (body.startTime != null) send.startTime = body.startTime
  if (body.endTime != null) send.endTime = body.endTime
  if (body.title != null) send.title = body.title
  if (body.eventType != null) send.eventType = body.eventType
  const { data } = await apiCaller.put<object>(`/events/${id}`, send)
  return eventSchema.parse(data)
}

export async function deleteEvent(id: string): Promise<void> {
  await apiCaller.delete(`/events/${id}`)
}

export type { EventType, EventCreatePayloadType, EventUpdatePayloadType }
export { EVENT_TYPE_LABELS } from './schemas'
