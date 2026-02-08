import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import _ from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { createEvent, EVENT_TYPE_LABELS, getEvents, type GetEventsParams } from 'core/apis/events'
import type { Event } from 'core/apis/events/schemas'
import { getHolidays, createHoliday, type CompanyHoliday } from 'core/apis/holidays'
import { getListLeave, type GetListLeaveParams } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { getListUsers } from 'core/apis/auth'
import type { User } from 'core/apis/auth/types'
import { AuthContext } from 'core/contexts/AuthContext'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerSingle } from '@/components/ui/date-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getLeaveStatusLabel, LEAVE_STATUS } from 'modules/leave/constants'
import LeaveStatusBadge from 'modules/leave/components/LeaveStatusBadge'
import { eventsByDate, getMonthRange, leavesByDate } from '../utils/leaveByDate'

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

dayjs.locale('th')

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const FILTER_ALL = '__all__'

function formatMonthTitle(year: number, month: number): string {
  return dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY')
}

/** ข้อความสำหรับ hover วันนั้น: วันหยุด, ใครลาบ้าง ถึงวันไหน, งานอะไรบ้าง */
function buildDayHoverText(
  dayHolidays: CompanyHoliday[],
  leaveItems: { leave: Leave; date: string }[],
  dayEvents: Event[]
): string {
  const holidayLines = dayHolidays.map(h => h.name).filter(Boolean)
  const seen = new Set<string>()
  const leaveLines: string[] = []
  for (const { leave } of leaveItems) {
    const id = leave.id ?? ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    const name = leave.createdByName?.trim() || '—'
    const endStr = leave.endDate ? dayjs(leave.endDate.slice(0, 10)).format('D MMM') : '—'
    leaveLines.push(`${name} ถึง ${endStr}`)
  }
  const eventLines = dayEvents.map(
    e => `${e.startTime ?? ''} ${e.title ?? ''}${e.userName ? ` (${e.userName})` : ''}`.trim()
  )
  const parts: string[] = []
  if (holidayLines.length > 0) parts.push(`วันหยุด: ${holidayLines.join(' · ')}`)
  if (leaveLines.length > 0) parts.push(`การลา: ${leaveLines.join(' · ')}`)
  if (eventLines.length > 0) parts.push(`งาน: ${eventLines.join(' · ')}`)
  return parts.join('\n')
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const user = useContext(AuthContext)

  const [year, setYear] = useState(() => dayjs().year())
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [holidays, setHolidays] = useState<CompanyHoliday[]>([])
  const [loading, setLoading] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '',
    title: '',
    eventType: 'OTHER',
  })
  const [eventSubmitting, setEventSubmitting] = useState(false)
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [holidayForm, setHolidayForm] = useState({ date: dayjs().format('YYYY-MM-DD'), name: '' })
  const [holidaySubmitting, setHolidaySubmitting] = useState(false)

  const { from, to } = getMonthRange(year, month)
  const today = dayjs().format('YYYY-MM-DD')
  const displayLeaves = leaves.filter(
    l => (l.status ?? '') !== LEAVE_STATUS.CANCELLED
  )
  const byDate = leavesByDate(displayLeaves)
  const eventsByDay = eventsByDate(events)
  const holidaysByDay = eventsByDate(holidays)

  /** แต่ละ leave ในเดือนนี้ อยู่วันที่ไหนบ้าง (เรียงวัน) ใช้ทำแถบทาบต่อกัน */
  const leaveDatesMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const [date, items] of byDate) {
      for (const { leave } of items) {
        const id = leave.id ?? ''
        if (!id) continue
        if (!map.has(id)) map.set(id, [])
        map.get(id)!.push(date)
      }
    }
    for (const arr of map.values()) arr.sort()
    return map
  }, [byDate])

  const canListUsers = user?.role === 'ADMIN' || user?.role === 'PEOPLE'
  const fetchUsers = useCallback(async () => {
    if (!canListUsers) {
      setUsers([])
      return
    }
    try {
      const list = await getListUsers()
      setUsers(list)
    } catch {
      setUsers([])
    }
  }, [canListUsers])

  const fetchLeaves = useCallback(
    async (params: GetListLeaveParams) => {
      setLoading(true)
      try {
        let list = await getListLeave(params)
        if (list.length === 0 && params.from && params.to) {
          const all = await getListLeave({ userId: params.userId })
          list = all.filter(
            l => l.startDate <= params.to! && l.endDate >= params.from!
          )
        }
        setLeaves(list)
      } catch {
        toast.error('โหลดข้อมูลการลาไม่สำเร็จ')
        setLeaves([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const fetchEvents = useCallback(
    async (params: GetEventsParams) => {
      try {
        let list = await getEvents(params)
        if (list.length === 0 && params.from && params.to) {
          const all = await getEvents({ userId: params.userId })
          list = all.filter(
            e => (e.date ?? '').slice(0, 10) >= params.from! && (e.date ?? '').slice(0, 10) <= params.to!
          )
        }
        setEvents(list)
      } catch {
        toast.error('โหลดข้อมูลงาน/เหตุการณ์ไม่สำเร็จ')
        setEvents([])
      }
    },
    []
  )

  const fetchHolidays = useCallback(async (params: { from: string; to: string }) => {
    try {
      const list = await getHolidays(params)
      setHolidays(list)
    } catch {
      setHolidays([])
    }
  }, [])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const apiUserId = filterUserId === '' || filterUserId === FILTER_ALL ? undefined : filterUserId
  useEffect(() => {
    void fetchLeaves({ from, to, userId: apiUserId })
  }, [year, month, from, to, apiUserId, fetchLeaves])

  useEffect(() => {
    void fetchEvents({ from, to, userId: apiUserId })
  }, [year, month, from, to, apiUserId, fetchEvents])

  useEffect(() => {
    void fetchHolidays({ from, to })
  }, [year, month, from, to, fetchHolidays])

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(previousYear => previousYear - 1)
    } else {
      setMonth(previousMonth => previousMonth - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(previousYear => previousYear + 1)
    } else {
      setMonth(previousMonth => previousMonth + 1)
    }
  }

  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const handleMonthSelect = (date: Date | undefined) => {
    if (!date) return
    setYear(dayjs(date).year())
    setMonth(dayjs(date).month() + 1)
    setMonthPickerOpen(false)
  }
  const calendarMonthValue = new Date(year, month - 1, 1)

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()
  const calendarRows: (string | null)[][] = []
  let row: (string | null)[] = []
  for (let index = 0; index < startWeekday; index++) {
    row.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    row.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    if (row.length === 7) {
      calendarRows.push(row)
      row = []
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null)
    calendarRows.push(row)
  }

  const pendingInList = leaves.filter(leave => (leave.status ?? '') === LEAVE_STATUS.PENDING)

  const selectValue = filterUserId === '' ? FILTER_ALL : filterUserId
  const handleFilterChange = (value: string) => {
    setFilterUserId(value === FILTER_ALL ? '' : value)
  }

  const canAddEvent = Boolean(user?.id && (filterUserId === '' || filterUserId === user.id))
  const canAddHoliday = user?.role === 'PEOPLE' || user?.role === 'ADMIN'
  const handleOpenEventDialog = () => {
    setEventForm({
      date: today,
      startTime: '09:00',
      endTime: '',
      title: '',
      eventType: 'OTHER',
    })
    setEventDialogOpen(true)
  }
  const handleCreateEvent = async () => {
    const { date, startTime, endTime, title, eventType } = eventForm
    if (!title.trim()) {
      toast.warning('กรุณากรอกหัวข้อ')
      return
    }
    setEventSubmitting(true)
    try {
      await createEvent({
        date,
        startTime,
        endTime: endTime || undefined,
        title: title.trim(),
        eventType: eventType || undefined,
      })
      toast.success('เพิ่มงานแล้ว')
      setEventDialogOpen(false)
      void fetchEvents({ from, to, userId: apiUserId })
    } catch {
      toast.error('เพิ่มงานไม่สำเร็จ')
    } finally {
      setEventSubmitting(false)
    }
  }

  const handleOpenHolidayDialog = () => {
    setHolidayForm({ date: today, name: '' })
    setHolidayDialogOpen(true)
  }
  const handleCreateHoliday = async () => {
    if (!holidayForm.name.trim()) {
      toast.warning('กรุณากรอกชื่อวันหยุด')
      return
    }
    setHolidaySubmitting(true)
    try {
      await createHoliday({ date: holidayForm.date, name: holidayForm.name.trim() })
      toast.success('เพิ่มวันหยุดแล้ว')
      setHolidayDialogOpen(false)
      void fetchHolidays({ from, to })
    } catch {
      toast.error('เพิ่มวันหยุดไม่สำเร็จ')
    } finally {
      setHolidaySubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">ปฏิทิน</h2>
        <p className="text-sm text-muted-foreground">
          แสดงว่าวันไหน ใครทำอะไร อยู่ที่ไหน ตามที่ทุกคนลงไว้ (การลา · งาน/เหตุการณ์ · วันหยุด)
        </p>

        {!_.isEmpty(pendingInList) && (
          <p
            className="cursor-pointer text-sm text-primary"
            onClick={() => navigate('/leave')}
          >
            คำขอลารอการดำเนินการ {pendingInList.length} รายการ →
          </p>
        )}

        <Card className="border bg-card">
          <CardContent className="pt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goPrevMonth}
                  aria-label="เดือนก่อน"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="min-w-[180px] rounded px-2 py-1 text-center text-lg font-semibold hover:bg-accent/50"
                      aria-label="เลือกเดือน"
                    >
                      {formatMonthTitle(year, month)}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      selected={calendarMonthValue}
                      onSelect={handleMonthSelect}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goNextMonth}
                  aria-label="เดือนถัดไป"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">แสดง:</span>
              <Select value={selectValue} onValueChange={handleFilterChange}>
                <SelectTrigger className="min-w-[200px]" aria-label="กรองการลาและงานตามผู้ใช้">
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>ทั้งหมด (ทุกคน)</SelectItem>
                  {user?.id && <SelectItem value={user.id}>ตัวฉัน</SelectItem>}
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                      {u.department ? ` (${u.department})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canAddEvent && (
                <Button size="sm" variant="outline" onClick={handleOpenEventDialog}>
                  <Plus className="mr-1 h-4 w-4" />
                  เพิ่มงาน
                </Button>
              )}
              {canAddHoliday && (
                <Button size="sm" onClick={handleOpenHolidayDialog}>
                  <Plus className="mr-1 h-4 w-4" />
                  เพิ่มวันหยุด
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => {
                  void fetchLeaves({ from, to, userId: apiUserId })
                  void fetchEvents({ from, to, userId: apiUserId })
                  void fetchHolidays({ from, to })
                }}
              >
                {loading ? 'กำลังโหลด...' : 'โหลดใหม่'}
              </Button>
            </div>

            {loading ? (
              <p className="text-muted-foreground">กำลังโหลด...</p>
            ) : (
              <>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <th
                          key={i}
                          className="w-[14.28%] border border-border bg-muted/60 px-2 py-2 text-left text-xs font-semibold text-foreground"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarRows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((date, ci) => {
                          if (!date) {
                            return (
                              <td
                                key={ci}
                                className="min-h-[80px] bg-muted/50"
                              />
                            )
                          }
                          const rawLeaveItems = byDate.get(date) ?? []
                          const dayEvents = eventsByDay.get(date) ?? []
                          const dayHolidays = holidaysByDay.get(date) ?? []
                          const leaveItems = rawLeaveItems.filter(
                            (item, i, arr) =>
                              arr.findIndex(x => (x.leave.id ?? '') === (item.leave.id ?? '')) === i
                          )
                          const isToday = date === today
                          const totalCount = leaveItems.length + dayEvents.length + dayHolidays.length
                          const hoverText =
                            totalCount > 0 ? buildDayHoverText(dayHolidays, leaveItems, dayEvents) : ''
                            return (
                            <td
                              key={ci}
                              className={`min-h-[90px] align-top overflow-visible p-2 ${isToday ? 'bg-accent/50 ring-1 ring-accent' : ''}`}
                              title={hoverText}
                            >
                              <span className="block text-lg font-semibold tabular-nums text-foreground">
                                {dayjs(date).date()}
                              </span>
                              <div className="mt-1 min-h-[72px] flex flex-col gap-1.5">
                                {totalCount === 0 ? (
                                  <p className="py-1 text-[11px] italic text-muted-foreground">ไม่มีรายการ</p>
                                ) : null}
                                {dayHolidays.length > 0 && dayHolidays.map(h => (
                                  <span
                                    key={h.id ?? h.date}
                                    className="block w-full min-h-[26px] rounded border border-rose-700 bg-rose-600 px-2 py-1.5 text-xs font-medium leading-snug text-white"
                                    title={h.name}
                                  >
                                    {h.name ?? 'วันหยุด'}
                                  </span>
                                ))}
                                {leaveItems.length > 0 && leaveItems.map(({ leave: L, date: cellDate }) => {
                                  const name = (L.createdByName ?? (L as Record<string, unknown>).created_by_name as string)?.trim() || '—'
                                  const isPending = (L.status ?? '') === LEAVE_STATUS.PENDING
                                  const dates = leaveDatesMap.get(L.id ?? '') ?? [cellDate]
                                  const isFirst = dates[0] === cellDate
                                  const isLast = dates[dates.length - 1] === cellDate
                                  const isMiddle = !isFirst && !isLast
                                  const rounded = isFirst && isLast ? 'rounded-md' : isFirst ? 'rounded-l-md' : isLast ? 'rounded-r-md' : 'rounded-none'
                                  const stretch = isMiddle ? '-mx-2' : ''
                                  return (
                                    <span
                                      key={`l-${L.id}-${cellDate}`}
                                      className={`block min-h-[26px] w-full min-w-0 border px-2 py-1.5 text-xs font-medium leading-snug text-white ${rounded} ${stretch} ${isPending ? 'border-amber-700 bg-amber-500' : 'border-slate-700 bg-slate-600'} ${isFirst ? '' : ''} ${isMiddle ? 'flex items-center justify-center' : ''}`}
                                      title={`${name} · ${getLeaveStatusLabel(L.status)}${dates.length > 1 ? ` (${dates.length} วัน)` : ''}`}
                                    >
                                      {isFirst ? `${name} หยุด` : '\u00A0'}
                                    </span>
                                  )
                                })}
                                {dayEvents.length > 0 && dayEvents.map(event => {
                                  const who = (event.userName ?? (event as Record<string, unknown>).user_name as string)?.trim() || '—'
                                  const what = (event.title ?? '').trim()
                                  const timeStr = [event.startTime, event.endTime].filter(Boolean).join('–')
                                  const label = `${who} ทำงาน`
                                  return (
                                    <span
                                      key={`e-${event.id}`}
                                      className="block min-h-[26px] w-full rounded-md border border-blue-700 bg-blue-600 px-2 py-1.5 text-xs font-medium leading-snug text-white"
                                      title={[what && `งาน: ${what}`, timeStr && `เวลา: ${timeStr}`].filter(Boolean).join(' · ') || label}
                                    >
                                      {label}
                                    </span>
                                  )
                                })}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && displayLeaves.length === 0 && events.length === 0 && holidays.length === 0 && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  เดือนนี้ยังไม่มีใครลงกิจกรรม
                </p>
              )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มงาน / เหตุการณ์</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>วันที่</Label>
              <DatePickerSingle
                value={eventForm.date ? new Date(eventForm.date) : undefined}
                onChange={d =>
                  setEventForm(f => ({ ...f, date: d ? dayjs(d).format('YYYY-MM-DD') : '' }))
                }
                placeholder="เลือกวันที่"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>เวลาเริ่ม</Label>
                <TimePicker
                  step={300}
                  value={eventForm.startTime}
                  onChange={v => setEventForm(f => ({ ...f, startTime: v }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>เวลาสิ้นสุด (ไม่บังคับ)</Label>
                <TimePicker
                  step={300}
                  value={eventForm.endTime}
                  onChange={v => setEventForm(f => ({ ...f, endTime: v }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>หัวข้อ / รายละเอียด</Label>
              <Input
                value={eventForm.title}
                onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                placeholder="เช่น พบคนไข้, เฝ้าตรวจ, นัดผ่าตัด 09:00"
              />
            </div>
            <div className="grid gap-2">
              <Label>ประเภท</Label>
              <Select
                value={eventForm.eventType}
                onValueChange={v => setEventForm(f => ({ ...f, eventType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateEvent} disabled={eventSubmitting}>
              {eventSubmitting ? 'กำลังบันทึก...' : 'เพิ่มงาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มวันหยุดบริษัท</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>วันที่</Label>
              <DatePickerSingle
                value={holidayForm.date ? new Date(holidayForm.date) : undefined}
                onChange={d =>
                  setHolidayForm(f => ({ ...f, date: d ? dayjs(d).format('YYYY-MM-DD') : '' }))
                }
                placeholder="เลือกวันที่"
              />
            </div>
            <div className="grid gap-2">
              <Label>ชื่อวันหยุด</Label>
              <Input
                value={holidayForm.name}
                onChange={e => setHolidayForm(f => ({ ...f, name: e.target.value }))}
                placeholder="เช่น วันปีใหม่, วันสงกรานต์"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateHoliday} disabled={holidaySubmitting}>
              {holidaySubmitting ? 'กำลังบันทึก...' : 'เพิ่มวันหยุด'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
