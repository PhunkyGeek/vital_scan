import { Button } from '@/components/ui/button'
import { MessageSquare, X } from 'lucide-react'

interface ChatHeaderProps {
  isScreeningLinked: boolean
  onClose?: () => void
}

export function ChatHeader({ isScreeningLinked, onClose }: ChatHeaderProps) {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Health Assistant</h1>
            <p className="text-xs text-muted-foreground">
              {isScreeningLinked ? 'Screening Discussion' : 'General Health Chat'}
            </p>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
