import { LeaveRecordType } from 'core/apis/leave/types'
import dayjs from 'dayjs'
import { groupBy, mapValues, range, sortBy } from 'lodash'

const DATE_FORMAT = 'YYYY-MM-DD'

function normalizeDateKey(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim().slice(0, 10)
  if (trimmed.length === 0) return null
  const parsed = dayjs(trimmed)
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : null
}

function extractDateValue(value: string | null | undefined): string | null {
  if (typeof value === 'string') {
    return normalizeDateKey(value)
  }
  return null
}

function getLeaveRecordTypeDateRange(leave: LeaveRecordType): { start: string; end: string } | null {
  const start = extractDateValue(leave.startDate)
  const end = extractDateValue(leave.endDate)

  if ((start === null || start === undefined) && (end === null || end === undefined)) return null

  return {
    start: start ?? end ?? '',
    end: end ?? start ?? '',
  }
}

function datesBetween(start: string, end: string): string[] {
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
    return []
  }

  const daysDiff = endDate.diff(startDate, 'day')
  return range(0, daysDiff + 1).map(offset => startDate.add(offset, 'day').format(DATE_FORMAT))
}

export interface LeaveRecordTypeOnDate {
  leave: LeaveRecordType
  date: string
}

export function leavesByDate(leaves: LeaveRecordType[]): Map<string, LeaveRecordTypeOnDate[]> {
  const items: LeaveRecordTypeOnDate[] = []

  for (const leave of leaves) {
    const range = getLeaveRecordTypeDateRange(leave)
    if (!range) continue

    for (const date of datesBetween(range.start, range.end)) {
      items.push({ leave, date })
    }
  }

  const grouped = groupBy(items, 'date')
  return new Map(Object.entries(grouped))
}

export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const end = start.endOf('month')

  return {
    from: start.format(DATE_FORMAT),
    to: end.format(DATE_FORMAT),
  }
}

interface EventWithDate {
  date?: string
  startTime?: string
}

export function eventsByDate<T extends EventWithDate>(events: T[]): Map<string, T[]> {
  const eventsWithDateKeys: Array<{ event: T; dateKey: string }> = []

  for (const event of events) {
    const dateKey = normalizeDateKey(event.date)
    if (dateKey !== null) {
      eventsWithDateKeys.push({ event, dateKey })
    }
  }

  const grouped = groupBy(eventsWithDateKeys, 'dateKey')
  const sorted = mapValues(grouped, items =>
    sortBy(
      items.map(item => item.event),
      'startTime',
    ),
  )

  return new Map(Object.entries(sorted))
}
