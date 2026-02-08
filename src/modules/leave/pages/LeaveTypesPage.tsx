import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import Table from 'common/components/Table'
import {
  createLeaveType,
  deleteLeaveType,
  getListLeaveTypes,
  updateLeaveType,
  type LeaveType,
} from 'core/apis/leave/leaveTypes'
import { authUserState } from 'core/stores/auth'
import { useSnackbar } from 'notistack'

const COLUMNS = [
  { label: 'รหัส', source: 'code' },
  { label: 'ชื่อประเภท', source: 'name' },
  { label: 'จำนวนวัน/ปี', source: 'maxDaysPerYearLabel' },
  {
    label: 'การดำเนินการ',
    render: (row: Record<string, unknown>) => (
      <IconButton
        size="small"
        color="error"
        onClick={e => {
          e.stopPropagation()
          ;(row._onDelete as () => void)?.()
        }}
        aria-label="ลบ"
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    ),
  },
]

const LeaveTypesPage = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const user = useRecoilValue(authUserState)
  const [types, setTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [maxDaysPerYear, setMaxDaysPerYear] = useState<number>(0)

  const canManage = user?.role === 'PEOPLE' || user?.role === 'ADMIN'

  const loadTypes = useCallback(async () => {
    try {
      const list = await getListLeaveTypes()
      setTypes(list)
    } catch {
      enqueueSnackbar('โหลดประเภทการลาไม่สำเร็จ', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar])

  useEffect(() => {
    if (!canManage) {
      navigate('/', { replace: true })
      return
    }
    void loadTypes()
  }, [canManage, navigate, loadTypes])

  const handleOpenCreate = () => {
    setEditingId(null)
    setCode('')
    setName('')
    setMaxDaysPerYear(0)
    setOpen(true)
  }

  const handleOpenEdit = (row: LeaveType) => {
    setEditingId(row.id)
    setCode(row.code)
    setName(row.name)
    setMaxDaysPerYear(row.maxDaysPerYear ?? 0)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      enqueueSnackbar('กรุณากรอกรหัสและชื่อ', { variant: 'warning' })
      return
    }
    try {
      if (editingId) {
        await updateLeaveType(editingId, {
          code: code.trim(),
          name: name.trim(),
          maxDaysPerYear: maxDaysPerYear < 0 ? 0 : maxDaysPerYear,
        })
        enqueueSnackbar('บันทึกแล้ว', { variant: 'success' })
      } else {
        await createLeaveType({
          code: code.trim(),
          name: name.trim(),
          maxDaysPerYear: maxDaysPerYear < 0 ? 0 : maxDaysPerYear,
        })
        enqueueSnackbar('เพิ่มประเภทการลาแล้ว', { variant: 'success' })
      }
      setOpen(false)
      void loadTypes()
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e && (e.response as { data?: unknown })?.data
      enqueueSnackbar(msg ? String(msg) : 'ดำเนินการไม่สำเร็จ', { variant: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLeaveType(id)
      enqueueSnackbar('ลบแล้ว', { variant: 'success' })
      void loadTypes()
    } catch {
      enqueueSnackbar('ลบไม่สำเร็จ (อาจมีการลาใช้ประเภทนี้อยู่)', { variant: 'error' })
    }
  }

  if (!canManage) return null

  const tableData = types.map(t => ({
    id: t.id,
    code: t.code,
    name: t.name,
    maxDaysPerYearLabel: (t.maxDaysPerYear ?? 0) > 0 ? `${t.maxDaysPerYear} วัน/ปี` : 'ไม่จำกัด',
    _onDelete: () => handleDelete(t.id),
  }))

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <strong>จัดการประเภทการลา</strong>
          <Button variant="contained" onClick={handleOpenCreate}>
            เพิ่มประเภทการลา
          </Button>
        </Stack>
        {!loading && (
          <Table
            columns={COLUMNS}
            data={tableData}
            rowClick={id => {
              const t = id ? types.find(x => x.id === id) : undefined
              if (t) handleOpenEdit(t)
            }}
          />
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'แก้ไขประเภทการลา' : 'เพิ่มประเภทการลา'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="รหัส (เช่น SICK_LEAVE)"
              value={code}
              onChange={e => setCode(e.target.value)}
              fullWidth
              disabled={!!editingId}
            />
            <TextField
              label="ชื่อประเภท"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="จำนวนวันต่อปี (0 = ไม่จำกัด)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={maxDaysPerYear}
              onChange={e => setMaxDaysPerYear(Math.max(0, parseInt(e.target.value, 10) || 0))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LeaveTypesPage
