import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { CalendarItemEvent } from 'modules/calendar/types'
import { formatEventTooltip } from 'modules/calendar/utils/eventHelpers'

interface CalendarEventCellProps {
  event: CalendarItemEvent
}

export function CalendarEventCell({ event }: CalendarEventCellProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rbc-event-content cursor-pointer">{event.title}</div>
        </TooltipTrigger>
        <TooltipContent className="whitespace-pre-wrap text-xs leading-snug max-w-xs">
          {formatEventTooltip(event)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
