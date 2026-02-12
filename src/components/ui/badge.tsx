import { cn } from '@/lib/utils'

import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        pending:
          'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
        approved:
          'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
        rejected:
          'border-red-500/50 bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-300',
        cancelled: 'border-muted bg-muted/80 text-muted-foreground dark:bg-muted/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components -- badgeVariants is shared for composition
export { Badge, badgeVariants }
