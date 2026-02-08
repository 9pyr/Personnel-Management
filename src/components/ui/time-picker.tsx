import * as React from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const TRIGGER_CLASS =
  'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-accent/50 transition-colors'

function parseTime(value: string | undefined): { hour: number; minute: number } {
  if (!value) return { hour: 0, minute: 0 }
  const [h, m] = value.split(':').map(Number)
  return { hour: Number.isFinite(h) ? h : 0, minute: Number.isFinite(m) ? m : 0 }
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function getMinuteOptions(stepMinutes: number): number[] {
  const options: number[] = []
  for (let m = 0; m < 60; m += stepMinutes) options.push(m)
  return options
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

const PICKER_ITEM_CLASS =
  'flex w-full items-center justify-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground'
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
}

export function TimePicker({
  value,
  onChange,
  step = 300,
  disabled,
  className,
  id,
  placeholder = 'เลือกเวลา',
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsed = parseTime(value)
  const [hour, setHour] = React.useState(parsed.hour)
  const [minute, setMinute] = React.useState(parsed.minute)

  React.useEffect(() => {
    const p = parseTime(value)
    setHour(p.hour)
    setMinute(p.minute)
  }, [value])

  const stepMinutes = Math.max(1, Math.round(step / 60))
  const minuteOptions = React.useMemo(
    () => getMinuteOptions(stepMinutes),
    [stepMinutes]
  )

  const displayLabel = value ? formatTime(parsed.hour, parsed.minute) : placeholder

  const handleSelect = (h: number, m: number) => {
    setHour(h)
    setMinute(m)
    onChange?.(formatTime(h, m))
  }

  const handleHourClick = (h: number) => handleSelect(h, minute)
  const handleMinuteClick = (m: number) => handleSelect(hour, m)

  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const cleanupRef = { current: () => {} }
    const wheelHandler = (e: WheelEvent, el: HTMLDivElement) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const canScrollUp = scrollTop > 0 && e.deltaY < 0
      const canScrollDown =
        scrollTop < scrollHeight - clientHeight && e.deltaY > 0
      if (canScrollUp || canScrollDown) {
        e.preventDefault()
        el.scrollTop += e.deltaY
      }
    }
    let cancelled = false
    const id = window.setTimeout(() => {
      if (cancelled) return
      const h = hourScrollRef.current
      const m = minuteScrollRef.current
      const boundH = (e: WheelEvent) => h && wheelHandler(e, h)
      const boundM = (e: WheelEvent) => m && wheelHandler(e, m)
      h?.addEventListener('wheel', boundH, { passive: false })
      m?.addEventListener('wheel', boundM, { passive: false })
      cleanupRef.current = () => {
        h?.removeEventListener('wheel', boundH)
        m?.removeEventListener('wheel', boundM)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(id)
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
          className={cn(
            TRIGGER_CLASS,
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex-1 text-left">{displayLabel}</span>
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex gap-0 border-b border-border bg-muted/30 px-3 py-2">
            <div className="w-14 text-center">
              <span className="text-xs font-medium text-muted-foreground">ชม.</span>
            </div>
            <div className="w-14 text-center">
              <span className="text-xs font-medium text-muted-foreground">นาที</span>
            </div>
          </div>
          <div className="flex gap-1 p-2">
            <div
              ref={hourScrollRef}
              className="h-[200px] w-14 overflow-y-auto overflow-x-hidden rounded-md border border-input bg-background"
            >
              <div className="p-1">
                {HOUR_OPTIONS.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourClick(h)}
                    className={cn(
                      PICKER_ITEM_CLASS,
                      hour === h && PICKER_ITEM_SELECTED
                    )}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            <div
              ref={minuteScrollRef}
              className="h-[200px] w-14 overflow-y-auto overflow-x-hidden rounded-md border border-input bg-background"
            >
              <div className="p-1">
                {minuteOptions.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteClick(m)}
                    className={cn(
                      PICKER_ITEM_CLASS,
                      minute === m && PICKER_ITEM_SELECTED
                    )}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
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
