import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

import { leaveCreatePayloadSchema, leaveSchema, leaveUpdatePayloadSchema } from './schemas'
import type { Leave } from './types'

function parseResponse<T>(data: unknown, schema: { parse: (v: unknown) => T }): T {
  return schema.parse(data)
}

const leaveListSchema = z
  .union([z.array(leaveSchema), z.null(), z.undefined()])
  .transform((v): Leave[] => v ?? [])

export const getListLeave = async (): Promise<Leave[]> => {
  const { data } = await apiCaller.get<unknown>('/leaves')
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
  const { data } = await apiCaller.get<unknown>('/leaves/balance')
  return leaveBalanceSchema.parse(data)
}

export const getLeaveById = async (id: string): Promise<Leave> => {
  const { data } = await apiCaller.get<unknown>(`/leaves/${id}`)
  return parseResponse(data, leaveSchema)
}

export const createLeave = async (payload: Leave): Promise<Leave> => {
  const body = leaveCreatePayloadSchema.parse(payload)
  const { data } = await apiCaller.post<unknown>('/leaves/create', body)
  return parseResponse(data, leaveSchema)
}

export const updateLeaveById = async (payload: Leave): Promise<Leave> => {
  const body = leaveUpdatePayloadSchema.parse(payload)
  const { data } = await apiCaller.put<unknown>('/leaves/update', body)
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
