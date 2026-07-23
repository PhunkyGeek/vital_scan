import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, MessageCircle } from 'lucide-react'
import type { HistoryItem } from '@/lib/data/history'
import { RiskBadge, type RiskLevel } from '@/components/common/RiskBadge'

interface HistoryItemCardProps {
  item: HistoryItem
}

export function HistoryItemCard({ item }: HistoryItemCardProps) {
  const date = new Date(item.created_at)
  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-3 min-w-0">
          {/* Header with condition and risk */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-card-foreground truncate group-hover:text-primary transition-colors">
                {item.condition_name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.condition_category ? `${item.condition_category} • ` : ''}
                {item.body_area.charAt(0).toUpperCase() + item.body_area.slice(1)} • {timeAgo}
              </p>
            </div>
            <RiskBadge risk={item.risk_level as RiskLevel} />
          </div>

          {/* Summary */}
          {item.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.summary}
            </p>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-2 pt-2">
            {item.age_group && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                Age: {item.age_group}
              </span>
            )}
            {item.confidence_score && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground">
                Confidence: {Math.round(item.confidence_score * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
          <Link
            href={`/scan/${item.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">View</span>
          </Link>
          <Link
            href={`/chatbot?screening=${item.id}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm transition-all hover:bg-secondary/80 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ask</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
