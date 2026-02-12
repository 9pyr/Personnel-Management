import { useCallback, useState } from 'react'

import { useCreateHoliday } from 'core/apis/holidays/queries'
import dayjs from 'dayjs'
import { HolidayFormData } from 'modules/calendar/types'
import { toast } from 'sonner'

export function useHolidayForm(onSuccess: () => void) {
  const today = dayjs().format('YYYY-MM-DD')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<HolidayFormData>({ date: today, name: '' })
  const createHolidayMutation = useCreateHoliday()

  const openDialog = useCallback(() => {
    setForm({ date: today, name: '' })
    setOpen(true)
  }, [today])

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      toast.warning('กรุณากรอกชื่อวันหยุด')
      return
    }

    try {
      await createHolidayMutation.mutateAsync({ date: form.date, name: form.name.trim() })
      toast.success('เพิ่มวันหยุดแล้ว')
      setOpen(false)
      onSuccess()
    } catch {
      toast.error('เพิ่มวันหยุดไม่สำเร็จ')
    }
  }, [form, onSuccess, createHolidayMutation])

  return {
    open,
    setOpen,
    form,
    setForm,
    submitting: createHolidayMutation.isPending,
    openDialog,
    handleSubmit,
  }
}
