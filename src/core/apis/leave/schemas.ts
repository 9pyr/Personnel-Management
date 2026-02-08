import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

const leaveSchemaBase = z.object({
  id: uuidLike,
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.string().optional(),
  createdByUserId: z.string().optional(),
  createdByName: z.string().optional(),
  created_by_name: z.string().optional(),
})

export const leaveSchema = leaveSchemaBase.transform(object => ({
  ...object,
  createdByName: object.createdByName ?? object.created_by_name,
}))

export type Leave = z.infer<typeof leaveSchema>

export const leaveCreatePayloadSchema = leaveSchemaBase.omit({
  id: true,
  status: true,
  createdByUserId: true,
  createdByName: true,
  created_by_name: true,
}).extend({ leaveTypeId: z.string().min(1, 'กรุณาเลือกประเภทการลา') })
export type LeaveCreatePayload = z.infer<typeof leaveCreatePayloadSchema>

export const leaveUpdatePayloadSchema = leaveSchemaBase.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
export type LeaveUpdatePayload = z.infer<typeof leaveUpdatePayloadSchema>
