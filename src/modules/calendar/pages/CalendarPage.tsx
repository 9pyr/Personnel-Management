import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { createEvent, EVENT_TYPE_LABELS, getEvents, type GetEventsParams } from 'core/apis/events'
import type { Event } from 'core/apis/events/schemas'
import { getListLeave, type GetListLeaveParams } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'
import { getListUsers } from 'core/apis/auth'
import type { User } from 'core/apis/auth/types'
import { authUserState } from 'core/stores/auth'
import { useSnackbar } from 'notistack'
import _ from 'lodash'

import { eventsByDate, getMonthRange, leavesByDate } from '../utils/leaveByDate'

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

dayjs.locale('th')

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const FILTER_ALL = '__all__'

function formatMonthTitle(year: number, month: number): string {
  return dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY')
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const user = useRecoilValue(authUserState)

  const [year, setYear] = useState(() => dayjs().year())
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [filterUserId, setFilterUserId] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '',
    title: '',
    eventType: 'OTHER',
  })
  const [eventSubmitting, setEventSubmitting] = useState(false)

  const { from, to } = getMonthRange(year, month)
  const byDate = leavesByDate(leaves)
  const eventsByDay = eventsByDate(events)
  const today = dayjs().format('YYYY-MM-DD')

  const canListUsers = user?.role === 'ADMIN' || user?.role === 'PEOPLE'
  const fetchUsers = useCallback(async () => {
    if (!canListUsers) {
      setUsers([])
      return
    }
    try {
      const list = await getListUsers()
      setUsers(list)
    } catch {
      setUsers([])
    }
  }, [canListUsers])

  const fetchLeaves = useCallback(
    async (params: GetListLeaveParams) => {
      setLoading(true)
      try {
        const list = await getListLeave(params)
        setLeaves(list)
      } catch {
        enqueueSnackbar('โหลดข้อมูลการลาไม่สำเร็จ', { variant: 'error' })
        setLeaves([])
      } finally {
        setLoading(false)
      }
    },
    [enqueueSnackbar]
  )

  const fetchEvents = useCallback(
    async (params: GetEventsParams) => {
      try {
        const list = await getEvents(params)
        setEvents(list)
      } catch {
        enqueueSnackbar('โหลดข้อมูลงาน/เหตุการณ์ไม่สำเร็จ', { variant: 'error' })
        setEvents([])
      }
    },
    [enqueueSnackbar]
  )

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const apiUserId = filterUserId === '' || filterUserId === FILTER_ALL ? undefined : filterUserId
  useEffect(() => {
    void fetchLeaves({
      from,
      to,
      userId: apiUserId,
    })
  }, [from, to, apiUserId, fetchLeaves])

  useEffect(() => {
    void fetchEvents({
      from,
      to,
      userId: apiUserId,
    })
  }, [from, to, apiUserId, fetchEvents])

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()
  const calendarRows: (string | null)[][] = []
  let row: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) {
    row.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    if (row.length === 7) {
      calendarRows.push(row)
      row = []
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null)
    calendarRows.push(row)
  }

  const todayLeaves = byDate.get(today) ?? []
  const todayEvents = eventsByDay.get(today) ?? []
  const pendingInList = leaves.filter(l => (l.status ?? '') === 'PENDING')

  const selectValue = filterUserId === '' ? FILTER_ALL : filterUserId
  const handleFilterChange = (value: string) => {
    setFilterUserId(value === FILTER_ALL ? '' : value)
  }

  const canAddEvent = user?.id && (filterUserId === '' || filterUserId === user.id)
  const handleOpenEventDialog = () => {
    setEventForm({
      date: today,
      startTime: '09:00',
      endTime: '',
      title: '',
      eventType: 'OTHER',
    })
    setEventDialogOpen(true)
  }
  const handleCreateEvent = async () => {
    const { date, startTime, endTime, title, eventType } = eventForm
    if (!title.trim()) {
      enqueueSnackbar('กรุณากรอกหัวข้อ', { variant: 'warning' })
      return
    }
    setEventSubmitting(true)
    try {
      await createEvent({
        date,
        startTime,
        endTime: endTime || undefined,
        title: title.trim(),
        eventType: eventType || undefined,
      })
      enqueueSnackbar('เพิ่มงานแล้ว', { variant: 'success' })
      setEventDialogOpen(false)
      void fetchEvents({ from, to, userId: apiUserId })
    } catch {
      enqueueSnackbar('เพิ่มงานไม่สำเร็จ', { variant: 'error' })
    } finally {
      setEventSubmitting(false)
    }
  }

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={600}>
          ปฏิทินการลา
        </Typography>

        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              งานวันนี้ · {dayjs().format('D MMMM YYYY')}
            </Typography>
            {(todayLeaves.length > 0 || todayEvents.length > 0) ? (
              <Stack spacing={1}>
                {todayLeaves.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      การลา
                    </Typography>
                    {todayLeaves.map(({ leave }) => {
                      const name = leave.createdByName ?? '—'
                      const status = leave.status ?? ''
                      const isMe = user?.id && leave.createdByUserId === user.id
                      return (
                        <Typography key={leave.id} variant="body2">
                          {name}
                          {isMe && (
                            <Typography component="span" color="primary.main" sx={{ ml: 1 }}>
                              (คุณ)
                            </Typography>
                          )}
                          {status === 'PENDING' && (
                            <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                              · รออนุมัติ
                            </Typography>
                          )}
                        </Typography>
                      )
                    })}
                  </>
                )}
                {todayEvents.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      งาน / เหตุการณ์
                    </Typography>
                    {todayEvents.map(ev => (
                      <Typography key={ev.id} variant="body2">
                        {ev.startTime}
                        {ev.endTime ? `–${ev.endTime}` : ''} {ev.title}
                        {ev.userName && (
                          <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({ev.userName})
                          </Typography>
                        )}
                      </Typography>
                    ))}
                  </>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                วันนี้ไม่มีรายการลาหรืองาน
              </Typography>
            )}
            {!_.isEmpty(pendingInList) && (
              <Typography
                variant="body2"
                sx={{ mt: 1.5, cursor: 'pointer' }}
                color="primary.main"
                onClick={() => navigate('/leave')}
              >
                คำขอลารอการดำเนินการ {pendingInList.length} รายการ →
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton size="small" onClick={goPrevMonth} aria-label="เดือนก่อน">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" component="span" sx={{ minWidth: 180, textAlign: 'center' }}>
                  {formatMonthTitle(year, month)}
                </Typography>
                <IconButton size="small" onClick={goNextMonth} aria-label="เดือนถัดไป">
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'primary.main', borderWidth: 1 },
                    '&.Mui-focused fieldset': { borderWidth: 1.5 },
                  },
                }}
              >
                <InputLabel id="calendar-user-filter">ดูการลาของ</InputLabel>
                <Select
                  labelId="calendar-user-filter"
                  value={selectValue}
                  label="ดูการลาของ"
                  onChange={e => handleFilterChange(e.target.value)}
                  displayEmpty={false}
                >
                  <MenuItem value={FILTER_ALL}>ทั้งหมด</MenuItem>
                  {user?.id && (
                    <MenuItem value={user.id}>ตัวฉัน</MenuItem>
                  )}
                  {users.map(u => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                      {u.department ? ` (${u.department})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {canAddEvent && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenEventDialog}
                >
                  เพิ่มงาน
                </Button>
              )}
            </Stack>

            {loading ? (
              <Typography color="text.secondary">กำลังโหลด...</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    '& td, & th': { border: 1, borderColor: 'divider', p: 0.5, verticalAlign: 'top' },
                    '& th': { bgcolor: 'action.hover', fontWeight: 600, fontSize: '0.75rem' },
                  }}
                >
                  <thead>
                    <tr>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <Box key={i} component="th" sx={{ width: '14.28%' }}>
                          {label}
                        </Box>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarRows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((date, ci) => {
                          if (!date) {
                            return (
                              <Box
                                key={ci}
                                component="td"
                                sx={{ minHeight: 80, bgcolor: 'action.hover' }}
                              />
                            )
                          }
                          const leaveItems = byDate.get(date) ?? []
                          const dayEvents = eventsByDay.get(date) ?? []
                          const isToday = date === today
                          return (
                            <Box
                              key={ci}
                              component="td"
                              sx={{
                                minHeight: 80,
                                bgcolor: isToday ? 'action.selected' : undefined,
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(date).date()}
                              </Typography>
                              <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                {leaveItems.slice(0, 2).map(({ leave: L }) => (
                                  <Typography
                                    key={`l-${L.id}`}
                                    variant="caption"
                                    display="block"
                                    noWrap
                                    title={`${L.createdByName ?? ''} ${(L.status ?? '') === 'PENDING' ? '(รออนุมัติ)' : ''}`}
                                    sx={{
                                      bgcolor: (L.status ?? '') === 'PENDING' ? 'warning.light' : 'primary.light',
                                      color: (L.status ?? '') === 'PENDING' ? 'warning.contrastText' : 'primary.contrastText',
                                      px: 0.5,
                                    }}
                                  >
                                    {(L.createdByName ?? '').slice(0, 8)}
                                  </Typography>
                                ))}
                                {dayEvents.slice(0, 2).map(ev => (
                                  <Typography
                                    key={`e-${ev.id}`}
                                    variant="caption"
                                    display="block"
                                    noWrap
                                    title={`${ev.startTime}${ev.endTime ? `-${ev.endTime}` : ''} ${ev.title} ${ev.userName ? `(${ev.userName})` : ''}`}
                                    sx={{
                                      bgcolor: 'secondary.light',
                                      color: 'secondary.contrastText',
                                      px: 0.5,
                                    }}
                                  >
                                    {ev.startTime} {(ev.title ?? '').slice(0, 6)}
                                  </Typography>
                                ))}
                                {(leaveItems.length + dayEvents.length) > 4 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{leaveItems.length + dayEvents.length - 4}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มงาน / เหตุการณ์</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="วันที่"
              type="date"
              value={eventForm.date}
              onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="เวลาเริ่ม"
                type="time"
                value={eventForm.startTime}
                onChange={e => setEventForm(f => ({ ...f, startTime: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="เวลาสิ้นสุด (ไม่บังคับ)"
                type="time"
                value={eventForm.endTime}
                onChange={e => setEventForm(f => ({ ...f, endTime: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Stack>
            <TextField
              label="หัวข้อ / รายละเอียด"
              value={eventForm.title}
              onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
              fullWidth
              placeholder="เช่น พบคนไข้, เฝ้าตรวจ, นัดผ่าตัด 09:00"
              required
            />
            <FormControl fullWidth>
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={eventForm.eventType}
                label="ประเภท"
                onChange={e => setEventForm(f => ({ ...f, eventType: e.target.value }))}
              >
                {EVENT_TYPE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleCreateEvent} disabled={eventSubmitting}>
            {eventSubmitting ? 'กำลังบันทึก...' : 'เพิ่มงาน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
