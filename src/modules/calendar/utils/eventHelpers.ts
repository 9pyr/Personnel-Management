import type { Event } from 'core/apis/events/schemas'
import type { CompanyHoliday } from 'core/apis/holidays'
import type { Leave } from 'core/apis/leave/types'
import dayjs from 'dayjs'
import { EVENT_STYLES } from 'modules/calendar/constants'
import type { CalendarItemEvent } from 'modules/calendar/types'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function formatEventDateRange(start: Date, end: Date): string {
  const startLabel = dayjs(start).format('D MMM YYYY')
  const endLabel = dayjs(end).format('D MMM YYYY')
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`
}

export function joinTooltipLines(lines: Array<string | null | undefined>): string {
  return lines
    .map(line => (line ?? '').trim())
    .filter((line): line is string => line.length > 0)
    .join('\n')
}

export function formatEventTooltip(event: CalendarItemEvent): string {
  const dateRange = formatEventDateRange(event.start, event.end)

  switch (event.type) {
    case 'LEAVE': {
      const leave = event.leave
      if (!leave) return `การลา\nวันที่: ${dateRange}`

      const who = leave.createdByName ?? 'ไม่ทราบชื่อ'
      const description = (leave.description ?? '').trim()

      return joinTooltipLines([
        `ผู้ลา: ${who}`,
        `ช่วง: ${dateRange}`,
        description ? `รายละเอียด: ${description}` : null,
      ])
    }

    case 'HOLIDAY': {
      const name = event.holiday?.name ?? 'วันหยุดบริษัท'
      return joinTooltipLines([`วันหยุด: ${name}`, `วันที่: ${dateRange}`])
    }

    case 'WORK_EVENT': {
      const workEvent = event.workEvent
      if (!workEvent) return joinTooltipLines([`งาน`, `วันที่: ${dateRange}`])

      const title = (workEvent.title ?? '').trim() || 'งาน'
      const timeLabel = joinTooltipLines([workEvent.startTime, workEvent.endTime].filter(isNonEmptyString)).replace('\n', '–')

      return joinTooltipLines([
        `งาน: ${title}`,
        `วันที่: ${dateRange}`,
        timeLabel ? `เวลา: ${timeLabel}` : null,
        workEvent.userName ? `ผู้เกี่ยวข้อง: ${workEvent.userName}` : null,
      ])
    }

    default: {
      return joinTooltipLines([event.title, `วันที่: ${dateRange}`])
    }
  }
}

export function formatMonthTitle(year: number, month: number): string {
  return dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY')
}

function createLeaveEvent(leave: Leave): CalendarItemEvent | null {
  const start = leave.startDate ? new Date(leave.startDate) : null
  const end = leave.endDate ? new Date(leave.endDate) : start
  if (!start || !end) return null

  return {
    id: leave.id ?? `${leave.startDate}-${leave.endDate}-${leave.createdByUserId ?? ''}`,
    title: leave.createdByName ? `${leave.createdByName} หยุด` : 'การลา',
    start,
    end,
    allDay: true,
    type: 'LEAVE',
    leave,
  }
}

function createHolidayEvent(holiday: CompanyHoliday): CalendarItemEvent | null {
  const date = holiday.date ? new Date(holiday.date) : null
  if (!date) return null

  return {
    id: holiday.id ?? holiday.date,
    title: holiday.name ?? 'วันหยุด',
    start: date,
    end: date,
    allDay: true,
    type: 'HOLIDAY',
    holiday,
  }
}

function createWorkEvent(workEvent: Event): CalendarItemEvent | null {
  const baseDate = workEvent.date ? new Date(workEvent.date) : null
  if (!baseDate) return null

  return {
    id: workEvent.id ?? `${workEvent.date}-${workEvent.title ?? ''}`,
    title: (workEvent.title ?? '').trim() || 'งาน',
    start: baseDate,
    end: baseDate,
    allDay: true,
    type: 'WORK_EVENT',
    workEvent,
  }
}

export function buildCalendarEvents(
  leaves: Leave[],
  holidays: CompanyHoliday[],
  events: Event[],
): CalendarItemEvent[] {
  const leaveEvents = leaves
    .map(createLeaveEvent)
    .filter((event): event is CalendarItemEvent => event !== null)
  const holidayEvents = holidays
    .map(createHolidayEvent)
    .filter((event): event is CalendarItemEvent => event !== null)
  const workEvents = events
    .map(createWorkEvent)
    .filter((event): event is CalendarItemEvent => event !== null)

  return [...leaveEvents, ...holidayEvents, ...workEvents]
}

export function getEventStyle(event: CalendarItemEvent, userId: string | undefined) {
  const base = EVENT_STYLES.BASE

  const isOwnEvent =
    (event.type === 'LEAVE' && event.leave?.createdByUserId === userId) ||
    (event.type === 'WORK_EVENT' && event.workEvent?.userId === userId) ||
    event.type === 'HOLIDAY'

  if (!isOwnEvent) {
    return { style: { ...base, ...EVENT_STYLES.OTHER } }
  }

  const typeStyle =
    event.type === 'HOLIDAY'
      ? EVENT_STYLES.HOLIDAY
      : event.type === 'WORK_EVENT'
        ? EVENT_STYLES.WORK_EVENT
        : EVENT_STYLES.LEAVE

  return { style: { ...base, ...typeStyle } }
}
