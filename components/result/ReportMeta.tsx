import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import type { ScreeningWithResult } from '@/lib/data/screenings'

interface ReportMetaProps {
  screening: ScreeningWithResult
}

export function ReportMeta({ screening }: ReportMetaProps) {
  const createdAt = new Date(screening.created_at)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">AI Screening Report</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Possible condition overview
        </h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          This is an AI-assisted screening result for educational purposes only. Not a medical diagnosis.
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(createdAt, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{format(createdAt, 'h:mm a')}</span>
        </div>
        <div className="rounded-lg bg-muted px-3 py-1 text-xs font-medium capitalize">
          {screening.body_area}
        </div>
      </div>
    </div>
  )
}