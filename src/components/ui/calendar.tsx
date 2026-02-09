import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './datepicker-theme.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEFAULT_FROM_YEAR = new Date().getFullYear() - 10
const DEFAULT_TO_YEAR = new Date().getFullYear() + 2

const MONTH_LABELS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

interface CalendarHeaderProps {
  monthDate: Date
  changeMonth: (month: number) => void
  changeYear: (year: number) => void
  decreaseMonth: () => void
  increaseMonth: () => void
  prevMonthButtonDisabled: boolean
  nextMonthButtonDisabled: boolean
  fromYear: number
  toYear: number
}

function CalendarHeader({
  monthDate,
  changeMonth,
  changeYear,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  fromYear,
  toYear,
}: CalendarHeaderProps) {
  const month = monthDate.getMonth()
  const year = monthDate.getFullYear()
  const yearOptions = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  )

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-md"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        aria-label="เดือนก่อน"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex gap-2">
        <Select
          value={String(month)}
          onValueChange={v => changeMonth(Number(v))}
        >
          <SelectTrigger className="h-8 min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {MONTH_LABELS.map((label, i) => (
              <SelectItem key={i} value={String(i)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(year)}
          onValueChange={v => changeYear(Number(v))}
        >
          <SelectTrigger className="h-8 min-w-[5rem] rounded-md border border-input bg-background px-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {yearOptions.map(y => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-md"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        aria-label="เดือนถัดไป"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export interface CalendarSingleProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  fromYear?: number
  toYear?: number
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function Calendar({
  selected,
  onSelect,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  className,
  minDate,
  maxDate,
}: CalendarSingleProps) {
  const today = new Date()

  return (
    <div className={cn('rounded-lg border border-border bg-card shadow-sm', className)}>
      <ReactDatePicker
        inline
        selected={selected ?? null}
        onChange={(d: Date | null) => onSelect?.(d ?? undefined)}
        minDate={minDate ?? new Date(fromYear, 0, 1)}
        maxDate={maxDate ?? new Date(toYear, 11, 31)}
        className="border-0 bg-transparent"
        calendarClassName="!border-0"
        renderCustomHeader={props => (
          <CalendarHeader
            {...props}
            fromYear={fromYear}
            toYear={toYear}
          />
        )}
      />
      <div className="flex justify-between border-t border-border bg-muted/30 px-3 py-2">
        <button
          type="button"
          onClick={() => onSelect?.(undefined)}
          className="text-sm text-primary hover:underline disabled:opacity-50"
          disabled={!selected}
        >
          ล้าง
        </button>
        <button
          type="button"
          onClick={() => onSelect?.(today)}
          className="text-sm font-medium text-primary hover:underline"
        >
          วันนี้
        </button>
      </div>
    </div>
  )
}
Calendar.displayName = 'Calendar'

export interface DateRange {
  from?: Date
  to?: Date
}

export interface CalendarRangeProps {
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  fromYear?: number
  toYear?: number
  className?: string
}

export function CalendarRange({
  selected,
  onSelect,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  className,
}: CalendarRangeProps) {
  const startDate = selected?.from ?? null
  const endDate = selected?.to ?? null
  const today = new Date()

  return (
    <div className={cn('rounded-lg border border-border bg-card shadow-sm', className)}>
      <ReactDatePicker
        inline
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={dates => {
          const [start, end] = dates
          if (!start && !end) onSelect?.(undefined)
          else onSelect?.({ from: start ?? undefined, to: end ?? undefined })
        }}
        minDate={new Date(fromYear, 0, 1)}
        maxDate={new Date(toYear, 11, 31)}
        monthsShown={2}
        className="border-0 bg-transparent"
        calendarClassName="!border-0"
        renderCustomHeader={props => (
          <CalendarHeader
            {...props}
            fromYear={fromYear}
            toYear={toYear}
          />
        )}
      />
      <div className="flex justify-between border-t border-border bg-muted/30 px-3 py-2">
        <button
          type="button"
          onClick={() => onSelect?.(undefined)}
          className="text-sm text-primary hover:underline disabled:opacity-50"
          disabled={!selected?.from}
        >
          ล้าง
        </button>
        <button
          type="button"
          onClick={() => onSelect?.({ from: today, to: today })}
          className="text-sm font-medium text-primary hover:underline"
        >
          วันนี้
        </button>
      </div>
    </div>
  )
}
CalendarRange.displayName = 'CalendarRange'
