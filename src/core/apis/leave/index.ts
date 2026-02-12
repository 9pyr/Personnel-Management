import apiCaller from 'core/endpoints/apiCaller'
import { AnyValue, JsonLike, isJsonLike } from 'core/endpoints/caseTransform'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import { Leave, LeaveCreatePayload, LeaveUpdatePayload } from './types'

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
}

export interface GetListLeaveParams {
  from?: string
  to?: string
  userId?: string
}

interface LeaveListResponseShape {
  data?: AnyValue[]
  leaves?: AnyValue[]
  result?: AnyValue[]
  list?: AnyValue[]
  items?: AnyValue[]
}

function toYYYYMMDD(value: JsonLike): string {
  if (value == null) return ''
  if (typeof value === 'string') {
    const str = value.trim().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : ''
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const str = new Date(value).toISOString().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : ''
  }
  return ''
}

function normalizeLeaveItem(raw: Record<string, JsonLike>): Leave {
  const startRaw = raw.startDate ?? ''
  const endRaw = raw.endDate ?? ''
  const start =
    toYYYYMMDD(startRaw) || (typeof startRaw === 'string' && startRaw.trim().slice(0, 10)) || ''
  const end = toYYYYMMDD(endRaw) || (typeof endRaw === 'string' && endRaw.trim().slice(0, 10)) || ''
  const createdByName = (typeof raw.createdByName === 'string' && raw.createdByName.trim()) || ''
  const durationType = raw.durationType === 'HOURLY' ? 'HOURLY' : 'FULL_DAY'
  const startTime = typeof raw.startTime === 'string' ? raw.startTime : undefined
  const endTime = typeof raw.endTime === 'string' ? raw.endTime : undefined
  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    description: typeof raw.description === 'string' ? raw.description : '',
    startDate: start,
    endDate: end,
    reason: typeof raw.reason === 'string' ? raw.reason : undefined,
    leaveTypeId: typeof raw.leaveTypeId === 'string' ? raw.leaveTypeId : undefined,
    status: typeof raw.status === 'string' ? raw.status : undefined,
    createdByUserId: typeof raw.createdByUserId === 'string' ? raw.createdByUserId : undefined,
    createdByName,
    durationType,
    startTime,
    endTime,
  }
}

function getLeavesListFromResponse(data: AnyValue[] | LeaveListResponseShape): AnyValue[] {
  if (Array.isArray(data)) return [...data]
  const raw = data.data ?? data.leaves ?? data.result ?? data.list ?? data.items
  if (!Array.isArray(raw)) return []
  return [...raw]
}

export const getListLeave = async (params?: GetListLeaveParams): Promise<Leave[]> => {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('userId', params.userId)
  const qs = search.toString()
  const url = qs ? `/leaves?${qs}` : '/leaves'
  const { data } = await apiCaller.get<AnyValue[] | LeaveListResponseShape>(url)
  const list = getLeavesListFromResponse(data)
  const result: Leave[] = []
  function isRecordLike(obj: AnyValue): obj is Record<string, AnyValue> {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
  }

  function getObjectPropertyFromAny(obj: AnyValue, key: string): AnyValue | undefined {
    if (!isRecordLike(obj)) return undefined
    const val = obj[key]
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val
    if (val === null || val === undefined) return val
    if (Array.isArray(val) || (typeof val === 'object' && val !== null && !(val instanceof Date)))
      return val
    return undefined
  }

  function toRecord(item: AnyValue): Record<string, AnyValue> | null {
    if (typeof item !== 'object' || item == null || Array.isArray(item)) return null
    const obj: Record<string, AnyValue> = {}
    const keys = Object.keys(item)
    for (const key of keys) {
      const val = getObjectPropertyFromAny(item, key)
      obj[key] = val
    }
    return obj
  }

  for (const item of list) {
    const itemObj = toRecord(item)
    if (itemObj == null) continue
    const record: Record<string, JsonLike> = {}
    const keys = Object.keys(itemObj)
    for (const key of keys) {
      const value = getObjectPropertyFromAny(itemObj, key)
      if (
        value != null &&
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      ) {
        record[key] = value
      } else if (value != null && isJsonLike(value)) {
        record[key] = value
      }
    }
    try {
      result.push(leaveSchema.parse(record))
    } catch {
      result.push(normalizeLeaveItem(record))
    }
  }
  return result
}

export type LeaveBalanceItem = {
  leaveTypeId: string
  code: string
  name: string
  maxDaysPerYear: number
  usedDaysThisYear: number
  remaining: number | null
}

const leaveBalanceSchema = z.array(
  z.object({
    leaveTypeId: z.string(),
    code: z.string(),
    name: z.string(),
    maxDaysPerYear: z.number(),
    usedDaysThisYear: z.number(),
    remaining: z
      .number()
      .nullish()
      .transform(val => val ?? null),
  }),
)

export const getLeaveBalance = async (): Promise<LeaveBalanceItem[]> => {
  const { data } = await apiCaller.get<object>('/leaves/balance')
  return leaveBalanceSchema.parse(data)
}

export const getLeaveById = async (id: string): Promise<Leave> => {
  const { data } = await apiCaller.get<object>(`/leaves/${id}`)
  return parseResponse(data, leaveSchema)
}

export const createLeave = async (payload: LeaveCreatePayload): Promise<Leave> => {
  const body = leaveCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/leaves/create', body)
  return parseResponse(data, leaveSchema)
}

export const updateLeaveById = async (payload: LeaveUpdatePayload): Promise<Leave> => {
  const body = leaveUpdatePayloadSchema.parse(payload)
  const { data } = await apiCaller.put<object>('/leaves/update', body)
  return parseResponse(data, leaveSchema)
}

export const nextStateLeave = async (id: string) => {
  return apiCaller.patch(`/leaves/next/${id}`)
}

export const rejectStateLeave = async (id: string) => {
  return apiCaller.patch(`/leaves/reject/${id}`)
}

export const cancelLeave = async (id: string) => {
  return apiCaller.patch(`/leaves/${id}/cancel`)
}
