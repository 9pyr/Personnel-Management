import { z } from 'zod'

const uuidLike = z.string().min(1).optional()

const eventSchemaRaw = z
  .object({
    id: uuidLike,
    user_id: z.string().optional(),
    userId: z.string().optional(),
    user_name: z.string().optional(),
    userName: z.string().optional(),
    date: z.string(),
    start_time: z.string().optional(),
    startTime: z.string().optional(),
    end_time: z.string().optional(),
    endTime: z.string().optional(),
    title: z.string(),
    event_type: z.string().optional(),
    eventType: z.string().optional(),
  })
  .transform(object => {
    const raw = object as {
      user_name?: string
      user_id?: string
      start_time?: string
      end_time?: string
      event_type?: string
    }
    return {
      ...object,
      userId: (object as { userId?: string }).userId ?? raw.user_id,
      userName: (object as { userName?: string }).userName ?? raw.user_name,
      startTime: (object as { startTime?: string }).startTime ?? raw.start_time ?? '',
      endTime: (object as { endTime?: string }).endTime ?? raw.end_time,
      eventType: (object as { eventType?: string }).eventType ?? raw.event_type,
    }
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
