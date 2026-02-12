import { useClientMutation } from 'core/hooks/useClientMutation'
import { useClientQuery } from 'core/hooks/useClientQuery'
import { z } from 'zod'

import {
  CompanyHolidayType,
  CreateHolidayPayloadType,
  companyHolidaySchema,
  createHolidayPayloadSchema,
} from './schemas'

export interface GetHolidaysParams {
  from?: string
  to?: string
}

const listSchema = z.array(companyHolidaySchema)

export function useHolidays(params?: GetHolidaysParams) {
  return useClientQuery<CompanyHolidayType[]>({
    url: '/holidays',
    params: params
      ? {
          from: params.from,
          to: params.to,
        }
      : undefined,
    select: data => listSchema.parse(data),
  })
}

export function useCreateHoliday() {
  return useClientMutation<CompanyHolidayType, CreateHolidayPayloadType>({
    method: 'POST',
    url: '/holidays',
    invalidateQueries: ['/holidays'],
    buildPayload: variables => {
      const body = createHolidayPayloadSchema.parse(variables)
      return { date: body.date, name: body.name }
    },
  })
}
