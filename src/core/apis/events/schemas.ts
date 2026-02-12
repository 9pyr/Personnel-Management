import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

const eventSchemaRaw = z.object({
  id: uuidLike,
  userId: z.string().optional(),
  userName: z.string().optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  title: z.string(),
  eventType: z.string().optional(),
})

export const eventSchema = eventSchemaRaw

export type Event = z.infer<typeof eventSchema>

export const eventCreatePayloadSchema = z.object({
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  startTime: z.string().min(1, 'กรุณากรอกเวลาเริ่ม'),
  endTime: z.string().optional(),
  title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  eventType: z.string().optional(),
})
export type EventCreatePayload = z.infer<typeof eventCreatePayloadSchema>

export const eventUpdatePayloadSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  title: z.string().optional(),
  eventType: z.string().optional(),
})
export type EventUpdatePayload = z.infer<typeof eventUpdatePayloadSchema>

export const EVENT_TYPE_LABELS: Record<string, string> = {
  PATIENT_VISIT: 'พบคนไข้',
  ROUNDS: 'เฝ้าตรวจ/เวร',
  SURGERY: 'นัดผ่าตัด',
  MEETING: 'ประชุม',
  OTHER: 'อื่นๆ',
}
