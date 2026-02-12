import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

const dateField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v): string => (v == null || typeof v !== 'string' ? '' : v.trim()))

const leaveSchemaBase = z.object({
  id: uuidLike,
  description: z.string().optional().default(''),
  startDate: dateField,
  endDate: dateField,
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  reason: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.string().optional(),
  createdByUserId: z.string().optional(),
  createdByName: z.string().optional(),
  created_by_name: z.string().optional(),
  durationType: z.enum(['FULL_DAY', 'HOURLY']).optional(),
  duration_type: z.enum(['FULL_DAY', 'HOURLY']).nullish(),
  startTime: z.string().nullish(),
  start_time: z.string().nullish(),
  endTime: z.string().nullish(),
  end_time: z.string().nullish(),
})

function toYYYYMMDD(v: string | null | undefined): string {
  if (v == null || typeof v !== 'string') return ''
  const s = v.trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

export const leaveSchema = leaveSchemaBase.transform(obj => {
  const startRaw =
    (typeof obj.startDate === 'string' && obj.startDate.trim()) ||
    (typeof obj.start_date === 'string' && obj.start_date.trim()) ||
    ''
  const endRaw =
    (typeof obj.endDate === 'string' && obj.endDate.trim()) ||
    (typeof obj.end_date === 'string' && obj.end_date.trim()) ||
    ''
  return {
    ...obj,
    startDate: toYYYYMMDD(startRaw) || startRaw.slice(0, 10) || '',
    endDate: toYYYYMMDD(endRaw) || endRaw.slice(0, 10) || '',
    createdByName: (obj.createdByName ?? obj.created_by_name ?? '').trim(),
    durationType: (obj.durationType ?? obj.duration_type ?? 'FULL_DAY'),
    startTime: (obj.startTime ?? obj.start_time ?? undefined) ?? undefined,
    endTime: (obj.endTime ?? obj.end_time ?? undefined) ?? undefined,
  }
})

export type Leave = z.infer<typeof leaveSchema>

// Frontend uses camelCase for payload
export const leaveCreatePayloadSchema = leaveSchemaBase
  .omit({
    id: true,
    status: true,
    createdByUserId: true,
    createdByName: true,
    created_by_name: true,
  })
  .extend({
    leaveTypeId: z.string().min(1, 'กรุณาเลือกประเภทการลา'),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    durationType: z.enum(['FULL_DAY', 'HOURLY']).optional().default('FULL_DAY'),
  })
export type LeaveCreatePayload = z.infer<typeof leaveCreatePayloadSchema>

export const leaveUpdatePayloadSchema = leaveSchemaBase.extend({
  id: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  durationType: z.enum(['FULL_DAY', 'HOURLY']).optional(),
})
export type LeaveUpdatePayload = z.infer<typeof leaveUpdatePayloadSchema>
