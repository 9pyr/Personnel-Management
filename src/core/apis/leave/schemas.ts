import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

export const leaveSchema = z.object({
  id: uuidLike,
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.string().optional(),
  createdByUserId: z.string().optional(),
  createdByName: z.string().optional(),
})

export type Leave = z.infer<typeof leaveSchema>

export const leaveCreatePayloadSchema = leaveSchema.omit({
  id: true,
  status: true,
  createdByUserId: true,
}).extend({ leaveTypeId: z.string().min(1, 'กรุณาเลือกประเภทการลา') })
export type LeaveCreatePayload = z.infer<typeof leaveCreatePayloadSchema>

export const leaveUpdatePayloadSchema = leaveSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
export type LeaveUpdatePayload = z.infer<typeof leaveUpdatePayloadSchema>
