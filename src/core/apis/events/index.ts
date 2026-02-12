import apiCaller from 'core/endpoints/apiCaller'

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
  user_id?: unknown
  userName?: unknown
  user_name?: unknown
  startTime?: unknown
  start_time?: unknown
  endTime?: unknown
  end_time?: unknown
  eventType?: unknown
  event_type?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function getNestedData(value: unknown): unknown {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return undefined
  return value['data']
}

function toEventRawShape(rawInput: Record<string, unknown>): EventRawShape {
  return rawInput
}

function normalizeEvent(rawInput: Record<string, unknown>): Event {
  const raw = toEventRawShape(rawInput)
  const dateSource =
    typeof raw.date === 'string' && raw.date.trim().length > 0
      ? raw.date.trim().slice(0, 10)
      : ''
  const title =
    typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : ''

  const userId =
    typeof raw.userId === 'string'
      ? raw.userId
      : typeof raw.user_id === 'string'
        ? raw.user_id
        : undefined

  const userName =
    typeof raw.userName === 'string'
      ? raw.userName
      : typeof raw.user_name === 'string'
        ? raw.user_name
        : undefined

  const startTimeSource =
    typeof raw.startTime === 'string'
      ? raw.startTime
      : typeof raw.start_time === 'string'
        ? raw.start_time
        : ''

  const endTimeSource =
    typeof raw.endTime === 'string'
      ? raw.endTime
      : typeof raw.end_time === 'string'
        ? raw.end_time
        : undefined

  const eventTypeSource =
    typeof raw.eventType === 'string'
      ? raw.eventType
      : typeof raw.event_type === 'string'
        ? raw.event_type
        : undefined

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

export async function getEvents(params?: GetEventsParams): Promise<Event[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('user_id', params.userId)
  const qs = search.toString()
  const url = qs ? `/events?${qs}` : '/events'
  const { data } = await apiCaller.get<object>(url)
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

export async function getEventById(id: string): Promise<Event> {
  const { data } = await apiCaller.get<object>(`/events/${id}`)
  return eventSchema.parse(data)
}

export async function createEvent(payload: EventCreatePayload): Promise<Event> {
  const body = eventCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/events', {
    date: body.date,
    start_time: body.startTime,
    end_time: body.endTime,
    title: body.title,
    event_type: body.eventType,
  })
  return eventSchema.parse(data)
}

export async function updateEvent(id: string, payload: EventUpdatePayload): Promise<Event> {
  const body = eventUpdatePayloadSchema.parse(payload)
  const send: Record<string, string | number | boolean> = {}
  if (body.date != null) send.date = body.date
  if (body.startTime != null) send.start_time = body.startTime
  if (body.endTime != null) send.end_time = body.endTime
  if (body.title != null) send.title = body.title
  if (body.eventType != null) send.event_type = body.eventType
  const { data } = await apiCaller.put<object>(`/events/${id}`, send)
  return eventSchema.parse(data)
}

export async function deleteEvent(id: string): Promise<void> {
  await apiCaller.delete(`/events/${id}`)
}

export type { Event, EventCreatePayload, EventUpdatePayload }
export { EVENT_TYPE_LABELS } from './schemas'
