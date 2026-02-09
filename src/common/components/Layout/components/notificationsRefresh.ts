export const NOTIFICATIONS_REFRESH_EVENT = 'notifications-refresh'

export function dispatchNotificationsRefresh(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
  }
}
