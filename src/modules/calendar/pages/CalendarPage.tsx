import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCallback, useContext, useMemo, useState } from 'react'
import { AuthContext } from 'core/contexts/AuthContext'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { Plus } from 'lucide-react'
import { LEAVE_STATUS } from 'modules/leave/constants'
import { Calendar as BigCalendar, dayjsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useNavigate } from 'react-router-dom'

import { CalendarEventCell } from 'modules/calendar/components/CalendarEventCell'
import { CalendarToolbar } from 'modules/calendar/components/CalendarToolbar'
import { EventDetailDialog } from 'modules/calendar/components/EventDetailDialog'
import { EventDialog } from 'modules/calendar/components/EventDialog'
import { HolidayDialog } from 'modules/calendar/components/HolidayDialog'
import { FILTER_ALL } from 'modules/calendar/constants'
import { useCalendarData } from 'modules/calendar/hooks/useCalendarData'
import { useEventForm } from 'modules/calendar/hooks/useEventForm'
import { useHolidayForm } from 'modules/calendar/hooks/useHolidayForm'
import { useUsers } from 'modules/calendar/hooks/useUsers'
import type { CalendarItemEvent } from 'modules/calendar/types'
import { buildCalendarEvents, getEventStyle } from 'modules/calendar/utils/eventHelpers'

dayjs.locale('th')

const bigCalendarLocalizer = dayjsLocalizer(dayjs)

export default function CalendarPage() {
  const navigate = useNavigate()
  const user = useContext(AuthContext)

  const [year, setYear] = useState(() => dayjs().year())
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [detailEvent, setDetailEvent] = useState<CalendarItemEvent | null>(null)

  const { leaves, events, holidays, loading, refresh } = useCalendarData(year, month, filterUserId)
  const { users } = useUsers()

  const displayLeaves = useMemo(
    () => leaves.filter(l => (l.status ?? '') !== LEAVE_STATUS.CANCELLED),
    [leaves],
  )

  const calendarEvents = useMemo(
    () => buildCalendarEvents(displayLeaves, holidays, events),
    [displayLeaves, holidays, events],
  )

  const pendingInList = useMemo(
    () => leaves.filter(leave => (leave.status ?? '') === LEAVE_STATUS.PENDING),
    [leaves],
  )

  const goPrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12)
      setYear(prev => prev - 1)
    } else {
      setMonth(prev => prev - 1)
    }
  }, [month])

  const goNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1)
      setYear(prev => prev + 1)
    } else {
      setMonth(prev => prev + 1)
    }
  }, [month])

  const handleMonthSelect = useCallback((date: Date | undefined) => {
    if (!date) return
    setYear(dayjs(date).year())
    setMonth(dayjs(date).month() + 1)
  }, [])

  const selectValue = filterUserId === '' ? FILTER_ALL : filterUserId
  const handleFilterChange = useCallback((value: string) => {
    setFilterUserId(value === FILTER_ALL ? '' : value)
  }, [])

  const canAddEvent = Boolean(user?.id && (filterUserId === '' || filterUserId === user.id))
  const canAddHoliday = user?.role === 'PEOPLE' || user?.role === 'ADMIN'

  const eventForm = useEventForm(refresh)
  const holidayForm = useHolidayForm(refresh)

  const handleRefresh = useCallback(() => {
    refresh()
  }, [refresh])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">ปฏิทิน</h2>
        <p className="text-sm text-muted-foreground">
          แสดงว่าวันไหน ใครทำอะไร อยู่ที่ไหน ตามที่ทุกคนลงไว้ (การลา · งาน/เหตุการณ์ · วันหยุด)
        </p>

        {pendingInList.length > 0 && (
          <p
            className="cursor-pointer text-sm text-primary w-fit hover:underline"
            onClick={() => navigate('/leave')}
          >
            คำขอลารอการดำเนินการ {pendingInList.length} รายการ →
          </p>
        )}

        <Card className="border bg-card">
          <CardContent className="pt-6">
            <CalendarToolbar
              year={year}
              month={month}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              onMonthSelect={handleMonthSelect}
              filterValue={selectValue}
              onFilterChange={handleFilterChange}
              users={users}
              currentUser={user}
            />

            <div className="flex justify-between items-center gap-2 mb-4">
              {canAddEvent && (
                <Button size="sm" onClick={eventForm.openDialog}>
                  <Plus className="mr-1 h-4 w-4" />
                  เพิ่มงาน
                </Button>
              )}
              {canAddHoliday && (
                <Button size="sm" onClick={holidayForm.openDialog}>
                  <Plus className="mr-1 h-4 w-4" />
                  เพิ่มวันหยุด
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" disabled={loading} onClick={handleRefresh}>
                {loading ? 'กำลังโหลด...' : 'โหลดใหม่'}
              </Button>
            </div>

            {loading ? (
              <p className="text-muted-foreground">กำลังโหลด...</p>
            ) : (
              <>
                <div className="h-[640px] w-full rounded-md border border-border bg-background">
                  <BigCalendar
                    localizer={bigCalendarLocalizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    allDayAccessor="allDay"
                    views={['month']}
                    view="month"
                    date={new Date(year, month - 1, 1)}
                    onNavigate={(nextDate: Date) => {
                      const next = dayjs(nextDate)
                      setYear(next.year())
                      setMonth(next.month() + 1)
                    }}
                    toolbar={false}
                    culture="th"
                    popup
                    onSelectEvent={event => {
                      if ('type' in event && 'leave' in event) {
                        setDetailEvent(event as CalendarItemEvent)
                      } else if ('type' in event && 'holiday' in event) {
                        setDetailEvent(event as CalendarItemEvent)
                      } else if ('type' in event && 'workEvent' in event) {
                        setDetailEvent(event as CalendarItemEvent)
                      }
                    }}
                    components={{ event: CalendarEventCell }}
                    eventPropGetter={event => {
                      if ('type' in event) {
                        return getEventStyle(event as CalendarItemEvent, user?.id)
                      }
                      return {}
                    }}
                  />
                </div>
                {displayLeaves.length === 0 &&
                  events.length === 0 &&
                  holidays.length === 0 && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      เดือนนี้ยังไม่มีใครลงกิจกรรม
                    </p>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <EventDetailDialog event={detailEvent} onClose={() => setDetailEvent(null)} />

      <EventDialog
        open={eventForm.open}
        onOpenChange={eventForm.setOpen}
        form={eventForm.form}
        onFormChange={eventForm.setForm}
        dateError={eventForm.dateError}
        titleError={eventForm.titleError}
        submitting={eventForm.submitting}
        onSubmit={eventForm.handleSubmit}
      />

      <HolidayDialog
        open={holidayForm.open}
        onOpenChange={holidayForm.setOpen}
        form={holidayForm.form}
        onFormChange={holidayForm.setForm}
        submitting={holidayForm.submitting}
        onSubmit={holidayForm.handleSubmit}
      />
    </div>
  )
}
