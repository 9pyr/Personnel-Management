import { Event } from 'core/apis/events/schemas'
import { CompanyHoliday } from 'core/apis/holidays'
import { Leave } from 'core/apis/leave/types'

export interface CalendarItemEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  type: 'LEAVE' | 'HOLIDAY' | 'WORK_EVENT'
  leave?: Leave
  holiday?: CompanyHoliday
  workEvent?: Event
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
