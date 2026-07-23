import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface RedFlagsCardProps {
  screening: ScreeningWithResult
}

export function RedFlagsCard({ screening }: RedFlagsCardProps) {
  const aiResult = screening.ai_analysis_result
  const condition = screening.condition

  const redFlags = condition?.emergency_indicators || aiResult?.red_flags || []

  if (!redFlags.length) return null

  return (
    <Card className="rounded-3xl border border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-800/50 p-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
            Red flags to watch for
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
          Seek immediate medical attention if you experience any of these symptoms.
        </p>
        <ul className="space-y-2">
          {redFlags.map((flag: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-sm text-orange-900 dark:text-orange-100">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-600 flex-shrink-0" />
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}