import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import {
  type CompanyHoliday,
  type CreateHolidayPayload,
  companyHolidaySchema,
  createHolidayPayloadSchema,
} from './schemas'

const listSchema = z.array(companyHolidaySchema)

export interface GetHolidaysParams {
  from?: string
  to?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

export async function getHolidays(params?: GetHolidaysParams): Promise<CompanyHoliday[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const url = qs ? `/holidays?${qs}` : '/holidays'
  const { data } = await apiCaller.get<unknown>(url)
  const raw = Array.isArray(data) ? data : isRecord(data) ? data['data'] : undefined
  const list = Array.isArray(raw) ? raw : []
  return listSchema.parse(list)
}

export async function createHoliday(payload: CreateHolidayPayload): Promise<CompanyHoliday> {
  const body = createHolidayPayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/holidays', { date: body.date, name: body.name })
  return companyHolidaySchema.parse(data)
}

export type { CompanyHoliday, CreateHolidayPayload }
