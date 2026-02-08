import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import { eventCreatePayloadSchema, eventSchema, eventUpdatePayloadSchema } from './schemas'
import type { Event, EventCreatePayload, EventUpdatePayload } from './schemas'

const eventListSchema = z.array(eventSchema)

export interface GetEventsParams {
  from?: string
  to?: string
  userId?: string
}

export async function getEvents(params?: GetEventsParams): Promise<Event[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('user_id', params.userId)
  const qs = search.toString()
  const url = qs ? `/events?${qs}` : '/events'
  const { data } = await apiCaller.get<unknown>(url)
  return eventListSchema.parse(data)
}

export async function getEventById(id: string): Promise<Event> {
  const { data } = await apiCaller.get<unknown>(`/events/${id}`)
  return eventSchema.parse(data)
}

export async function createEvent(payload: EventCreatePayload): Promise<Event> {
  const body = eventCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<unknown>('/events', {
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
  const send: Record<string, unknown> = {}
  if (body.date != null) send.date = body.date
  if (body.startTime != null) send.start_time = body.startTime
  if (body.endTime != null) send.end_time = body.endTime
  if (body.title != null) send.title = body.title
  if (body.eventType != null) send.event_type = body.eventType
  const { data } = await apiCaller.put<unknown>(`/events/${id}`, send)
  return eventSchema.parse(data)
}

export async function deleteEvent(id: string): Promise<void> {
  await apiCaller.delete(`/events/${id}`)
}

export type { Event, EventCreatePayload, EventUpdatePayload }
export { EVENT_TYPE_LABELS } from './schemas'
