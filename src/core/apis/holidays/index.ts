import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import {
  companyHolidaySchema,
  createHolidayPayloadSchema,
  type CompanyHoliday,
  type CreateHolidayPayload,
} from './schemas'

const listSchema = z.array(companyHolidaySchema)

export interface GetHolidaysParams {
  from?: string
  to?: string
}

export async function getHolidays(params?: GetHolidaysParams): Promise<CompanyHoliday[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const url = qs ? `/holidays?${qs}` : '/holidays'
  const { data } = await apiCaller.get<object>(url)
  const raw = Array.isArray(data) ? data : (data as { data?: unknown })?.data
  const list = Array.isArray(raw) ? raw : []
  return listSchema.parse(list)
}

export async function createHoliday(payload: CreateHolidayPayload): Promise<CompanyHoliday> {
  const body = createHolidayPayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/holidays', { date: body.date, name: body.name })
  return companyHolidaySchema.parse(data)
}

export type { CompanyHoliday, CreateHolidayPayload }
