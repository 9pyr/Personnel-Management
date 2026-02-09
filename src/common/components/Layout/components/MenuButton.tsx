import { Button } from '@/components/ui/button'

import * as React from 'react'

export interface MenuButtonProps extends React.ComponentProps<typeof Button> {
  showBadge?: boolean
}

const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ showBadge, className, children, ...props }, ref) => {
    void showBadge
    return (
      <Button ref={ref} variant="ghost" size="icon" className={className} {...props}>
        {children}
      </Button>
    )
  },
)
MenuButton.displayName = 'MenuButton'

export default MenuButton
