import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import type { Leave } from './types'

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
}

const leaveListSchema = z
  .union([z.array(leaveSchema), z.null(), z.undefined()])
  .transform((v): Leave[] => v ?? [])

export interface GetListLeaveParams {
  from?: string
  to?: string
  userId?: string
}

export const getListLeave = async (params?: GetListLeaveParams): Promise<Leave[]> => {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.userId) search.set('user_id', params.userId)
  const qs = search.toString()
  const url = qs ? `/leaves?${qs}` : '/leaves'
  const { data } = await apiCaller.get<object>(url)
  return parseResponse(data, leaveListSchema)
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
    remaining: z.number().nullish().transform(v => v ?? null),
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

export const createLeave = async (payload: Leave): Promise<Leave> => {
  const body = leaveCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<object>('/leaves/create', body)
  return parseResponse(data, leaveSchema)
}

export const updateLeaveById = async (payload: Leave): Promise<Leave> => {
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
