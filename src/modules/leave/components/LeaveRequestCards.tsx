import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { useNextStateLeave, useRejectStateLeave } from 'core/apis/leave/queries'
import { LeaveRecordType } from 'core/apis/leave/types'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { toast } from 'sonner'

import LeaveStatusBadge from './LeaveStatusBadge'

dayjs.locale('th')

interface LeaveRequestCardsProps {
  leaves: LeaveRecordType[]
  onActionDone?: () => void
}

function LeaveRequestCards({ leaves, onActionDone }: LeaveRequestCardsProps) {
  const nextStateMutation = useNextStateLeave()
  const rejectStateMutation = useRejectStateLeave()

  const handleApprove = async (id: string) => {
    try {
      await nextStateMutation.mutateAsync({ id })
      toast.success('อนุมัติการลาแล้ว')
      onActionDone?.()
    } catch {
      toast.error('ดำเนินการไม่สำเร็จ')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectStateMutation.mutateAsync({ id })
      toast.success('ปฏิเสธการลาแล้ว')
      onActionDone?.()
    } catch {
      toast.error('ดำเนินการไม่สำเร็จ')
    }
  }

  const pending = leaves

  if (pending.length === 0) {
    return <p className="text-muted-foreground">ไม่มีคำขอลาจากคนอื่นที่รอดำเนินการ</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-semibold">คำขอลาจากคนอื่นที่รอการอนุมัติ ({pending.length})</p>
      <div className="flex flex-wrap gap-4">
        {pending.map(leave => (
          <Card key={leave.id} className="min-w-[280px] max-w-[360px] border">
            <CardContent className="pt-6">
              <p className="mb-2 text-sm font-semibold text-primary">
                ขอลาโดย {leave.createdByName ?? '-'}
              </p>
              <p className="text-sm text-muted-foreground">
                {dayjs(leave.startDate).format('D MMMM YYYY')} –{' '}
                {dayjs(leave.endDate).format('D MMMM YYYY')}
              </p>
              <p className="mt-1 text-sm">{leave.description || '-'}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>สถานะ:</span>
                <LeaveStatusBadge statusKey={leave.status} />
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (!leave.id) return
                  void handleApprove(leave.id)
                }}
              >
                อนุมัติ
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (!leave.id) return
                  void handleReject(leave.id)
                }}
              >
                ปฏิเสธ
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default LeaveRequestCards
