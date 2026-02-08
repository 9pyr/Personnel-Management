import apiCaller from 'core/endpoints/apiCaller'
import { z } from 'zod'

const leaveTypeSchema = z.object({
  id: z.string().min(1),
  code: z.string(),
  name: z.string(),
  maxDaysPerYear: z.number().int().min(0).optional().default(0),
})
export type LeaveType = z.infer<typeof leaveTypeSchema>

const leaveTypeListSchema = z
  .union([z.array(leaveTypeSchema), z.null(), z.undefined()])
  .transform((v): LeaveType[] => v ?? [])

function parseResponse<T>(data: unknown, schema: { parse: (v: unknown) => T }): T {
  return schema.parse(data)
}

const TYPES_BASE = '/leaves/types'

export const getListLeaveTypes = async (): Promise<LeaveType[]> => {
  const { data } = await apiCaller.get<unknown>(TYPES_BASE)
  return parseResponse(data, leaveTypeListSchema)
}

export const createLeaveType = async (payload: {
  code: string
  name: string
  maxDaysPerYear?: number
}): Promise<LeaveType> => {
  const { data } = await apiCaller.post<unknown>(TYPES_BASE, payload)
  return parseResponse(data, leaveTypeSchema)
}

export const updateLeaveType = async (
  id: string,
  payload: { code?: string; name?: string; maxDaysPerYear?: number }
): Promise<LeaveType> => {
  const { data } = await apiCaller.put<unknown>(`${TYPES_BASE}/${id}`, payload)
  return parseResponse(data, leaveTypeSchema)
}

export const deleteLeaveType = async (id: string): Promise<void> => {
  await apiCaller.delete(`${TYPES_BASE}/${id}`)
}
