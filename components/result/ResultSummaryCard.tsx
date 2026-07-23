import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskBadge } from '@/components/result/RiskBadge'
import { Sparkles } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface ResultSummaryCardProps {
  screening: ScreeningWithResult
}

export function ResultSummaryCard({ screening }: ResultSummaryCardProps) {
  const aiResult = screening.ai_analysis_result
  const condition = screening.condition

  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI screening result</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {condition?.name || aiResult?.condition_name || 'Analysis complete'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {condition?.category || aiResult?.condition_category || 'General screening'}
            </p>
          </div>
          <RiskBadge level={screening.risk_level} />
        </div>

        {aiResult?.summary && (
          <p className="text-muted-foreground leading-relaxed">
            {aiResult.summary}
          </p>
        )}

        {screening.result?.confidence_score && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Confidence estimate:</span>
            <span className="font-medium text-foreground">
              {Math.round(screening.result.confidence_score * 100)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}