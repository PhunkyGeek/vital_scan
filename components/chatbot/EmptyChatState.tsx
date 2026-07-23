import { MessageCircle } from 'lucide-react'

interface EmptyChatStateProps {
  isScreeningLinked: boolean
}

export function EmptyChatState({ isScreeningLinked }: EmptyChatStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 inline-block rounded-full bg-primary/10 p-4">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>

      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {isScreeningLinked
          ? "Ask me anything about your screening result. I'm here to help you understand it better."
          : 'Ask me questions about health screening, symptoms, or when to seek care.'}
      </p>
    </div>
  )
}
