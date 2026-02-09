import { z } from 'zod'
import { useClientQuery } from 'core/hooks/useClientQuery'
import { useClientMutation } from 'core/hooks/useClientMutation'
import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import type { Leave, LeaveCreatePayload, LeaveUpdatePayload, LeaveBalanceItem } from './types'

export interface GetListLeaveParams {
  from?: string
  to?: string
  userId?: string
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
  const startRaw = raw.startDate ?? raw.start_date ?? ''
  const endRaw = raw.endDate ?? raw.end_date ?? ''
  const start = toYYYYMMDD(startRaw) ||
    (typeof startRaw === 'string' && startRaw.trim().slice(0, 10)) ||
    ''
  const end = toYYYYMMDD(endRaw) ||
    (typeof endRaw === 'string' && endRaw.trim().slice(0, 10)) ||
    ''
  const createdByName =
    (typeof raw.createdByName === 'string' && (raw.createdByName as string).trim()) ||
    (typeof raw.created_by_name === 'string' && (raw.created_by_name as string).trim()) ||
    ''
  const durationType = (raw.durationType ?? raw.duration_type ?? 'FULL_DAY') as 'FULL_DAY' | 'HOURLY'
  const startTime = (raw.startTime ?? raw.start_time) as string | undefined
  const endTime = (raw.endTime ?? raw.end_time) as string | undefined
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
  const obj = data as Record<string, unknown> | null | undefined
  const raw =
    Array.isArray(data)
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
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const obj = item as Record<string, unknown>
    try {
      result.push(leaveSchema.parse(obj))
    } catch {
      result.push(normalizeLeaveItem(obj))
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
    remaining: z.number().nullish().transform(v => v ?? null),
  }),
)

export function useListLeave(params?: GetListLeaveParams) {
  return useClientQuery<Leave[]>({
    url: '/leaves',
    params: params ? {
      from: params.from,
      to: params.to,
      user_id: params.userId,
    } : undefined,
    select: (data) => parseLeaveList(data),
  })
}

export function useLeaveById(
  id: string,
  options?: { enabled?: boolean }
) {
  return useClientQuery<Leave>({
    url: `/leaves/${id}`,
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id),
    select: (data) => {
      try {
        return leaveSchema.parse(data)
      } catch {
        return normalizeLeaveItem(data as Record<string, unknown>)
      }
    },
  })
}

export function useLeaveBalance() {
  return useClientQuery<LeaveBalanceItem[]>({
    url: '/leaves/balance',
    select: (data) => leaveBalanceSchema.parse(data),
  })
}

export function useCreateLeave() {
  return useClientMutation<Leave, LeaveCreatePayload>({
    method: 'POST',
    url: '/leaves/create',
    invalidateQueries: ['/leaves'],
    onMutate: async (variables) => {
      const body = leaveCreatePayloadSchema.parse(variables)
      return body
    },
  })
}

export function useUpdateLeave() {
  return useClientMutation<Leave, LeaveUpdatePayload>({
    method: 'PUT',
    url: '/leaves/update',
    invalidateQueries: ['/leaves'],
    onMutate: async (variables) => {
      const body = leaveUpdatePayloadSchema.parse(variables)
      return body
    },
  })
}

export function useNextStateLeave() {
  return useClientMutation<unknown, { id: string }>({
    method: 'PATCH',
    url: (variables) => `/leaves/next/${variables.id}`,
    invalidateQueries: ['/leaves'],
  })
}

export function useRejectStateLeave() {
  return useClientMutation<unknown, { id: string }>({
    method: 'PATCH',
    url: (variables) => `/leaves/reject/${variables.id}`,
    invalidateQueries: ['/leaves'],
  })
}

export function useCancelLeave() {
  return useClientMutation<unknown, { id: string }>({
    method: 'PATCH',
    url: (variables) => `/leaves/${variables.id}/cancel`,
    invalidateQueries: ['/leaves'],
  })
}
