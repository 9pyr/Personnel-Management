import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

const dateField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((val): string => (val == null || typeof val !== 'string' ? '' : val.trim()))

const leaveSchemaBase = z.object({
  id: uuidLike,
  description: z.string().optional().default(''),
  startDate: dateField,
  endDate: dateField,
  reason: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.string().optional(),
  createdByUserId: z.string().optional(),
  createdByName: z.string().optional(),
  durationType: z.enum(['FULL_DAY', 'HOURLY']).optional(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
})

function toYYYYMMDD(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string') return ''
  const str = value.trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : ''
}

export const leaveSchema = leaveSchemaBase.transform(obj => {
  const startRaw = (typeof obj.startDate === 'string' && obj.startDate.trim()) || ''
  const endRaw = (typeof obj.endDate === 'string' && obj.endDate.trim()) || ''
  return {
    ...obj,
    startDate: toYYYYMMDD(startRaw) || startRaw.slice(0, 10) || '',
    endDate: toYYYYMMDD(endRaw) || endRaw.slice(0, 10) || '',
    createdByName: (obj.createdByName ?? '').trim(),
    durationType: obj.durationType ?? 'FULL_DAY',
    startTime: obj.startTime ?? undefined,
    endTime: obj.endTime ?? undefined,
  }
})

export const leaveTypeSchema = z.object({
  id: z.string().min(1),
  code: z.string(),
  name: z.string(),
  maxDaysPerYear: z.number().int().min(0).optional().default(0),
})

export const leaveTypeListSchema = z
  .union([z.array(leaveTypeSchema), z.null(), z.undefined()])
  .transform((val): z.infer<typeof leaveTypeSchema>[] => val ?? [])

// Frontend uses camelCase for payload
export const leaveCreatePayloadSchema = leaveSchemaBase
  .omit({
    id: true,
    status: true,
    createdByUserId: true,
    createdByName: true,
  })
  .extend({
    leaveTypeId: z.string().min(1, 'กรุณาเลือกประเภทการลา'),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    durationType: z.enum(['FULL_DAY', 'HOURLY']).optional().default('FULL_DAY'),
  })

export const leaveUpdatePayloadSchema = leaveSchemaBase.extend({
  id: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  durationType: z.enum(['FULL_DAY', 'HOURLY']).optional(),
})

export type LeaveRecordType = z.infer<typeof leaveSchema>
export type LeaveType = z.infer<typeof leaveTypeSchema>
export type LeaveCreatePayloadType = z.infer<typeof leaveCreatePayloadSchema>
export type LeaveUpdatePayloadType = z.infer<typeof leaveUpdatePayloadSchema>
