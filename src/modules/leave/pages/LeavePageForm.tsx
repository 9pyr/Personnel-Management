import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import Form from 'common/components/Form'
import DatePicker from 'common/components/Input/DatePicker'
import Select from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import { cancelLeave, createLeave, getLeaveById, updateLeaveById } from 'core/apis/leave'
import { getListLeaveTypes } from 'core/apis/leave/leaveTypes'
import type { Leave } from 'core/apis/leave/types'
import { authUserState } from 'core/stores/auth'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { leaveFields } from '../constants'

interface LeaveTypeOption {
  label: string
  value: string
}

interface CancelLeaveButtonProps {
  leaveId: string | undefined
  leaveEndDate: string | null
  cancelling: boolean
  onCancel: (id: string) => Promise<void>
  onDone: () => void
}

function CancelLeaveButton({
  leaveId,
  leaveEndDate,
  cancelling,
  onCancel,
  onDone,
}: CancelLeaveButtonProps) {
  const today = new Date().toISOString().slice(0, 10)
  const endDateStr = leaveEndDate ? String(leaveEndDate).slice(0, 10) : ''
  const canCancel = Boolean(endDateStr && endDateStr >= today)
  if (!leaveId) return null
  const handleClick = () => {
    void onCancel(leaveId).finally(onDone)
  }
  return (
    <Button
      variant="outline"
      disabled={cancelling || !canCancel}
      title={!canCancel && leaveEndDate ? 'ยกเลิกได้เฉพาะก่อนถึงวันที่สิ้นสุดการลา' : undefined}
      onClick={handleClick}
      className="border-destructive text-destructive hover:bg-destructive/10"
    >
      ยกเลิกคำขอ
    </Button>
  )
}

const LeavePageForm = () => {
  const navigate = useNavigate()
  const currentUser = useRecoilValue(authUserState)
  const { pathname } = useLocation()
  const { id } = useParams()
  const isNew = pathname.endsWith('/new')
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<LeaveTypeOption[]>([])
  const [formDefaults, setFormDefaults] = useState<Record<string, unknown> | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null)
  const [leaveEndDate, setLeaveEndDate] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const types = await getListLeaveTypes()
      if (cancelled) return
      setLeaveTypeOptions(types.map(t => ({ label: t.name, value: t.id })))
      if (isNew) {
        setFormDefaults({
          [leaveFields.leaveTypeId]: types[0]?.id ?? '',
          [leaveFields.description]: '',
          [leaveFields.startDate]: '',
          [leaveFields.endDate]: '',
        })
        return
      }
      if (!id) {
        setFormDefaults({
          [leaveFields.leaveTypeId]: types[0]?.id ?? '',
          [leaveFields.description]: '',
          [leaveFields.startDate]: '',
          [leaveFields.endDate]: '',
        })
        return
      }
      const data = await getLeaveById(id)
      if (cancelled) return
      const notOwner = data.createdByUserId != null && data.createdByUserId !== currentUser?.id
      const approvedOrRejected =
        data.status === 'APPROVED' || data.status === 'REJECTED' || data.status === 'CANCELLED'
      setIsReadOnly(notOwner || approvedOrRejected)
      setLeaveStatus(data.status ?? null)
      setLeaveEndDate(data.endDate ?? null)
      const typeId =
        data.leaveTypeId ??
        (data.reason ? types.find(t => t.code === data.reason)?.id : undefined) ??
        types[0]?.id ??
        ''
      setFormDefaults({
        ...data,
        [leaveFields.leaveTypeId]: typeId,
      })
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew, currentUser?.id])

  const handleSubmit = async (values: Record<string, unknown>) => {
    const startDate = String(values.startDate ?? '')
    const endDate = String(values.endDate ?? '')
    const payload: Leave = {
      ...values,
      startDate,
      endDate,
      description: String(values.description ?? ''),
    } as Leave
    if (isNew) {
      if (!startDate || !endDate) {
        toast.warning('กรุณาระบุจากวันที่และถึงวันที่')
        return
      }
      await createLeave(payload)
      toast.success('บันทึกคำขอลาสำเร็จ')
    } else {
      if (payload.id) await updateLeaveById(payload)
      toast.success('บันทึกสำเร็จ')
    }
    navigate('/leave', { replace: true })
  }

  if (formDefaults === null) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>
  }

  return (
    <Card className="border">
      <CardContent className="pt-6">
        <Form
          key={`leave-form-${id ?? 'new'}`}
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
            <div className="sm:col-span-2">
              <TextInput
                name={leaveFields.description}
                label="รายละเอียด"
                minRows={4}
                multiline
                disabled={isReadOnly}
              />
            </div>
            <div>
              <DatePicker name={leaveFields.startDate} label="จากวันที่" disabled={isReadOnly} />
            </div>
            <div>
              <DatePicker name={leaveFields.endDate} label="ถึงวันที่" disabled={isReadOnly} />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {!isReadOnly && (
                <Button type="submit">บันทึก</Button>
              )}
              {(leaveStatus === 'PENDING' || leaveStatus === 'APPROVED') && !isNew && (
                <CancelLeaveButton
                  leaveId={id}
                  leaveEndDate={leaveEndDate}
                  cancelling={cancelling}
                  onCancel={async (leaveIdToCancel) => {
                    setCancelling(true)
                    try {
                      await cancelLeave(leaveIdToCancel)
                      toast.success('ยกเลิกคำขอลาแล้ว')
                      window.dispatchEvent(new CustomEvent('leave-list-refresh'))
                      navigate('/leave', { replace: true })
                    } catch {
                      toast.error('ยกเลิกไม่สำเร็จ')
                    }
                  }}
                  onDone={() => setCancelling(false)}
                />
              )}
              <Button variant="outline" type="button" onClick={() => navigate('/leave')}>
                {isReadOnly || (leaveStatus !== 'PENDING' && leaveStatus !== null)
                  ? 'กลับ'
                  : 'ยกเลิก'}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LeavePageForm
