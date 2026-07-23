import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Scan, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface FollowUpActionsProps {
  screeningId: string
}

export function FollowUpActions({ screeningId }: FollowUpActionsProps) {
  return (
    <Card className="w-full rounded-3xl border border-muted-foreground/15 bg-card/95 p-5 shadow-sm sm:p-6 lg:p-8">
      <CardHeader>
        <CardTitle className="mb-5 text-xl font-semibold leading-snug sm:text-2xl">
          What would you like to do next?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col gap-3 pt-2 sm:gap-4">
        <Link href={`/chatbot?screening=${screeningId}`}>
          <Button className="flex w-full min-h-[48px] items-center justify-center gap-2 px-4 py-3" size="lg">
            <MessageSquare className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words text-center whitespace-normal">
              Ask AI Assistant About This Result
            </span>
          </Button>
        </Link>

        <Link href="/scan">
          <Button variant="outline" className="flex w-full min-h-[48px] items-center justify-center gap-2 px-4 py-3" size="lg">
            <Scan className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words text-center whitespace-normal">
              Start New Scan
            </span>
          </Button>
        </Link>

        <Link href="/library">
          <Button variant="outline" className="flex w-full min-h-[48px] items-center justify-center gap-2 px-4 py-3" size="lg">
            <BookOpen className="h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words text-center whitespace-normal">
              Explore Condition Library
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}