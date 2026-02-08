import type { Leave } from 'core/apis/leave/types'

/**
 * สร้างวันที่ YYYY-MM-DD ระหว่าง start ถึง end (รวมทั้งสองวัน)
 */
function datesBetween(start: string, end: string): string[] {
  const out: string[] = []
  const d = new Date(start)
  const endDate = new Date(end)
  while (d <= endDate) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
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
  const d = new Date(year, month - 1, 1)
  const from = d.toISOString().slice(0, 10)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  const to = d.toISOString().slice(0, 10)
  return { from, to }
}

export function eventsByDate<T extends { date: string }>(events: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const ev of events) {
    const d = ev.date?.slice(0, 10)
    if (!d) continue
    const list = map.get(d) ?? []
    list.push(ev)
    map.set(d, list)
  }
  map.forEach(list => list.sort((a, b) => String((a as { startTime?: string }).startTime).localeCompare(String((b as { startTime?: string }).startTime))))
  return map
}
