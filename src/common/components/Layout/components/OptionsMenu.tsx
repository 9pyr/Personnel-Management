import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { clearAuthStorage, useAuthActions } from 'core/stores/auth'
import { LogOut, MoreVertical } from 'lucide-react'

import MenuButton from './MenuButton'

export default function OptionsMenu() {
  const { clearAuth } = useAuthActions()

  const handleLogout = () => {
    clearAuthStorage()
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuButton
          aria-label="Open menu"
          className="rounded-full bg-muted/90 hover:bg-primary/15 hover:text-primary"
        >
          <MoreVertical className="h-5 w-5" />
        </MenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => window.location.assign('/profile')}>
          บัญชีของฉัน
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
