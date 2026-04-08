import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import * as React from 'react'

import { Clock } from 'lucide-react'

const TRIGGER_CLASS =
  'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-accent/50 transition-colors'

function parseTime(value: string | undefined): { hour: number; minute: number } {
  if (!value) return { hour: 0, minute: 0 }
  const [hour, minute] = value.split(':').map(Number)
  return { hour: Number.isFinite(hour) ? hour : 0, minute: Number.isFinite(minute) ? minute : 0 }
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function getMinuteOptions(stepMinutes: number): number[] {
  const options: number[] = []
  for (let minVal = 0; minVal < 60; minVal += stepMinutes) options.push(minVal)
  return options
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

const PICKER_ITEM_CLASS =
  'flex w-full items-center justify-center py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
const PICKER_ITEM_SELECTED =
  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'

export interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  step?: number
  disabled?: boolean
  className?: string
  id?: string
  placeholder?: string
  showMinutes?: boolean
  minHour?: number
  maxHour?: number
}

export function TimePicker({
  value,
  onChange,
  step = 300,
  disabled,
  className,
  id,
  placeholder = 'เลือกเวลา',
  showMinutes = true,
  minHour,
  maxHour,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsed = parseTime(value)
  const [hour, setHour] = React.useState(parsed.hour)
  const [minute, setMinute] = React.useState(parsed.minute)

  React.useEffect(() => {
    const parsedTime = parseTime(value)
    setHour(parsedTime.hour)
    setMinute(parsedTime.minute)
  }, [value])

  const stepMinutes = Math.max(1, Math.round(step / 60))
  const minuteOptions = React.useMemo(
    () => (showMinutes ? getMinuteOptions(stepMinutes) : []),
    [showMinutes, stepMinutes],
  )

  const hourOptions = React.useMemo(
    () =>
      HOUR_OPTIONS.filter(hourOption => {
        const hasMin = typeof minHour === 'number' && Number.isFinite(minHour)
        const hasMax = typeof maxHour === 'number' && Number.isFinite(maxHour)
        if (hasMin && minHour !== undefined && hourOption < minHour) return false
        if (hasMax && maxHour !== undefined && hourOption > maxHour) return false
        return true
      }),
    [minHour, maxHour],
  )

  const displayLabel = value ? formatTime(parsed.hour, parsed.minute) : placeholder

  const handleSelect = (hourValue: number, minuteValue: number) => {
    setHour(hourValue)
    setMinute(minuteValue)
    onChange?.(formatTime(hourValue, minuteValue))
  }

  const handleHourClick = (hourValue: number) => handleSelect(hourValue, showMinutes ? minute : 0)
  const handleMinuteClick = (minuteValue: number) => handleSelect(hour, minuteValue)

  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const cleanupRef = { current: () => {} }
    const wheelHandler = (wheelEvent: WheelEvent, scrollElement: HTMLDivElement) => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const canScrollUp = scrollTop > 0 && wheelEvent.deltaY < 0
      const canScrollDown = scrollTop < scrollHeight - clientHeight && wheelEvent.deltaY > 0
      if (canScrollUp || canScrollDown) {
        wheelEvent.preventDefault()
        scrollElement.scrollTop += wheelEvent.deltaY
      }
    }
    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return
      const hourElement = hourScrollRef.current
      const minuteElement = minuteScrollRef.current
      const boundHour = (wheelEvent: WheelEvent) =>
        hourElement && wheelHandler(wheelEvent, hourElement)
      const boundMinute = (wheelEvent: WheelEvent) =>
        minuteElement && wheelHandler(wheelEvent, minuteElement)
      hourElement?.addEventListener('wheel', boundHour, { passive: false })
      minuteElement?.addEventListener('wheel', boundMinute, { passive: false })
      cleanupRef.current = () => {
        hourElement?.removeEventListener('wheel', boundHour)
        minuteElement?.removeEventListener('wheel', boundMinute)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      cleanupRef.current()
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(TRIGGER_CLASS, !value && 'text-muted-foreground', className)}
        >
          <span className="flex-1 text-left">{displayLabel}</span>
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex justify-between border-b border-border bg-muted/30 px-3 py-2">
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground">ชม.</span>
            </div>
            {showMinutes && (
              <div className="text-center">
                <span className="text-xs font-medium text-muted-foreground">นาที</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <div
              ref={hourScrollRef}
              className="h-[200px] w-12 overflow-y-auto overflow-x-hidden border border-input bg-background"
            >
              {hourOptions.map(hourOption => (
                <button
                  key={hourOption}
                  type="button"
                  onClick={() => handleHourClick(hourOption)}
                  className={cn(PICKER_ITEM_CLASS, hour === hourOption && PICKER_ITEM_SELECTED)}
                >
                  {String(hourOption).padStart(2, '0')}
                </button>
              ))}
            </div>
            {showMinutes && (
              <div
                ref={minuteScrollRef}
                className="h-[200px] w-12 overflow-y-auto overflow-x-hidden border border-input bg-background"
              >
                {minuteOptions.map(minuteOption => (
                  <button
                    key={minuteOption}
                    type="button"
                    onClick={() => handleMinuteClick(minuteOption)}
                    className={cn(
                      PICKER_ITEM_CLASS,
                      minute === minuteOption && PICKER_ITEM_SELECTED,
                    )}
                  >
                    {String(minuteOption).padStart(2, '0')}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end border-t border-border bg-muted/30 px-3 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              ตกลง
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
