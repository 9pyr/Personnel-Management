import { Button } from '@/components/ui/button'
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { useState } from 'react'

import { SelectBase, type SelectOption } from 'common/components/Input/Select'
import type { User } from 'core/apis/auth/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FILTER_ALL } from 'modules/calendar/constants'
import { formatMonthTitle } from 'modules/calendar/utils/eventHelpers'

interface CalendarToolbarProps {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onMonthSelect: (date: Date | undefined) => void
  filterValue: string
  onFilterChange: (value: string) => void
  users: User[]
  currentUser: User | null
}

export function CalendarToolbar({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onMonthSelect,
  filterValue,
  onFilterChange,
  users,
  currentUser,
}: CalendarToolbarProps) {
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const calendarMonthValue = new Date(year, month - 1, 1)

  const filterOptions: SelectOption[] = [
    { value: FILTER_ALL, label: 'ทั้งหมด (ทุกคน)' },
    ...(currentUser?.id ? [{ value: currentUser.id, label: 'ตัวฉัน' } satisfies SelectOption] : []),
    ...users
      .filter(u => u.id != null && u.id !== '')
      .map<SelectOption>(u => ({
        value: u.id,
        label: `${u.name}${u.department ? ` (${u.department})` : ''}`,
      })),
  ]

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onPrevMonth}
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
            <DatePickerCalendar
              selected={calendarMonthValue}
              onSelect={date => {
                onMonthSelect(date)
                setMonthPickerOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNextMonth}
          aria-label="เดือนถัดไป"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <SelectBase
        id="calendar-filter-user"
        ariaLabel="กรองการลาและงานตามผู้ใช้"
        className="max-w-[200px]"
        placeholder="ทั้งหมด"
        value={filterValue}
        onChange={onFilterChange}
        options={filterOptions}
      />
    </div>
  )
}
