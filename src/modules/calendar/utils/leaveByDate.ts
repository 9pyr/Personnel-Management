import type { Leave } from 'core/apis/leave/types'

/** ทำให้เป็น YYYY-MM-DD (รับได้ทั้ง ISO หรือ YYYY-MM-DD หรือค่าที่แปลงได้) */
function toDateKey(value: string | undefined): string | null {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null
  const slice10 = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice10)) return slice10
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** ดึง start/end จาก leave (รองรับทั้ง camel และ snake และค่าผิดประเภท) */
function getLeaveDateRange(leave: Leave): { start: string; end: string } {
  const raw = leave as Record<string, unknown>
  const a =
    toDateKey(leave.startDate as string | undefined) ??
    toDateKey(raw.start_date as string | undefined) ??
    (typeof leave.startDate === 'string' && leave.startDate.trim()
      ? leave.startDate.trim().slice(0, 10)
      : typeof raw.start_date === 'string' && (raw.start_date as string).trim()
        ? (raw.start_date as string).trim().slice(0, 10)
        : '')
  const b =
    toDateKey(leave.endDate as string | undefined) ??
    toDateKey(raw.end_date as string | undefined) ??
    (typeof leave.endDate === 'string' && leave.endDate.trim()
      ? leave.endDate.trim().slice(0, 10)
      : typeof raw.end_date === 'string' && (raw.end_date as string).trim()
        ? (raw.end_date as string).trim().slice(0, 10)
        : '')
  let start = /^\d{4}-\d{2}-\d{2}$/.test(a) ? a : ''
  let end = /^\d{4}-\d{2}-\d{2}$/.test(b) ? b : ''
  if (!start && end) start = end
  if (!end && start) end = start
  return { start, end }
}

/** สร้างวันที่ YYYY-MM-DD ระหว่าง start ถึง end (รวมทั้งสองวัน) แบบไม่พึ่ง timezone */
function datesBetween(start: string, end: string): string[] {
  const out: string[] = []
  const startNorm = toDateKey(start) ?? start.slice(0, 10)
  const endNorm = toDateKey(end) ?? end.slice(0, 10)
  const [sy, sm, sd] = startNorm.split('-').map(Number)
  const [ey, em, ed] = endNorm.split('-').map(Number)
  if (Number.isNaN(sy) || Number.isNaN(ey)) return []
  let y = sy
  let m = sm
  let d = sd
  while (y < ey || (y === ey && m < em) || (y === ey && m === em && d <= ed)) {
    out.push(
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    )
    d += 1
    if (d > new Date(y, m, 0).getDate()) {
      d = 1
      m += 1
      if (m > 12) {
        m = 1
        y += 1
      }
    }
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
    const { start, end } = getLeaveDateRange(leave)
    if (!start && !end) continue
    const from = start || end
    const to = end || start
    for (const date of datesBetween(from, to)) {
      const list = map.get(date) ?? []
      list.push({ leave, date })
      map.set(date, list)
    }
  }
  return map
}

/** ช่วงวันต้นเดือนถึงปลายเดือน (YYYY-MM-DD) ไม่พึ่ง toISOString เพื่อไม่ให้ timezone เลื่อนวัน */
export function getMonthRange(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

export function eventsByDate<T extends { date?: string }>(events: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const event of events) {
    const dateKey = toDateKey(event.date) ?? event.date?.trim().slice(0, 10)
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
