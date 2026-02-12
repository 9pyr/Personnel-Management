import apiCaller from 'core/endpoints/apiCaller'

import { LeaveType, leaveTypeListSchema, leaveTypeSchema } from './schemas'

export type { LeaveType }

function parseResponse<T>(data: object, schema: { parse: (v: object) => T }): T {
  return schema.parse(data)
}

const TYPES_BASE = '/leaves/types'

export const getListLeaveTypes = async (): Promise<LeaveType[]> => {
  const { data } = await apiCaller.get<object>(TYPES_BASE)
  return parseResponse(data, leaveTypeListSchema)
}

export const createLeaveType = async (payload: {
  code: string
  name: string
  maxDaysPerYear?: number
}): Promise<LeaveType> => {
  const { data } = await apiCaller.post<object>(TYPES_BASE, payload)
  return parseResponse(data, leaveTypeSchema)
}

export const updateLeaveType = async (
  id: string,
  payload: { code?: string; name?: string; maxDaysPerYear?: number },
): Promise<LeaveType> => {
  const { data } = await apiCaller.put<object>(`${TYPES_BASE}/${id}`, payload)
  return parseResponse(data, leaveTypeSchema)
}

export const deleteLeaveType = async (id: string): Promise<void> => {
  await apiCaller.delete(`${TYPES_BASE}/${id}`)
}
