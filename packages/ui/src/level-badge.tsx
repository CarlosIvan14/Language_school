import * as React from 'react'
import { cn } from '@language-school/utils'
import type { SpanishLevel } from '@language-school/types'

const levelColors: Record<SpanishLevel, string> = {
  A1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  A2: 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
  B1: 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300',
  B2: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  C1: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  C2: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

interface LevelBadgeProps {
  level: SpanishLevel
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-medium rounded-full px-2.5 py-0.5',
        levelColors[level],
        className
      )}
    >
      {level}
    </span>
  )
}
