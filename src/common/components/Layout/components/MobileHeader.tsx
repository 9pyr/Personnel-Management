import { Button } from '@/components/ui/button'

import { Menu } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-sidebar-border bg-sidebar-bg px-4 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="เปิดเมนู"
        className="shrink-0 rounded-full bg-muted/90 hover:bg-primary/15 hover:text-primary"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <span className="truncate text-sm font-semibold text-foreground">ระบบจัดการบุคคล</span>
    </header>
  )
}
