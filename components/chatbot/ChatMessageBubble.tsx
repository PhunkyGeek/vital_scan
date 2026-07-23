import { format } from 'date-fns'
import type { ChatMessage } from '@/lib/data/chat'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'
  const createdAt = new Date(message.created_at)
  const timeString = format(createdAt, 'h:mm a')

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
    >
      {/* Avatar bubble */}
      <div
        className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white ${
          isUser
            ? 'bg-primary'
            : 'bg-muted-foreground/40'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col gap-1 max-w-xs sm:max-w-sm md:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-muted-foreground rounded-tl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className={`text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}>
          {timeString}
        </span>
      </div>
    </div>
  )
}
