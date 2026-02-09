import * as React from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Calendar, CalendarRange } from '@/components/ui/calendar'
import type { DateRange } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

dayjs.locale('th')

const TRIGGER_CLASS =
  'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-accent/50 transition-colors'

function formatDate(d: Date): string {
  return dayjs(d).format('DD/MM/YYYY')
}

export interface DatePickerSingleProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePickerSingle({
  value,
  onChange,
  placeholder = 'เลือกวันที่',
  disabled,
  className,
  id,
  minDate,
  maxDate,
}: DatePickerSingleProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(TRIGGER_CLASS, !value && 'text-muted-foreground', className)}
        >
          <span className="flex-1 text-left">{value ? formatDate(value) : placeholder}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={value}
          onSelect={date => {
            onChange?.(date)
            setOpen(false)
          }}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export type { DateRange }

export interface DatePickerRangeProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function DatePickerRange({
  value,
  onChange,
  placeholder = 'เลือกช่วงวันที่',
  disabled,
  className,
  id,
}: DatePickerRangeProps) {
  const [open, setOpen] = React.useState(false)
  const label = React.useMemo(() => {
    if (!value?.from) return placeholder
    const from = value.from
    const to = value.to
    if (to && from.getTime() !== to.getTime()) {
      return `${formatDate(from)} – ${formatDate(to)}`
    }
    return formatDate(from)
  }, [value, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(TRIGGER_CLASS, !value?.from && 'text-muted-foreground', className)}
        >
          <span className="flex-1 text-left">{label}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarRange selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
}
