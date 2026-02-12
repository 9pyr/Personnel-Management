import { useMemo } from 'react'

import { useEvents } from 'core/apis/events/queries'
import { useHolidays } from 'core/apis/holidays/queries'
import { useListLeave } from 'core/apis/leave/queries'
import { FILTER_ALL } from 'modules/calendar/constants'
import { getMonthRange } from 'modules/calendar/utils/leaveByDate'

export function useCalendarData(year: number, month: number, filterUserId: string) {
  const { from, to } = getMonthRange(year, month)
  const apiUserId = filterUserId === '' || filterUserId === FILTER_ALL ? undefined : filterUserId

  const leavesQuery = useListLeave({ from, to, userId: apiUserId })
  const eventsQuery = useEvents({ from, to, userId: apiUserId })
  const holidaysQuery = useHolidays({ from, to })

  const leaves = useMemo(() => {
    if (!leavesQuery.data) return []
    if (leavesQuery.data.length === 0 && from && to) {
      return leavesQuery.data.filter(leave => leave.startDate <= to && leave.endDate >= from)
    }
    return leavesQuery.data
  }, [leavesQuery.data, from, to])

  const events = useMemo(() => {
    if (!eventsQuery.data) return []
    if (eventsQuery.data.length === 0 && from && to) {
      return eventsQuery.data.filter(
        evt => (evt.date ?? '').slice(0, 10) >= from && (evt.date ?? '').slice(0, 10) <= to,
      )
    }
    return eventsQuery.data
  }, [eventsQuery.data, from, to])

  const holidays = holidaysQuery.data ?? []
  const loading = leavesQuery.isLoading || eventsQuery.isLoading || holidaysQuery.isLoading

  const refresh = () => {
    void leavesQuery.refetch()
    void eventsQuery.refetch()
    void holidaysQuery.refetch()
  }

  return { leaves, events, holidays, loading, refresh }
}
