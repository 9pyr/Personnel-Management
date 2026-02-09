import { LogOut, MoreVertical } from 'lucide-react'

import { clearAuthStorage, useAuthActions } from 'core/stores/auth'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MenuButton from './MenuButton'

export default function OptionsMenu() {
  const { setToken, setUser, clearAuth } = useAuthActions()

  const handleLogout = () => {
    clearAuthStorage()
    clearAuth()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MenuButton aria-label="Open menu">
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
