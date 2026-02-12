import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'
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

const TYPES_BASE = '/leaves/types'

export function useListLeaveTypes() {
  return useClientQuery<LeaveType[]>({
    url: TYPES_BASE,
    select: data => leaveTypeListSchema.parse(data),
  })
}

export function useCreateLeaveType() {
  return useClientMutation<LeaveType, { code: string; name: string; maxDaysPerYear?: number }>({
    method: 'POST',
    url: TYPES_BASE,
    invalidateQueries: [TYPES_BASE],
    buildPayload: variables => ({
      code: variables.code,
      name: variables.name,
      maxDaysPerYear: variables.maxDaysPerYear ?? 0,
    }),
  })
}

export function useUpdateLeaveType() {
  return useClientMutation<
    LeaveType,
    { id: string; code?: string; name?: string; maxDaysPerYear?: number }
  >({
    method: 'PUT',
    url: variables => `${TYPES_BASE}/${variables.id}`,
    invalidateQueries: [TYPES_BASE],
    buildPayload: variables => ({
      code: variables.code ?? undefined,
      name: variables.name ?? undefined,
      maxDaysPerYear: variables.maxDaysPerYear ?? undefined,
    }),
  })
}

export function useDeleteLeaveType() {
  return useClientMutation<void, { id: string }>({
    method: 'DELETE',
    url: variables => `${TYPES_BASE}/${variables.id}`,
    invalidateQueries: [TYPES_BASE],
    buildPayload: () => ({}),
  })
}
