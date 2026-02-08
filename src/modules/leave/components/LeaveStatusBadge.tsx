import { Badge } from '@/components/ui/badge'

import { getLeaveStatusBadgeVariant, getLeaveStatusLabel } from '../constants'

interface LeaveStatusBadgeProps {
  statusKey: string | undefined | null
  className?: string
}

function LeaveStatusBadge({ statusKey, className }: LeaveStatusBadgeProps) {
  const label = getLeaveStatusLabel(statusKey)
  const variant = getLeaveStatusBadgeVariant(statusKey)
  if (!label) return null
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export default LeaveStatusBadge
