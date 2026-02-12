import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ReactNode, useContext, useEffect, useState } from 'react'

import Form from 'common/components/Form'
import Select, { SelectOptionGroup } from 'common/components/Input/Select'
import TextInput from 'common/components/Input/Text'
import Table, { TableRowData } from 'common/components/Table'
import { useCreateUser, useListUsers, useUpdateUser } from 'core/apis/auth/queries'
import { createUserRequestSchema, updateUserRequestSchema } from 'core/apis/auth/schemas'
import { RoleType, UserType } from 'core/apis/auth/types'
import { AuthContext } from 'core/contexts/AuthContext'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const ROLE_OPTIONS: { label: string; value: RoleType }[] = [
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

function toTextOrDash(
  value: string | number | boolean | bigint | object | null | undefined,
): string {
  if (typeof value === 'string' && value.trim().length > 0) return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return String(value)
  return '-'
}

function buildApproverOptionGroups(users: UserType[], excludeUserId?: string): SelectOptionGroup[] {
  const filtered = excludeUserId ? users.filter(user => user.id !== excludeUserId) : users
  const noAssign = [{ groupLabel: 'ไม่ระบุ', options: [{ value: '', label: '-- ไม่ระบุ --' }] }]
  const byDept = DEPARTMENT_ORDER.map(department => ({
    groupLabel: department,
    options: filtered
      .filter(user => (user.department ?? '') === department)
      .map(user => ({ value: user.id, label: `${user.name} (${user.email}) — ${user.role}` })),
  })).filter(group => group.options.length > 0)
  const others = filtered.filter(
    user => !user.department || !DEPARTMENT_ORDER.includes(user.department),
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
    render: (row): ReactNode => toTextOrDash(row.department),
  },
  {
    label: 'ผู้มีสิทธิอนุมัติ',
    render: (row): ReactNode => toTextOrDash(row.managerName ?? row.managerId),
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
  const [open, setOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserType | null>(null)
  const usersQuery = useListUsers({
    enabled: currentUser?.role === 'ADMIN' || currentUser?.role === 'PEOPLE',
  })
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  const users = usersQuery.data ?? []
  const loading = usersQuery.isLoading

  useEffect(() => {
    const allowed = currentUser?.role === 'ADMIN' || currentUser?.role === 'PEOPLE'
    if (!allowed) {
      navigate('/', { replace: true })
    }
  }, [currentUser?.role, navigate])

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
    managerName: users.find(manager => manager.id === user.managerId)?.name,
  }))

  return (
    <div className="flex flex-col gap-4">
      <header className="page-header">
        <div>
          <h1 className="page-title">จัดการผู้ใช้</h1>
          <p className="page-description mt-0.5">เพิ่มและแก้ไขผู้ใช้ในระบบ</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          เพิ่มผู้ใช้
        </Button>
      </header>
      {!loading && (
        <Table
          columns={getColumns(row => setEditUser(users.find(user => user.id === row.id) ?? null))}
          data={tableData}
          rowClick={() => {}}
        />
      )}

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
                managerId:
                  values.role === 'STAFF' && values.managerId ? values.managerId : undefined,
              })
              if (!parsed.success) {
                toast.error(parsed.error.errors.map(errItem => errItem.message).join(', '))
                return
              }
              await createUserMutation.mutateAsync(parsed.data)
              toast.success('เพิ่มผู้ใช้สำเร็จ')
              setOpen(false)
              await usersQuery.refetch()
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
                  toast.error(parsed.error.errors.map(errItem => errItem.message).join(', '))
                  return
                }
                await updateUserMutation.mutateAsync({ id: editUser.id, ...parsed.data })
                toast.success('บันทึกแล้ว')
                setEditUser(null)
                await usersQuery.refetch()
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
