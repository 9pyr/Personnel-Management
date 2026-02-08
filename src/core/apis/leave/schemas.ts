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
})

function toYYYYMMDD(v: string | null | undefined): string {
  if (v == null || typeof v !== 'string') return ''
  const s = v.trim().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

export const leaveSchema = leaveSchemaBase.transform(obj => {
  const raw = obj as { start_date?: string | null; end_date?: string | null; created_by_name?: string }
  const startRaw =
    (typeof obj.startDate === 'string' && obj.startDate.trim()) ||
    (typeof raw.start_date === 'string' && raw.start_date.trim()) ||
    ''
  const endRaw =
    (typeof obj.endDate === 'string' && obj.endDate.trim()) ||
    (typeof raw.end_date === 'string' && raw.end_date.trim()) ||
    ''
  return {
    ...obj,
    startDate: toYYYYMMDD(startRaw) || startRaw.slice(0, 10) || '',
    endDate: toYYYYMMDD(endRaw) || endRaw.slice(0, 10) || '',
    createdByName: (obj.createdByName ?? raw.created_by_name ?? '').trim(),
  }
})

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
