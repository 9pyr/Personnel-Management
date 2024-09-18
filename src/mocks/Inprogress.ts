import { leaveReason } from 'modules/leave/constants'

export const mockLeave = [
  {
    id: '1',
    reason: leaveReason.AnnualLeave,
    dateFrom: '2024-09-18',
    dateTo: '2024-09-19',
    description: 'ฉันจะลาอะทำไม 1',
    status: 'inprogress',
  },
  {
    id: '2',
    reason: leaveReason.AnnualLeave,
    dateFrom: '2024-09-18',
    dateTo: '2024-09-19',
    description: 'ฉันจะลาอะทำไม 2',
    status: 'inprogress',
  },
]
