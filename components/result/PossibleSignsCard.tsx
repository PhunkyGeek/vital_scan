import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListChecks } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface PossibleSignsCardProps {
  screening: ScreeningWithResult
}

export function PossibleSignsCard({ screening }: PossibleSignsCardProps) {
  const aiResult = screening.ai_analysis_result
  const condition = screening.condition

  const signs = condition?.symptoms || aiResult?.possible_signs || []

  if (!signs.length) return null

  return (
    <Card className="rounded-3xl border border-muted-foreground/15 bg-card/95 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ListChecks className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Possible signs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ul className="space-y-2">
          {signs.map((sign: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}