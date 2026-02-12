import apiCaller from 'core/endpoints/apiCaller'
import { AnyValue, JsonLike } from 'core/endpoints/caseTransform'
import { z } from 'zod'

import {
  CompanyHolidayType,
  CreateHolidayPayloadType,
  companyHolidaySchema,
  createHolidayPayloadSchema,
} from './schemas'

const listSchema = z.array(companyHolidaySchema)

export interface GetHolidaysParams {
  from?: string
  to?: string
}

function isRecord(value: AnyValue): value is Record<string, JsonLike> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

export async function getHolidays(params?: GetHolidaysParams): Promise<CompanyHolidayType[]> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  const url = qs ? `/holidays?${qs}` : '/holidays'
  const { data } = await apiCaller.get<JsonLike>(url)
  const raw = Array.isArray(data) ? data : isRecord(data) ? data['data'] : undefined
  const list = Array.isArray(raw) ? raw : []
  return listSchema.parse(list)
}

export async function createHoliday(
  payload: CreateHolidayPayloadType,
): Promise<CompanyHolidayType> {
  const body = createHolidayPayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/holidays', { date: body.date, name: body.name })
  return companyHolidaySchema.parse(data)
}

export type { CompanyHolidayType, CreateHolidayPayloadType }
