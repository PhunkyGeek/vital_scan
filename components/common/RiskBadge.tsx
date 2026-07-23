import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface RiskBadgeProps {
  risk: RiskLevel
  className?: string
}

const riskConfig = {
  low: {
    label: 'Low Risk',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  medium: {
    label: 'Medium Risk',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  high: {
    label: 'High Risk',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const config = riskConfig[risk]

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}