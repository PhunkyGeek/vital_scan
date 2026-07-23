import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RiskBadgeProps {
  level: string
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const variants = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    high: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    urgent: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  }

  const labels = {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk',
    urgent: 'Urgent care needed',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize border',
        variants[level as keyof typeof variants] || variants.low,
        className
      )}
    >
      {labels[level as keyof typeof labels] || 'Unknown risk'}
    </Badge>
  )
}