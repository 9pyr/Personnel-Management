import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/time-picker'

import { useContext, useState } from 'react'

import Form from 'common/components/Form'
import DatePicker from 'common/components/Input/DatePicker'
import Select from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import { useListLeaveTypes } from 'core/apis/leave/leaveTypesQueries'
import {
  useCancelLeave,
  useCreateLeave,
  useLeaveById,
  useUpdateLeave,
} from 'core/apis/leave/queries'
import { LeaveRecordType, LeaveCreatePayloadType, LeaveUpdatePayloadType } from 'core/apis/leave/types'
import { AuthContext } from 'core/contexts/AuthContext'
import { LEAVE_STATUS, leaveFields } from 'modules/leave/constants'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

type LeaveDurationType = 'FULL_DAY' | 'HOURLY'

type LeaveFormDefaults = Partial<LeaveRecordType> & {
  leaveTypeId: string
  description: string
  startDate: string
  endDate: string
  durationType: LeaveDurationType
  startTime?: string
  endTime?: string
}

interface LeaveTypeOption {
  label: string
  value: string
}

interface CancelLeaveButtonProps {
  leaveId: string | undefined
  leaveEndDate: string | null
  cancelling: boolean
  onOpenConfirm: () => void
}

function CancelLeaveButton({
  leaveId,
  leaveEndDate,
  cancelling,
  onOpenConfirm,
}: CancelLeaveButtonProps) {
  const today = new Date().toISOString().slice(0, 10)
  const endDateStr = leaveEndDate ? String(leaveEndDate).slice(0, 10) : ''
  const canCancel = Boolean(endDateStr && endDateStr >= today)
  if (!leaveId) return null
  return (
    <Button
      type="button"
      variant="outline"
      disabled={cancelling || !canCancel}
      title={!canCancel && leaveEndDate ? 'ยกเลิกได้เฉพาะก่อนถึงวันที่สิ้นสุดการลา' : undefined}
      onClick={onOpenConfirm}
      className="border-destructive text-destructive hover:bg-destructive/10"
    >
      ยกเลิกคำขอ
    </Button>
  )
}

export interface LeaveFormContentProps {
  leaveId?: string
  isNew: boolean
  onSuccess: () => void
  onCancel: () => void
}

export default function LeaveFormContent({
  leaveId,
  isNew,
  onSuccess,
  onCancel,
}: LeaveFormContentProps) {
  const currentUser = useContext(AuthContext)
  const leaveTypesQuery = useListLeaveTypes()
  const leaveQuery = useLeaveById(leaveId ?? '', { enabled: Boolean(leaveId) && !isNew })
  const createLeaveRecordTypeMutation = useCreateLeave()
  const updateLeaveRecordTypeMutation = useUpdateLeave()
  const cancelLeaveRecordTypeMutation = useCancelLeave()

  const leaveTypeOptions: LeaveTypeOption[] = (leaveTypesQuery.data ?? []).map(leaveType => ({
    label: leaveType.name,
    value: leaveType.id,
  }))

  const formDefaults: LeaveFormDefaults | null = (() => {
    if (!leaveTypesQuery.data) return null
    const types = leaveTypesQuery.data
    if (isNew || !leaveId) {
      return {
        [leaveFields.leaveTypeId]: types[0]?.id ?? '',
        [leaveFields.description]: '',
        [leaveFields.startDate]: '',
        [leaveFields.endDate]: '',
        durationType: 'FULL_DAY',
        startTime: '09:00',
        endTime: '18:00',
      }
    }
    if (!leaveQuery.data) return null
    const data = leaveQuery.data
    const typeId =
      data.leaveTypeId ??
      (data.reason ? types.find(leaveType => leaveType.code === data.reason)?.id : undefined) ??
      types[0]?.id ??
      ''
    return {
      ...data,
      [leaveFields.leaveTypeId]: typeId,
      durationType: data.durationType ?? 'FULL_DAY',
      startTime: data.startTime ?? '09:00',
      endTime: data.endTime ?? '18:00',
    }
  })()

  const isReadOnly = (() => {
    if (!leaveQuery.data) return false
    const data = leaveQuery.data
    const notOwner = data.createdByUserId != null && data.createdByUserId !== currentUser?.id
    const approvedOrRejected =
      data.status === LEAVE_STATUS.APPROVED ||
      data.status === LEAVE_STATUS.REJECTED ||
      data.status === LEAVE_STATUS.CANCELLED
    return notOwner || approvedOrRejected
  })()

  const leaveStatus = leaveQuery.data?.status ?? null
  const leaveEndDate = leaveQuery.data?.endDate ?? null
  const cancelling = cancelLeaveRecordTypeMutation.isPending
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const handleSubmit = async (values: LeaveFormDefaults) => {
    const startDate = String(values.startDate ?? '')
    const endDate = String(values.endDate ?? '')
    const durationType: LeaveDurationType = values.durationType ?? 'FULL_DAY'
    const startTime = String(values.startTime ?? '')
    const endTime = String(values.endTime ?? '')

    if (durationType === 'HOURLY') {
      if (!startTime || !endTime) {
        toast.warning('กรุณาระบุเวลาเริ่มและเวลาสิ้นสุด')
        return
      }
      if (startTime >= endTime) {
        toast.warning('เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด')
        return
      }
    }

    if (isNew) {
      if (!startDate || !endDate) {
        toast.warning('กรุณาระบุจากวันที่และถึงวันที่')
        return
      }

      const createPayload: LeaveCreatePayloadType = {
        leaveTypeId: values.leaveTypeId ?? '',
        description: String(values.description ?? ''),
        startDate,
        endDate,
        durationType,
      }

      if (durationType === 'HOURLY') {
        createPayload.startTime = startTime
        createPayload.endTime = endTime
      }

      try {
        await createLeaveRecordTypeMutation.mutateAsync(createPayload)
        toast.success('บันทึกคำขอลาสำเร็จ')
        onSuccess()
      } catch {
        toast.error('บันทึกคำขอลาไม่สำเร็จ')
      }
    } else {
      if (!values.id) {
        toast.error('ไม่พบรหัสคำขอลา')
        return
      }

      const updatePayload: LeaveUpdatePayloadType = {
        id: values.id,
        leaveTypeId: values.leaveTypeId ?? '',
        description: String(values.description ?? ''),
        startDate,
        endDate,
        durationType,
      }

      if (durationType === 'HOURLY') {
        updatePayload.startTime = startTime
        updatePayload.endTime = endTime
      }

      try {
        await updateLeaveRecordTypeMutation.mutateAsync(updatePayload)
        toast.success('บันทึกสำเร็จ')
        onSuccess()
      } catch {
        toast.error('บันทึกไม่สำเร็จ')
      }
    }
  }

  if (formDefaults === null) {
    return <p className="text-muted-foreground py-4">กำลังโหลด...</p>
  }

  const DurationTimeFields = () => {
    const { control } = useFormContext<LeaveFormDefaults>()
    const durationType = useWatch<LeaveFormDefaults, 'durationType'>({
      control,
      name: 'durationType',
    })
    const startTimeValue = useWatch<LeaveFormDefaults, 'startTime'>({
      control,
      name: 'startTime',
    })

    const startHour = Number((startTimeValue ?? '09:00').split(':')[0] ?? '9')
    const minEndHour = Number.isFinite(startHour) ? startHour + 1 : 10

    if (isReadOnly || durationType !== 'HOURLY') {
      return null
    }

    return (
      <div className="sm:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="startTime"
          rules={{ required: 'กรุณาเลือกเวลาเริ่ม' }}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>เวลาเริ่ม</Label>
              <TimePicker
                step={300}
                showMinutes={false}
                value={field.value ?? '09:00'}
                onChange={value => field.onChange(value)}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="endTime"
          rules={{ required: 'กรุณาเลือกเวลาสิ้นสุด' }}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>เวลาสิ้นสุด</Label>
              <TimePicker
                step={300}
                showMinutes={false}
                minHour={minEndHour}
                value={field.value ?? '18:00'}
                onChange={value => field.onChange(value)}
              />
            </div>
          )}
        />
      </div>
    )
  }

  const LeaveRecordTypeDateRangeFields = () => {
    const { control } = useFormContext<LeaveFormDefaults>()
    const startDateIso = useWatch<LeaveFormDefaults, 'startDate'>({
      control,
      name: leaveFields.startDate,
    })
    const endDateIso = useWatch<LeaveFormDefaults, 'endDate'>({
      control,
      name: leaveFields.endDate,
    })

    const startDate = startDateIso ? new Date(startDateIso) : undefined
    const endDate = endDateIso ? new Date(endDateIso) : undefined

    return (
      <>
        <div>
          <DatePicker
            name={leaveFields.startDate}
            label="จากวันที่"
            disabled={isReadOnly}
            required={!isReadOnly}
            maxDate={endDate}
          />
        </div>
        <div>
          <DatePicker
            name={leaveFields.endDate}
            label="ถึงวันที่"
            disabled={isReadOnly}
            required={!isReadOnly}
            minDate={startDate}
          />
        </div>
      </>
    )
  }

  return (
    <Form<LeaveFormDefaults>
      key={`leave-form-${leaveId ?? 'new'}`}
      defaultValues={formDefaults}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 md:col-span-1">
          <Select
            name={leaveFields.leaveTypeId}
            label="ประเภทการลา"
            options={leaveTypeOptions}
            disabled={isReadOnly}
          />
        </div>
        <div className="sm:col-span-2 md:col-span-1">
          <Select
            name="durationType"
            label="รูปแบบการลา"
            options={[
              { value: 'FULL_DAY', label: 'เต็มวัน' },
              { value: 'HOURLY', label: 'ลาตามชั่วโมง' },
            ]}
            disabled={isReadOnly}
          />
        </div>
        <div className="sm:col-span-2">
          <TextInput
            name={leaveFields.description}
            label="รายละเอียด"
            minRows={4}
            multiline
            disabled={isReadOnly}
          />
        </div>
        <DurationTimeFields />
        <LeaveRecordTypeDateRangeFields />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {!isReadOnly && <Button type="submit">บันทึก</Button>}
          {(leaveStatus === LEAVE_STATUS.PENDING || leaveStatus === LEAVE_STATUS.APPROVED) &&
            !isNew && (
              <>
                <CancelLeaveButton
                  leaveId={leaveId}
                  leaveEndDate={leaveEndDate}
                  cancelling={cancelling}
                  onOpenConfirm={() => setConfirmCancelOpen(true)}
                />
                <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
                  <DialogContent showClose={true}>
                    <DialogHeader>
                      <DialogTitle>ยืนยันการยกเลิกคำขอลา</DialogTitle>
                      <DialogDescription>
                        คุณต้องการยกเลิกคำขอลานี้ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmCancelOpen(false)}
                      >
                        ไม่ ยกเลิก
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={cancelling}
                        onClick={() => {
                          if (!leaveId) return
                          void (async () => {
                            try {
                              await cancelLeaveRecordTypeMutation.mutateAsync({ id: leaveId })
                              toast.success('ยกเลิกคำขอลาแล้ว')
                              setConfirmCancelOpen(false)
                              onSuccess()
                            } catch {
                              toast.error('ยกเลิกไม่สำเร็จ')
                            }
                          })()
                        }}
                      >
                        {cancelling ? 'กำลังดำเนินการ...' : 'ยืนยันยกเลิก'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          <Button variant="outline" type="button" onClick={onCancel}>
            {isReadOnly || (leaveStatus !== LEAVE_STATUS.PENDING && leaveStatus !== null)
              ? 'ปิด'
              : 'ยกเลิก'}
          </Button>
        </div>
      </div>
    </Form>
  )
}
