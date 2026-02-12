import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import type { Leave, LeaveCreatePayload, LeaveUpdatePayload } from './types'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toYYYYMMDD(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') {
    const s = v.trim().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
  }
  if (typeof v === 'number' && !Number.isNaN(v)) {
    const s = new Date(v).toISOString().slice(0, 10)
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
  }
  return ''
}

function normalizeLeaveItem(raw: Record<string, unknown>): Leave {
  const startRaw = raw.startDate ?? ''
  const endRaw = raw.endDate ?? ''
  const start =
    toYYYYMMDD(startRaw) || (typeof startRaw === 'string' && startRaw.trim().slice(0, 10)) || ''
  const end = toYYYYMMDD(endRaw) || (typeof endRaw === 'string' && endRaw.trim().slice(0, 10)) || ''
  const createdByName =
    (typeof raw.createdByName === 'string' && raw.createdByName.trim()) || ''
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

function parseLeaveList(data: unknown): Leave[] {
  const obj = isRecord(data) ? data : undefined
  const raw = Array.isArray(data)
    ? data
    : Array.isArray(obj?.data)
      ? obj?.data
      : Array.isArray(obj?.leaves)
        ? obj?.leaves
        : Array.isArray(obj?.result)
          ? obj?.result
          : Array.isArray(obj?.list)
            ? obj?.list
            : Array.isArray(obj?.items)
              ? obj?.items
              : []
  const list = Array.isArray(raw) ? raw : []
  const result: Leave[] = []
  for (const item of list) {
    if (!isRecord(item)) continue
    try {
      result.push(leaveSchema.parse(item))
    } catch {
      result.push(normalizeLeaveItem(item))
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
      .transform(v => v ?? null),
  }),
)

export function useListLeave(params?: GetListLeaveParams) {
  return useClientQuery<Leave[]>({
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
  return useClientQuery<Leave>({
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
  return useClientMutation<Leave, LeaveCreatePayload>({
    method: 'POST',
    url: '/leaves/create',
    invalidateQueries: ['/leaves'],
    buildPayload: variables => leaveCreatePayloadSchema.parse(variables),
  })
}

export function useUpdateLeave() {
  return useClientMutation<Leave, LeaveUpdatePayload>({
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
