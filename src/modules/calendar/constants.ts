import { EVENT_TYPE_LABELS } from 'core/apis/events'

export const FILTER_ALL = '__all__'

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const EVENT_STYLES = {
  BASE: {
    borderRadius: 9999,
    paddingInline: 12,
    paddingBlock: 4,
    fontSize: 12,
    fontWeight: 500,
  },
  HOLIDAY: { backgroundColor: '#e11d48', borderColor: '#be123c', color: '#fff' },
  WORK_EVENT: { backgroundColor: '#2563eb', borderColor: '#1d4ed8', color: '#fff' },
  LEAVE: { backgroundColor: '#f97316', borderColor: '#ea580c', color: '#fff' },
  OTHER: { backgroundColor: '#9ca3af', borderColor: '#6b7280', color: '#fff', opacity: 0.7 },
} as const
