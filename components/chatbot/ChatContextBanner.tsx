import { Info } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface ChatContextBannerProps {
  screening: ScreeningWithResult | null
}

export function ChatContextBanner({ screening }: ChatContextBannerProps) {
  if (!screening) {
    return null
  }

  const condition = screening.condition?.name || screening.ai_analysis_result?.condition_name
  const riskLevel = screening.risk_level

  return (
    <div className="border-b border-border bg-muted/30 px-4 sm:px-6 py-3">
      <div className="flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            This conversation is about your screening result
          </p>
          <p className="text-xs">
            Condition: <span className="font-medium">{condition}</span> •{' '}
            <span className="capitalize">{riskLevel} risk</span>
          </p>
        </div>
      </div>
    </div>
  )
}
