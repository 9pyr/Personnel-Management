import { useCallback, useState } from 'react'

import { useCreateEvent } from 'core/apis/events/queries'
import dayjs from 'dayjs'
import { EventFormData } from 'modules/calendar/types'
import { toast } from 'sonner'

export function useEventForm(onSuccess: () => void) {
  const today = dayjs().format('YYYY-MM-DD')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<EventFormData>({
    date: today,
    startTime: '09:00',
    endTime: '',
    title: '',
    eventType: 'OTHER',
  })
  const [dateError, setDateError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const createEventMutation = useCreateEvent()

  const openDialog = useCallback(() => {
    setForm({ date: today, startTime: '09:00', endTime: '', title: '', eventType: 'OTHER' })
    setDateError(null)
    setTitleError(null)
    setOpen(true)
  }, [today])

  const handleSubmit = useCallback(async () => {
    const { date, startTime, endTime, title, eventType } = form
    if (!date) {
      setDateError('กรุณาเลือกวันที่')
      toast.warning('กรุณาเลือกวันที่')
      return
    }
    if (!title.trim()) {
      setTitleError('กรุณากรอกหัวข้อ / รายละเอียด')
      toast.warning('กรุณากรอกหัวข้อ')
      return
    }

    setDateError(null)
    setTitleError(null)

    try {
      await createEventMutation.mutateAsync({
        date,
        startTime,
        endTime: endTime || undefined,
        title: title.trim(),
        eventType: eventType || undefined,
      })
      toast.success('เพิ่มงานแล้ว')
      setOpen(false)
      onSuccess()
    } catch {
      toast.error('เพิ่มงานไม่สำเร็จ')
    }
  }, [form, onSuccess, createEventMutation])

  return {
    open,
    setOpen,
    form,
    setForm,
    dateError,
    setDateError,
    titleError,
    setTitleError,
    submitting: createEventMutation.isPending,
    openDialog,
    handleSubmit,
  }
}
