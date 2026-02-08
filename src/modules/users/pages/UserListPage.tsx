import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import Form from 'common/components/Form'
import Select, { type SelectOptionGroup } from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import Table, { type TableRowData } from 'common/components/Table'
import { createUser, getListUsers, updateUser } from 'core/apis/auth'
import {
  createUserRequestSchema,
  updateUserRequestSchema,
} from 'core/apis/auth/schemas'
import type { Role, User } from 'core/apis/auth/types'
import { AuthContext } from 'core/contexts/AuthContext'

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
  const filtered = excludeUserId
    ? users.filter(user => user.id !== excludeUserId)
    : users
  const noAssign = [{ groupLabel: 'ไม่ระบุ', options: [{ value: '', label: '-- ไม่ระบุ --' }] }]
  const byDept = DEPARTMENT_ORDER.map(department => ({
    groupLabel: department,
    options: filtered
      .filter(user => (user.department ?? '') === department)
      .map(user => ({ value: user.id, label: `${user.name} (${user.email}) — ${user.role}` })),
  })).filter(group => group.options.length > 0)
  const others = filtered.filter(
    user => !user.department || !DEPARTMENT_ORDER.includes(user.department)
  )
  const otherGroup =
    others.length > 0
      ? [
          {
            groupLabel: 'อื่นๆ',
            options: others.map(user => ({
              value: user.id,
              label: `${user.name} (${user.email}) — ${user.role}`,
            })),
          },
        ]
      : []
  return [...noAssign, ...byDept, ...otherGroup]
}

type TableColumnDef = { label: string; source?: string; render?: (row: TableRowData) => ReactNode }

const getColumns = (onEditApprover: (row: TableRowData) => void): TableColumnDef[] => [
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
        onClick={event => {
          event.stopPropagation()
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
  const currentUser = useContext(AuthContext)
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

  const tableData = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department ?? '',
    managerId: user.managerId ?? '',
    manager_name: users.find(manager => manager.id === user.managerId)?.name,
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
              setEditUser(users.find(user => user.id === row.id) ?? null)
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
              role: 'STAFF',
              department: '',
              managerId: '',
            }}
            onSubmit={async values => {
              const parsed = createUserRequestSchema.safeParse({
                email: values.email,
                password: values.password,
                name: values.name,
                role: values.role,
                department: values.department || undefined,
                managerId: values.role === 'STAFF' && values.managerId ? values.managerId : undefined,
              })
              if (!parsed.success) {
                toast.error(parsed.error.errors.map(e => e.message).join(', '))
                return
              }
              await createUser(parsed.data)
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
                const parsed = updateUserRequestSchema.safeParse({
                  role: values.role,
                  department: values.department,
                  managerId: values.managerId === '' ? undefined : values.managerId,
                })
                if (!parsed.success) {
                  toast.error(parsed.error.errors.map(e => e.message).join(', '))
                  return
                }
                await updateUser(editUser.id, parsed.data)
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
