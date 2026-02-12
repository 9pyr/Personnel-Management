import { AnyValue, JsonLike, isJsonLike } from 'core/endpoints/caseTransform'
import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import { LeaveCreatePayloadType, LeaveRecordType, LeaveUpdatePayloadType } from './types'

export type LeaveBalanceItem = {
  leaveTypeId: string
  code: string
  name: string
  maxDaysPerYear: number
  usedDaysThisYear: number
  remaining: number | null
}

export interface GetListLeaveParams {
  from?: string
  to?: string
  userId?: string
}

function isRecord(value: AnyValue): value is Record<string, JsonLike> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
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

function normalizeLeaveItem(raw: Record<string, JsonLike>): LeaveRecordType {
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

function isAnyValueArray(value: AnyValue): value is AnyValue[] {
  return Array.isArray(value)
}

function getLeavesListFromPayload(data: AnyValue): AnyValue[] {
  if (isAnyValueArray(data)) return [...data]
  const obj = isRecord(data) ? data : null
  if (obj == null) return []
  const raw = obj.data ?? obj.leaves ?? obj.result ?? obj.list ?? obj.items
  if (!isAnyValueArray(raw)) return []
  return [...raw]
}

function parseLeaveList(data: AnyValue): LeaveRecordType[] {
  const list = getLeavesListFromPayload(data)
  const result: LeaveRecordType[] = []
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

export function useListLeave(params?: GetListLeaveParams) {
  return useClientQuery<LeaveRecordType[]>({
    url: '/leaves',
    params: params
      ? {
          from: params.from,
          to: params.to,
          userId: params.userId,
        }
      : undefined,
    select: data => parseLeaveList(data),
  })
}

export function useLeaveById(id: string, options?: { enabled?: boolean }) {
  return useClientQuery<LeaveRecordType>({
    url: `/leaves/${id}`,
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id),
    select: data => {
      try {
        return leaveSchema.parse(data)
      } catch {
        return normalizeLeaveItem(isRecord(data) ? data : {})
      }
    },
  })
}

export function useLeaveBalance() {
  return useClientQuery<LeaveBalanceItem[]>({
    url: '/leaves/balance',
    select: data => leaveBalanceSchema.parse(data),
  })
}

export function useCreateLeave() {
  return useClientMutation<LeaveRecordType, LeaveCreatePayloadType>({
    method: 'POST',
    url: '/leaves/create',
    invalidateQueries: ['/leaves'],
    buildPayload: variables => leaveCreatePayloadSchema.parse(variables),
  })
}

export function useUpdateLeave() {
  return useClientMutation<LeaveRecordType, LeaveUpdatePayloadType>({
    method: 'PUT',
    url: '/leaves/update',
    invalidateQueries: ['/leaves'],
    buildPayload: variables => leaveUpdatePayloadSchema.parse(variables),
  })
}

export function useNextStateLeave() {
  return useClientMutation<void, { id: string }>({
    method: 'PATCH',
    url: variables => `/leaves/next/${variables.id}`,
    invalidateQueries: ['/leaves'],
    buildPayload: () => ({}),
  })
}

export function useRejectStateLeave() {
  return useClientMutation<void, { id: string }>({
    method: 'PATCH',
    url: variables => `/leaves/reject/${variables.id}`,
    invalidateQueries: ['/leaves'],
    buildPayload: () => ({}),
  })
}

export function useCancelLeave() {
  return useClientMutation<void, { id: string }>({
    method: 'PATCH',
    url: variables => `/leaves/${variables.id}/cancel`,
    invalidateQueries: ['/leaves'],
    buildPayload: () => ({}),
  })
}
