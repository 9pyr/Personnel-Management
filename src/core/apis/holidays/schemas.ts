import { z } from 'zod'

export const companyHolidaySchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
})

export const createHolidayPayloadSchema = z.object({
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  name: z.string().min(1, 'กรุณากรอกชื่อวันหยุด'),
})

export type CompanyHolidayType = z.infer<typeof companyHolidaySchema>
export type CreateHolidayPayloadType = z.infer<typeof createHolidayPayloadSchema>
