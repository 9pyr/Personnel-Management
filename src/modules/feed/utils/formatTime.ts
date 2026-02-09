import dayjs from 'dayjs'
import 'dayjs/locale/th'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('th')

export function formatPostTime(iso: string): string {
  const date = dayjs(iso)
  const diffDays = dayjs().diff(date, 'day')
  if (diffDays === 0) return date.fromNow()
  if (diffDays < 7) return date.fromNow()
  return date.format('D MMM YYYY, HH:mm')
}
