import { getListLeave } from 'core/apis/leave'
import { LeaveRecordType } from 'core/apis/leave/types'

export async function fetchLeaveList(): Promise<LeaveRecordType[]> {
  return getListLeave()
}
