import { getListLeave } from 'core/apis/leave'
import type { Leave } from 'core/apis/leave/types'

export async function fetchLeaveList(): Promise<Leave[]> {
  return getListLeave()
}
