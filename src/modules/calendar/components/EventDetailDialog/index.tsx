import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import dayjs from 'dayjs'
import { CalendarItemEvent } from 'modules/calendar/types'

interface EventDetailDialogProps {
  event: CalendarItemEvent | null
  onClose: () => void
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  if (!event) return null

  const dateRange = `${dayjs(event.start).format('D MMM YYYY')} – ${dayjs(event.end).format('D MMM YYYY')}`

  return (
    <Dialog open={event != null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {event.type === 'LEAVE'
              ? 'รายละเอียดการลา'
              : event.type === 'HOLIDAY'
                ? 'รายละเอียดวันหยุด'
                : 'รายละเอียดเหตุการณ์'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2 text-sm">
          <div>
            <p className="font-semibold">วันที่</p>
            <p className="text-muted-foreground">{dateRange}</p>
          </div>

          {event.type === 'LEAVE' && event.leave && (
            <>
              <div>
                <p className="font-semibold">ผู้ลา</p>
                <p className="text-muted-foreground">
                  {event.leave.createdByName ?? 'ไม่ทราบชื่อ'}
                </p>
              </div>
              <div>
                <p className="font-semibold">รายละเอียด</p>
                <p className="text-muted-foreground">
                  {(event.leave.description ?? '').trim() || '—'}
                </p>
              </div>
            </>
          )}

          {event.type === 'HOLIDAY' && event.holiday && (
            <div>
              <p className="font-semibold">ชื่อวันหยุด</p>
              <p className="text-muted-foreground">{event.holiday.name ?? 'วันหยุดบริษัท'}</p>
            </div>
          )}

          {event.type === 'WORK_EVENT' && event.workEvent && (
            <>
              <div>
                <p className="font-semibold">หัวข้อ</p>
                <p className="text-muted-foreground">
                  {(event.workEvent.title ?? '').trim() || '—'}
                </p>
              </div>
              <div>
                <p className="font-semibold">เวลา</p>
                <p className="text-muted-foreground">
                  {event.workEvent.startTime || event.workEvent.endTime
                    ? [event.workEvent.startTime, event.workEvent.endTime].filter(Boolean).join('–')
                    : 'ทั้งวัน'}
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
