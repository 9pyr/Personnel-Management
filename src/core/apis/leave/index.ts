import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import type { Leave, LeaveCreatePayload, LeaveUpdatePayload } from './types'

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
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

export const getListLeave = async (params?: GetListLeaveParams): Promise<Leave[]> => {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('userId', params.userId)
  const qs = search.toString()
  const url = qs ? `/leaves?${qs}` : '/leaves'
  const { data } = await apiCaller.get<object>(url)
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
      .transform(v => v ?? null),
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
