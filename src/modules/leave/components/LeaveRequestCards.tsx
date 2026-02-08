import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'

import { nextStateLeave, rejectStateLeave } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { useSnackbar } from 'notistack'

interface LeaveRequestCardsProps {
  leaves: Leave[]
  onActionDone?: () => void
}

function LeaveRequestCards({ leaves, onActionDone }: LeaveRequestCardsProps) {
  const { enqueueSnackbar } = useSnackbar()

  const handleApprove = async (id: string) => {
    try {
      await nextStateLeave(id)
      enqueueSnackbar('อนุมัติการลาแล้ว', { variant: 'success' })
      onActionDone?.()
    } catch {
      enqueueSnackbar('ดำเนินการไม่สำเร็จ', { variant: 'error' })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectStateLeave(id)
      enqueueSnackbar('ปฏิเสธการลาแล้ว', { variant: 'success' })
      onActionDone?.()
    } catch {
      enqueueSnackbar('ดำเนินการไม่สำเร็จ', { variant: 'error' })
    }
  }

  const pending = leaves

  if (pending.length === 0) {
    return (
      <Typography color="text.secondary">ไม่มีคำขอลาจากคนอื่นที่รอดำเนินการ</Typography>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        คำขอลาจากคนอื่นที่รอการอนุมัติ ({pending.length})
      </Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2}>
        {pending.map(leave => (
          <Card key={leave.id} variant="outlined" sx={{ minWidth: 280, maxWidth: 360 }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ขอลาโดย {leave.createdByName ?? '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(leave.startDate).format('DD/MM/YYYY')} – {dayjs(leave.endDate).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {leave.description || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                สถานะ: {leave.status}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="success" onClick={() => handleApprove(leave.id!)}>
                อนุมัติ
              </Button>
              <Button size="small" color="error" onClick={() => handleReject(leave.id!)}>
                ปฏิเสธ
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

export default LeaveRequestCards
