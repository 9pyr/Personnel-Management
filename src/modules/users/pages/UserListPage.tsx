import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import Form from 'common/components/Form'
import Select, { type SelectOptionGroup } from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import Table from 'common/components/Table'
import { createUser, getListUsers, updateUser } from 'core/apis/auth'
import type { CreateUserRequest, Role, User } from 'core/apis/auth/types'
import { authUserState } from 'core/stores/auth'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'การบุคคล (HR)', value: 'PEOPLE' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Staff', value: 'STAFF' },
]

const DEPARTMENT_OPTIONS = [
  { label: '-- ไม่ระบุ --', value: '' },
  { label: 'ฝ่ายบริหาร', value: 'ฝ่ายบริหาร' },
  { label: 'ฝ่ายบุคคล', value: 'ฝ่ายบุคคล' },
  { label: 'ฝ่ายการพยาบาล', value: 'ฝ่ายการพยาบาล' },
  { label: 'ฝ่ายการแพทย์', value: 'ฝ่ายการแพทย์' },
  { label: 'ฝ่ายบัญชี', value: 'ฝ่ายบัญชี' },
]

const DEPARTMENT_ORDER = ['ฝ่ายบริหาร', 'ฝ่ายบุคคล', 'ฝ่ายการพยาบาล', 'ฝ่ายการแพทย์', 'ฝ่ายบัญชี']

function buildApproverOptionGroups(
  users: User[],
  excludeUserId?: string
): SelectOptionGroup[] {
  const filtered = excludeUserId ? users.filter(u => u.id !== excludeUserId) : users
  const noAssign = [{ groupLabel: 'ไม่ระบุ', options: [{ value: '', label: '-- ไม่ระบุ --' }] }]
  const byDept = DEPARTMENT_ORDER.map(dept => ({
    groupLabel: dept,
    options: filtered
      .filter(u => (u.department ?? '') === dept)
      .map(u => ({ value: u.id, label: `${u.name} (${u.email}) — ${u.role}` })),
  })).filter(g => g.options.length > 0)
  const others = filtered.filter(
    u => !u.department || !DEPARTMENT_ORDER.includes(u.department)
  )
  const otherGroup =
    others.length > 0
      ? [
          {
            groupLabel: 'อื่นๆ',
            options: others.map(u => ({
              value: u.id,
              label: `${u.name} (${u.email}) — ${u.role}`,
            })),
          },
        ]
      : []
  return [...noAssign, ...byDept, ...otherGroup]
}

type TableColumnDef = { label: string; source?: string; render?: (row: Record<string, unknown>) => ReactNode }

const getColumns = (onEditApprover: (row: Record<string, unknown>) => void): TableColumnDef[] => [
  { label: 'ชื่อ', source: 'name' },
  { label: 'อีเมล', source: 'email' },
  { label: 'บทบาท', source: 'role' },
  {
    label: 'แผนก/ฝ่าย',
    render: (row): ReactNode =>
      row.department != null ? String(row.department) : '-',
  },
  {
    label: 'ผู้มีสิทธิอนุมัติ',
    render: (row): ReactNode =>
      row.managerId ? String(row.manager_name ?? row.managerId) : '-',
  },
  {
    label: 'จัดการ',
    render: (row): ReactNode => (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="แก้ไขผู้มีสิทธิอนุมัติ"
        onClick={e => {
          e.stopPropagation()
          onEditApprover(row)
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    ),
  },
]

const UserListPage = () => {
  const navigate = useNavigate()
  const currentUser = useRecoilValue(authUserState)
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const list = await getListUsers()
      setUsers(list)
    } catch {
      toast.error('โหลดรายชื่อผู้ใช้ไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const allowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'PEOPLE'
    if (!allowed) {
      navigate('/', { replace: true })
      return
    }
    void fetchUsers()
  }, [currentUser?.role, navigate, fetchUsers])

  const allowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'PEOPLE'
  if (!allowed) {
    return null
  }

  const tableData = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department ?? '',
    managerId: u.managerId ?? '',
    manager_name: users.find(m => m.id === u.managerId)?.name,
  }))

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <strong>จัดการผู้ใช้</strong>
          <Button onClick={() => setOpen(true)}>เพิ่มผู้ใช้</Button>
        </div>
        {!loading && (
          <Table
            columns={getColumns(row =>
              setEditUser(users.find(u => u.id === row.id) ?? null)
            )}
            data={tableData}
            rowClick={() => {}}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
          </DialogHeader>
          <Form
            defaultValues={{
              email: '',
              password: '',
              name: '',
              role: 'STAFF' as Role,
              department: '',
              managerId: '',
            }}
            onSubmit={async values => {
              const payload: CreateUserRequest = {
                email: values.email as string,
                password: values.password as string,
                name: values.name as string,
                role: values.role as Role,
                department: (values.department as string) || undefined,
              }
              if (values.role === 'STAFF' && values.managerId) {
                payload.managerId = values.managerId as string
              }
              await createUser(payload)
              toast.success('เพิ่มผู้ใช้สำเร็จ')
              setOpen(false)
              void fetchUsers()
            }}
          >
            <div className="grid gap-4 py-4">
              <TextInput name="email" label="อีเมล" type="email" required />
              <TextInput name="password" label="รหัสผ่าน" type="password" required />
              <TextInput name="name" label="ชื่อ" required />
              <Select name="role" label="บทบาท" options={ROLE_OPTIONS} />
              <Select name="department" label="แผนก/ฝ่าย" options={DEPARTMENT_OPTIONS} />
              <Select
                name="managerId"
                label="ผู้มีสิทธิอนุมัติ (สำหรับ Staff)"
                options={[]}
                optionGroups={buildApproverOptionGroups(users)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
          </DialogHeader>
          {editUser && (
            <Form
              key={editUser.id}
              defaultValues={{
                role: editUser.role,
                department: editUser.department ?? '',
                managerId: editUser.managerId ?? '',
              }}
              onSubmit={async values => {
                await updateUser(editUser.id, {
                  role: values.role as Role,
                  department: values.department as string,
                  managerId: values.managerId === '' ? '' : (values.managerId as string),
                })
                toast.success('บันทึกแล้ว')
                setEditUser(null)
                void fetchUsers()
              }}
            >
              <div className="grid gap-4 py-4">
                <p>
                  <strong>{editUser.name}</strong> — {editUser.email}
                </p>
                <Select name="role" label="บทบาท" options={ROLE_OPTIONS} />
                <Select name="department" label="แผนก/ฝ่าย" options={DEPARTMENT_OPTIONS} />
                <Select
                  name="managerId"
                  label="ผู้มีสิทธิอนุมัติ (สำหรับ Staff)"
                  options={[]}
                  optionGroups={buildApproverOptionGroups(users, editUser.id)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserListPage
