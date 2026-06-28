import * as React from 'react'
import { cn } from '@language-school/utils'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  subVariant?: 'default' | 'success' | 'danger'
  className?: string
}

export function KpiCard({ label, value, sub, subVariant = 'default', className }: KpiCardProps) {
  const subColor = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-destructive',
  }[subVariant]

  return (
    <div className={cn('bg-secondary rounded-md p-4', className)}>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      {sub && <p className={cn('text-xs mt-1', subColor)}>{sub}</p>}
    </div>
  )
}
