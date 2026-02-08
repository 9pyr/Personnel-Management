import { z } from 'zod'

export const companyHolidaySchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
})

export type CompanyHoliday = z.infer<typeof companyHolidaySchema>

export const createHolidayPayloadSchema = z.object({
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  name: z.string().min(1, 'กรุณากรอกชื่อวันหยุด'),
})

export type CreateHolidayPayload = z.infer<typeof createHolidayPayloadSchema>
