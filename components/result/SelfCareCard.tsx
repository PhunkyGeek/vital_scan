import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface SelfCareCardProps {
  screening: ScreeningWithResult
}

export function SelfCareCard({ screening }: SelfCareCardProps) {
  const aiResult = screening.ai_analysis_result

  const selfCare = aiResult?.self_care || []

  if (!selfCare.length) return null

  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Self-care suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground mb-4">
          These are general suggestions for comfort and monitoring. They are not medical advice.
        </p>
        <ul className="space-y-3">
          {selfCare.map((item: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}