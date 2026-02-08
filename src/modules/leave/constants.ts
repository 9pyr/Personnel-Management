export enum leaveReason {
  AnnualLeave = 'ANNUAL_LEAVE',
  SickLeave = 'SICK_LEAVE',
}

export enum leaveFields {
  leaveTypeId = 'leaveTypeId',
  reason = 'reason',
  startDate = 'startDate',
  endDate = 'endDate',
  description = 'description',
  status = 'status',
}

/** คีย์สถานะการลาตาม DB (ใช้ใน API / เงื่อนไข) */
export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const

export type LeaveStatusKey = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS]

const LEAVE_STATUS_LABELS: Record<string, string> = {
  [LEAVE_STATUS.PENDING]: 'รออนุมัติ',
  [LEAVE_STATUS.APPROVED]: 'อนุมัติแล้ว',
  [LEAVE_STATUS.REJECTED]: 'ไม่อนุมัติ',
  [LEAVE_STATUS.CANCELLED]: 'ยกเลิก',
}

/** แปลง key สถานะจาก DB เป็นข้อความภาษาไทยสำหรับแสดงผล */
export function getLeaveStatusLabel(statusKey: string | undefined | null): string {
  if (statusKey == null || statusKey === '') return ''
  return LEAVE_STATUS_LABELS[statusKey] ?? statusKey
}

/** variant ของ Badge ตามสถานะ (สำหรับใช้กับ LeaveStatusBadge) */
export type LeaveStatusBadgeVariant = 'pending' | 'approved' | 'rejected' | 'cancelled'

const LEAVE_STATUS_BADGE_VARIANT: Record<string, LeaveStatusBadgeVariant> = {
  [LEAVE_STATUS.PENDING]: 'pending',
  [LEAVE_STATUS.APPROVED]: 'approved',
  [LEAVE_STATUS.REJECTED]: 'rejected',
  [LEAVE_STATUS.CANCELLED]: 'cancelled',
}

export function getLeaveStatusBadgeVariant(
  statusKey: string | undefined | null
): LeaveStatusBadgeVariant | 'default' {
  if (statusKey == null || statusKey === '') return 'default'
  return LEAVE_STATUS_BADGE_VARIANT[statusKey] ?? 'default'
}
