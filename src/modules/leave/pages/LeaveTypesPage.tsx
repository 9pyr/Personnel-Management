import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useCallback, useContext, useEffect, useState } from 'react'

import Table, { type TableRowData } from 'common/components/Table'
import {
  type LeaveType,
  createLeaveType,
  deleteLeaveType,
  getListLeaveTypes,
  updateLeaveType,
} from 'core/apis/leave/leaveTypes'
import { AuthContext } from 'core/contexts/AuthContext'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface ErrWithResponse {
  response?: { data?: object }
}

function isErrWithResponse(x: object): x is ErrWithResponse {
  return 'response' in x
}

const getColumns = (handleDelete: (id: string) => void) => [
  { label: 'รหัส', source: 'code' },
  { label: 'ชื่อประเภท', source: 'name' },
  { label: 'จำนวนวัน/ปี', source: 'maxDaysPerYearLabel' },
  {
    label: 'การดำเนินการ',
    render: (row: TableRowData) => (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={e => {
          e.stopPropagation()
          if (row.id) handleDelete(String(row.id))
        }}
        aria-label="ลบ"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
]

const LeaveTypesPage = () => {
  const navigate = useNavigate()
  const user = useContext(AuthContext)
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
      toast.error('โหลดประเภทการลาไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

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
      toast.warning('กรุณากรอกรหัสและชื่อ')
      return
    }
    try {
      if (editingId) {
        await updateLeaveType(editingId, {
          code: code.trim(),
          name: name.trim(),
          maxDaysPerYear: maxDaysPerYear < 0 ? 0 : maxDaysPerYear,
        })
        toast.success('บันทึกแล้ว')
      } else {
        await createLeaveType({
          code: code.trim(),
          name: name.trim(),
          maxDaysPerYear: maxDaysPerYear < 0 ? 0 : maxDaysPerYear,
        })
        toast.success('เพิ่มประเภทการลาแล้ว')
      }
      setOpen(false)
      void loadTypes()
    } catch (error) {
      let errorData: object | null = null
      if (error != null && typeof error === 'object' && isErrWithResponse(error)) {
        errorData = error.response?.data ?? null
      }
      toast.error(errorData != null ? String(errorData) : 'ดำเนินการไม่สำเร็จ')
    }
  }

  const handleDelete = async (leaveTypeId: string) => {
    try {
      await deleteLeaveType(leaveTypeId)
      toast.success('ลบแล้ว')
      void loadTypes()
    } catch {
      toast.error('ลบไม่สำเร็จ (อาจมีการลาใช้ประเภทนี้อยู่)')
    }
  }

  if (!canManage) return null

  const tableData: TableRowData[] = types.map(leaveType => ({
    id: leaveType.id,
    code: leaveType.code,
    name: leaveType.name,
    maxDaysPerYearLabel:
      (leaveType.maxDaysPerYear ?? 0) > 0 ? `${leaveType.maxDaysPerYear} วัน/ปี` : 'ไม่จำกัด',
  }))

  return (
    <div className="flex flex-col gap-4">
      <header className="page-header">
        <div>
          <h1 className="page-title">จัดการประเภทการลา</h1>
          <p className="page-description mt-0.5">กำหนดรหัส ชื่อ และจำนวนวันต่อปี</p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          เพิ่มประเภทการลา
        </Button>
      </header>
      {!loading && (
        <Table
          columns={getColumns(handleDelete)}
          data={tableData}
          rowClick={rowId => {
            const foundType = rowId ? types.find(typeItem => typeItem.id === rowId) : undefined
            if (foundType) handleOpenEdit(foundType)
          }}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'แก้ไขประเภทการลา' : 'เพิ่มประเภทการลา'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>รหัส (เช่น SICK_LEAVE)</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} disabled={!!editingId} />
            </div>
            <div className="grid gap-2">
              <Label>ชื่อประเภท</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>จำนวนวันต่อปี (0 = ไม่จำกัด)</Label>
              <Input
                type="number"
                min={0}
                value={maxDaysPerYear}
                onChange={e => setMaxDaysPerYear(Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeaveTypesPage
