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

import dayjs from 'dayjs'
import { HolidayFormData } from 'modules/calendar/types'

interface HolidayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: HolidayFormData
  onFormChange: (form: HolidayFormData) => void
  submitting: boolean
  onSubmit: () => void
}

export function HolidayDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  submitting,
  onSubmit,
}: HolidayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มวันหยุดบริษัท</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>วันที่</Label>
            <DatePickerSingle
              value={form.date ? new Date(form.date) : undefined}
              onChange={date =>
                onFormChange({ ...form, date: date ? dayjs(date).format('YYYY-MM-DD') : '' })
              }
              placeholder="เลือกวันที่"
            />
          </div>
          <div className="grid gap-2">
            <Label>ชื่อวันหยุด</Label>
            <Input
              value={form.name}
              onChange={evt => onFormChange({ ...form, name: evt.target.value })}
              placeholder="เช่น วันปีใหม่, วันสงกรานต์"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : 'เพิ่มวันหยุด'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
