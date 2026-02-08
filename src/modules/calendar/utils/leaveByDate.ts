import type { Leave } from 'core/apis/leave/types'

/**
 * สร้างวันที่ YYYY-MM-DD ระหว่าง start ถึง end (รวมทั้งสองวัน)
 */
function datesBetween(start: string, end: string): string[] {
  const out: string[] = []
  const currentDate = new Date(start)
  const endDate = new Date(end)
  while (currentDate <= endDate) {
    out.push(currentDate.toISOString().slice(0, 10))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return out
}

export interface LeaveOnDate {
  leave: Leave
  date: string
}

/**
 * แปลงรายการลาเป็น Map วันที่ -> รายการลาในวันนั้น (แต่ละวันในช่วง start_date..end_date)
 */
export function leavesByDate(leaves: Leave[]): Map<string, LeaveOnDate[]> {
  const map = new Map<string, LeaveOnDate[]>()
  for (const leave of leaves) {
    const start = leave.startDate?.slice(0, 10)
    const end = leave.endDate?.slice(0, 10)
    if (!start || !end) continue
    for (const date of datesBetween(start, end)) {
      const list = map.get(date) ?? []
      list.push({ leave, date })
      map.set(date, list)
    }
  }
  return map
}

export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const date = new Date(year, month - 1, 1)
  const from = date.toISOString().slice(0, 10)
  date.setMonth(date.getMonth() + 1)
  date.setDate(0)
  const to = date.toISOString().slice(0, 10)
  return { from, to }
}

export function eventsByDate<T extends { date: string }>(events: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const event of events) {
    const dateKey = event.date?.slice(0, 10)
    if (!dateKey) continue
    const list = map.get(dateKey) ?? []
    list.push(event)
    map.set(dateKey, list)
  }
  map.forEach(list =>
    list.sort((first, second) =>
      String((first as { startTime?: string }).startTime).localeCompare(
        String((second as { startTime?: string }).startTime)
      )
    )
  )
  return map
}
