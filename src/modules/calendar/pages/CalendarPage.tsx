import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { createEvent, EVENT_TYPE_LABELS, getEvents, type GetEventsParams } from 'core/apis/events'
import type { Event } from 'core/apis/events/schemas'
import { getListLeave, type GetListLeaveParams } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { getListUsers } from 'core/apis/auth'
import type { User } from 'core/apis/auth/types'
import { authUserState } from 'core/stores/auth'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePickerSingle } from '@/components/ui/date-picker'
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

import { eventsByDate, getMonthRange, leavesByDate } from '../utils/leaveByDate'

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

dayjs.locale('th')

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const FILTER_ALL = '__all__'

function formatMonthTitle(year: number, month: number): string {
  return dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY')
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const user = useRecoilValue(authUserState)

  const [year, setYear] = useState(() => dayjs().year())
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [events, setEvents] = useState<Event[]>([])
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

  const { from, to } = getMonthRange(year, month)
  const byDate = leavesByDate(leaves)
  const eventsByDay = eventsByDate(events)
  const today = dayjs().format('YYYY-MM-DD')

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
        const list = await getListLeave(params)
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
        const list = await getEvents(params)
        setEvents(list)
      } catch {
        toast.error('โหลดข้อมูลงาน/เหตุการณ์ไม่สำเร็จ')
        setEvents([])
      }
    },
    []
  )

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const apiUserId = filterUserId === '' || filterUserId === FILTER_ALL ? undefined : filterUserId
  useEffect(() => {
    void fetchLeaves({
      from,
      to,
      userId: apiUserId,
    })
  }, [from, to, apiUserId, fetchLeaves])

  useEffect(() => {
    void fetchEvents({
      from,
      to,
      userId: apiUserId,
    })
  }, [from, to, apiUserId, fetchEvents])

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()
  const calendarRows: (string | null)[][] = []
  let row: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) {
    row.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    if (row.length === 7) {
      calendarRows.push(row)
      row = []
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null)
    calendarRows.push(row)
  }

  const todayLeaves = byDate.get(today) ?? []
  const todayEvents = eventsByDay.get(today) ?? []
  const pendingInList = leaves.filter(l => (l.status ?? '') === 'PENDING')

  const selectValue = filterUserId === '' ? FILTER_ALL : filterUserId
  const handleFilterChange = (value: string) => {
    setFilterUserId(value === FILTER_ALL ? '' : value)
  }

  const canAddEvent = Boolean(user?.id && (filterUserId === '' || filterUserId === user.id))
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

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">ปฏิทินการลา</h2>

        <Card className="border bg-card">
          <CardContent className="pt-6">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              งานวันนี้ · {dayjs().format('D MMMM YYYY')}
            </p>
            {todayLeaves.length > 0 || todayEvents.length > 0 ? (
              <div className="flex flex-col gap-2">
                {todayLeaves.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground">การลา</p>
                    {todayLeaves.map(({ leave }) => {
                      const name = leave.createdByName ?? '—'
                      const status = leave.status ?? ''
                      const isMe = user?.id && leave.createdByUserId === user.id
                      return (
                        <p key={leave.id} className="text-sm">
                          {name}
                          {isMe && <span className="ml-1 text-primary">(คุณ)</span>}
                          {status === 'PENDING' && (
                            <span className="ml-1 text-amber-600 dark:text-amber-400">· รออนุมัติ</span>
                          )}
                        </p>
                      )
                    })}
                  </>
                )}
                {todayEvents.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground">งาน / เหตุการณ์</p>
                    {todayEvents.map(ev => (
                      <p key={ev.id} className="text-sm">
                        {ev.startTime}
                        {ev.endTime ? `–${ev.endTime}` : ''} {ev.title}
                        {ev.userName && (
                          <span className="ml-1 text-muted-foreground">({ev.userName})</span>
                        )}
                      </p>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">วันนี้ไม่มีรายการลาหรืองาน</p>
            )}
            {!_.isEmpty(pendingInList) && (
              <p
                className="mt-3 cursor-pointer text-sm text-primary"
                onClick={() => navigate('/leave')}
              >
                คำขอลารอการดำเนินการ {pendingInList.length} รายการ →
              </p>
            )}
          </CardContent>
        </Card>

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
                <span className="min-w-[180px] text-center text-lg font-semibold">
                  {formatMonthTitle(year, month)}
                </span>
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
              <Select value={selectValue} onValueChange={handleFilterChange}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="ดูการลาของ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>ทั้งหมด</SelectItem>
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
                <Button size="sm" onClick={handleOpenEventDialog}>
                  <Plus className="mr-1 h-4 w-4" />
                  เพิ่มงาน
                </Button>
              )}
            </div>

            {loading ? (
              <p className="text-muted-foreground">กำลังโหลด...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <th
                          key={i}
                          className="w-[14.28%] border border-border bg-muted/50 p-1.5 text-left text-xs font-semibold"
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
                          const leaveItems = byDate.get(date) ?? []
                          const dayEvents = eventsByDay.get(date) ?? []
                          const isToday = date === today
                          return (
                            <td
                              key={ci}
                              className={`min-h-[80px] align-top p-1 ${isToday ? 'bg-accent/50' : ''}`}
                            >
                              <span className="text-xs text-muted-foreground">
                                {dayjs(date).date()}
                              </span>
                              <div className="mt-1 flex flex-col gap-0.5">
                                {leaveItems.slice(0, 2).map(({ leave: L }) => (
                                  <span
                                    key={`l-${L.id}`}
                                    className={`block truncate px-1 text-xs ${(L.status ?? '') === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'}`}
                                    title={`${L.createdByName ?? ''} ${(L.status ?? '') === 'PENDING' ? '(รออนุมัติ)' : ''}`}
                                  >
                                    {(L.createdByName ?? '').slice(0, 8)}
                                  </span>
                                ))}
                                {dayEvents.slice(0, 2).map(ev => (
                                  <span
                                    key={`e-${ev.id}`}
                                    className="block truncate px-1 text-xs bg-secondary text-secondary-foreground"
                                    title={`${ev.startTime}${ev.endTime ? `-${ev.endTime}` : ''} ${ev.title} ${ev.userName ? `(${ev.userName})` : ''}`}
                                  >
                                    {ev.startTime} {(ev.title ?? '').slice(0, 6)}
                                  </span>
                                ))}
                                {leaveItems.length + dayEvents.length > 4 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{leaveItems.length + dayEvents.length - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    </div>
  )
}
