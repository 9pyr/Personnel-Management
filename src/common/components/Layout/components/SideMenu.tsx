import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useContext } from 'react'

import type { Role } from 'core/apis/auth/types'
import { AuthContext } from 'core/contexts/AuthContext'
import apiCaller from 'core/endpoints/apiCaller'

import MenuContent from './MenuContent'
import NotificationButton from './NotificationButton'
import OptionsMenu from './OptionsMenu'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'แอดมิน',
  PEOPLE: 'การบุคคล',
  MANAGER: 'หัวหน้า',
  STAFF: 'พนักงาน',
}

function UserProfileBlock() {
  const user = useContext(AuthContext)
  const avatarSrc = user?.profileImageUrl
    ? `${apiCaller.defaults.baseURL ?? ''}${user.profileImageUrl}`
    : undefined
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : null

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="flex flex-1 items-center gap-2">
        <NotificationButton />
        <div className="min-w-0 flex-1" />
        <OptionsMenu />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={avatarSrc} alt={user?.name ?? undefined} />
          <AvatarFallback>{user?.name?.charAt(0) ?? '?'}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold leading-tight">{user?.name ?? '-'}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email ?? '-'}</p>
          {roleLabel && (
            <Badge
              variant="secondary"
              className="mt-1 h-5 text-[10px] hover:bg-secondary hover:text-secondary-foreground"
            >
              {roleLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function SidebarContent() {
  return (
    <>
      <Separator className="bg-sidebar-border" />
      <MenuContent />
      <div className="mt-auto border-t border-sidebar-border">
        <UserProfileBlock />
      </div>
    </>
  )
}

export default function SideMenu() {
  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] flex-col border-r border-sidebar-border bg-sidebar-bg shadow-soft lg:flex"
    >
      <SidebarContent />
    </aside>
  )
}
