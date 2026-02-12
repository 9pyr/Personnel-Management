import { EventType } from 'core/apis/events/schemas'
import { CompanyHolidayType } from 'core/apis/holidays'
import { LeaveRecordType } from 'core/apis/leave/types'

export interface CalendarItemEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  type: 'LEAVE' | 'HOLIDAY' | 'WORK_EVENT'
  leave?: LeaveRecordType
  holiday?: CompanyHolidayType
  workEvent?: EventType
}

export interface EventFormData {
  date: string
  startTime: string
  endTime: string
  title: string
  eventType: string
}

export interface HolidayFormData {
  date: string
  name: string
}
