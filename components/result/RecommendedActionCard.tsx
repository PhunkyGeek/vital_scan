import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface RecommendedActionCardProps {
  screening: ScreeningWithResult
}

export function RecommendedActionCard({ screening }: RecommendedActionCardProps) {
  const aiResult = screening.ai_analysis_result

  const action = aiResult?.recommended_action

  if (!action) return null

  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ArrowRight className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Recommended next action</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-muted-foreground leading-relaxed">
          {action}
        </p>
      </CardContent>
    </Card>
  )
}