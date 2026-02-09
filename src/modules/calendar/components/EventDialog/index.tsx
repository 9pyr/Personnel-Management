import { Button } from '@/components/ui/button'
import { DatePickerSingle } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/time-picker'

import { SelectBase, SelectOption } from 'common/components/Input/Select'
import dayjs from 'dayjs'
import { EVENT_TYPE_OPTIONS } from 'modules/calendar/constants'
import { EventFormData } from 'modules/calendar/types'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: EventFormData
  onFormChange: (form: EventFormData) => void
  dateError: string | null
  titleError: string | null
  submitting: boolean
  onSubmit: () => void
}

export function EventDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  dateError,
  titleError,
  submitting,
  onSubmit,
}: EventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มงาน / เหตุการณ์</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>วันที่</Label>
            <DatePickerSingle
              value={form.date ? new Date(form.date) : undefined}
              onChange={d => {
                const nextDate = d ? dayjs(d).format('YYYY-MM-DD') : ''
                onFormChange({ ...form, date: nextDate })
              }}
              placeholder="เลือกวันที่"
            />
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>เวลาเริ่ม</Label>
              <TimePicker
                step={300}
                value={form.startTime}
                onChange={v => onFormChange({ ...form, startTime: v })}
              />
            </div>
            <div className="grid gap-2">
              <Label>เวลาสิ้นสุด (ไม่บังคับ)</Label>
              <TimePicker
                step={300}
                value={form.endTime}
                onChange={v => onFormChange({ ...form, endTime: v })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>หัวข้อ / รายละเอียด</Label>
            <Input
              value={form.title}
              onChange={e => {
                const nextTitle = e.target.value
                onFormChange({ ...form, title: nextTitle })
              }}
              placeholder="เช่น พบคนไข้, เฝ้าตรวจ, นัดผ่าตัด 09:00"
            />
            {titleError && <p className="text-xs text-destructive">{titleError}</p>}
          </div>
          <div className="grid gap-2">
            <Label>ประเภท</Label>
            <SelectBase
              id="calendar-event-type"
              ariaLabel="ประเภทเหตุการณ์"
              placeholder="เลือกประเภท"
              value={form.eventType}
              onChange={value => onFormChange({ ...form, eventType: value })}
              options={EVENT_TYPE_OPTIONS.map<SelectOption>(opt => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'เพิ่มงาน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
