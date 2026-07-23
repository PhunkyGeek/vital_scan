import { AlertCircle } from 'lucide-react'
import type { Condition } from '@/lib/data/conditions'
import { RiskBadge, type RiskLevel } from '@/components/common/RiskBadge'

interface ConditionCardProps {
  condition: Condition
  onClick?: () => void
}

export function ConditionCard({ condition, onClick }: ConditionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative h-full rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {condition.name}
          </h3>
          <RiskBadge risk={condition.risk_level as RiskLevel} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {condition.overview}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
            {condition.category}
          </span>
          {condition.scan_count ? (
            <span className="text-xs px-2.5 py-1 rounded-md bg-secondary/10 text-secondary">{condition.scan_count} screens</span>
          ) : null}
          {condition.red_flags && condition.red_flags.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              Red Flags
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          {condition.common_signs?.length || 0} common signs
        </div>
      </div>
    </button>
  )
}
